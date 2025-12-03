// Referenced from javascript_log_in_with_replit blueprint
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, type UpsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";

// Check if we're using Replit authentication
const isReplitAuth = !!process.env.REPL_ID && process.env.REPL_ID !== "local-dev";

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const userData: UpsertUser = {
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  };

  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only set up Replit auth if we're on Replit
  if (isReplitAuth) {
    if (!process.env.REPLIT_DOMAINS) {
      throw new Error("Environment variable REPLIT_DOMAINS not provided for Replit auth");
    }

    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  } else {
    // For non-Replit deployments, use Local Strategy (email/password)
    passport.use(new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, email)
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          if (!user.password) {
            return done(null, false, { message: 'Please use social login for this account' });
          }

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Don't include password in session
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    ));

    passport.serializeUser((user: any, cb) => cb(null, user.id));
    passport.deserializeUser(async (id: string, cb) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.id, id)
        });
        if (!user) {
          return cb(new Error('User not found'));
        }
        const { password: _, ...userWithoutPassword } = user;
        cb(null, userWithoutPassword);
      } catch (error) {
        cb(error);
      }
    });

    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 5, // Limit each IP to 5 login requests per windowMs
      message: "Too many login attempts from this IP, please try again after 15 minutes",
      standardHeaders: true,
      legacyHeaders: false,
    });

    const signupLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      limit: 5, // Limit each IP to 5 accounts per hour
      message: "Too many accounts created from this IP, please try again after an hour",
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Signup endpoint
    app.post("/api/signup", signupLimiter, async (req, res) => {
      try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (existingUser) {
          return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const [newUser] = await db.insert(users).values({
          email,
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
        }).returning();

        // Log them in
        const { password: _, ...userWithoutPassword } = newUser;
        req.login(userWithoutPassword, (err) => {
          if (err) {
            return res.status(500).json({ message: "Error logging in after signup" });
          }
          res.status(201).json(userWithoutPassword);
        });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    });

    // Login endpoint
    app.post("/api/login", loginLimiter, (req, res, next) => {
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || 'Authentication failed' });
        }
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          res.json(user);
        });
      })(req, res, next);
    });

    app.get("/api/callback", (req, res) => {
      res.status(501).json({
        message: "OAuth callback not configured. Use /api/login for email/password authentication."
      });
    });

    app.post("/api/logout", (req, res) => {
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging out" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check if user is authenticated via passport
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;

  // For Replit auth, check token expiration and refresh if needed
  if (isReplitAuth && user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now > user.expires_at) {
      const refreshToken = user.refresh_token;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
  }

  // For local auth, user is already authenticated via session
  return next();
};

// Helper function to get user ID from request (works for both Replit and Local auth)
export function getUserId(req: any): string {
  const user = req.user;
  if (!user) {
    throw new Error("User not authenticated");
  }
  // Replit auth stores user in claims.sub
  if (user.claims?.sub) {
    return user.claims.sub;
  }
  // Local auth stores user directly
  if (user.id) {
    return user.id;
  }
  throw new Error("Unable to determine user ID");
}

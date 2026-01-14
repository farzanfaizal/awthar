import { config } from "dotenv";

config();

/**
 * Validates that all required environment variables are set
 * Fails fast on startup if any required variable is missing
 */
function validateEnv() {
  const required = [
    "DATABASE_URL",
    "SESSION_SECRET",
    "SUPABASE_ENDPOINT",
    "SUPABASE_ACCESS_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_BUCKET",
  ];

  const missing: string[] = [];
  const weak: string[] = [];

  for (const key of required) {
    const value = process.env[key];

    if (!value) {
      missing.push(key);
      continue;
    }

    // Check for weak/default values
    if (key === "SESSION_SECRET") {
      if (value.length < 32) {
        weak.push(`${key} (must be at least 32 characters)`);
      }
      if (
        value.includes("change-this") ||
        value.includes("your-secret") ||
        value === "awthar-marketplace-secret-key-change-in-production"
      ) {
        weak.push(`${key} (using default/weak value)`);
      }
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nPlease check .env.example for reference");
    process.exit(1);
  }

  if (weak.length > 0) {
    console.error("⚠️  Weak or default environment variables detected:");
    weak.forEach((msg) => console.error(`   - ${msg}`));
    if (process.env.NODE_ENV === "production") {
      console.error("\n❌ Cannot start in production with weak secrets");
      process.exit(1);
    } else {
      console.warn("\n⚠️  Warning: Using weak secrets in development");
    }
  }
}

// Validate environment variables on module load
validateEnv();

// Export typed environment configuration
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  SESSION_SECRET: process.env.SESSION_SECRET!,
  REPLIT_DOMAINS: process.env.REPLIT_DOMAINS || "localhost:5000",
  REPL_ID: process.env.REPL_ID || "local-dev",
  SUPABASE_ENDPOINT: process.env.SUPABASE_ENDPOINT!,
  SUPABASE_REGION: process.env.SUPABASE_REGION || "ap-northeast-1",
  SUPABASE_ACCESS_KEY: process.env.SUPABASE_ACCESS_KEY!,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY!,
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET!,
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  SENTRY_DSN: process.env.SENTRY_DSN,
} as const;

export type Env = typeof env;

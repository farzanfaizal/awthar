import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

interface SignUpMetadata {
  firstName?: string;
  lastName?: string;
  role?: "customer" | "provider";
}

interface AuthContextType {
  /** Supabase user object */
  supabaseUser: User | null;
  /** Current session with access token */
  session: Session | null;
  /** Loading state during auth initialization */
  isLoading: boolean;
  /** Sign up with email and password */
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<void>;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign in with Google OAuth */
  signInWithGoogle: () => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Request password reset email */
  resetPassword: (email: string) => Promise<void>;
  /** Update password (when user has reset token) */
  updatePassword: (newPassword: string) => Promise<void>;
  /** Resend verification email */
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        setIsLoading(false);

        // Invalidate user query on auth change
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }

        // Clear all queries on sign out
        if (event === "SIGNED_OUT") {
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signUp = useCallback(
    async (email: string, password: string, metadata?: SignUpMetadata) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata
              ? `${metadata.firstName || ""} ${metadata.lastName || ""}`.trim()
              : undefined,
            role: metadata?.role || "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    queryClient.clear();
  }, [queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!supabaseUser?.email) {
      throw new Error("No user email found");
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: supabaseUser.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, [supabaseUser?.email]);

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
        session,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access Supabase authentication functions
 */
export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
}

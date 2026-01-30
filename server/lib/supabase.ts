import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

/**
 * Supabase Admin Client
 * Uses service role key for server-side operations
 * Has full access to auth.users and bypasses RLS
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase Client with anon key
 * For operations that should respect RLS policies
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

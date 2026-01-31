CREATE TYPE "public"."auth_provider" AS ENUM('email', 'google', 'apple', 'github');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "supabase_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider" "auth_provider" DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_supabase_id_unique" UNIQUE("supabase_id");
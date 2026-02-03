CREATE TABLE "locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"emirate" varchar(100) NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "payment_methods" text[];--> statement-breakpoint
CREATE INDEX "locations_emirate_idx" ON "locations" USING btree ("emirate");--> statement-breakpoint
CREATE INDEX "locations_popular_idx" ON "locations" USING btree ("popular");
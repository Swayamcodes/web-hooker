CREATE TABLE "endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text DEFAULT 'My Endpoint' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint_id" text NOT NULL,
	"method" text NOT NULL,
	"headers" jsonb NOT NULL,
	"body" jsonb,
	"query" jsonb NOT NULL,
	"ip" text,
	"size" integer DEFAULT 0 NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_endpoint_id_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "requests_endpoint_id_idx" ON "requests" USING btree ("endpoint_id");
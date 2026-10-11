CREATE TABLE "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"note_date" date NOT NULL,
	"body" text,
	"draft_body" text,
	"saved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verse" (
	"reference" text PRIMARY KEY NOT NULL,
	"book" text NOT NULL,
	"chapter" integer NOT NULL,
	"verse_start" integer NOT NULL,
	"verse_end" integer NOT NULL,
	"text" text NOT NULL,
	"translation" text DEFAULT 'KJV' NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "note_user_date_uq" ON "note" USING btree ("user_id","note_date");--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade;

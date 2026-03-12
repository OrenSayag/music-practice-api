CREATE TABLE "session_recordings" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"file_name" text NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"s3_key" text NOT NULL,
	"mime_type" text DEFAULT 'audio/webm' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;
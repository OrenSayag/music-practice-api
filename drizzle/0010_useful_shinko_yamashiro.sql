ALTER TABLE "users" ADD COLUMN "share_contacts" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "users" SET "share_contacts" = jsonb_build_array(jsonb_build_object(
	'id', gen_random_uuid()::text,
	'name', coalesce("teacher"->>'name', ''),
	'phone', coalesce("teacher"->>'phone', ''),
	'language', coalesce("teacher"->>'language', 'en'),
	'isDefault', true
)) WHERE "teacher" IS NOT NULL;

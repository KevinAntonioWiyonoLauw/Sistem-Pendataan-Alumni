import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'alumni');
  CREATE TYPE "public"."enum_alumni_pekerjaan_work_field" AS ENUM('akademisi', 'pemerintah', 'lembaga-pemerintah', 'wirausaha', 'swasta', 'konsultan', 'teknologi', 'keuangan', 'media', 'kesehatan', 'pendidikan', 'nonprofit', 'lainnya');
  CREATE TYPE "public"."enum_alumni_kontribusi_willing_to_help" AS ENUM('mentoring-career', 'magang-riset', 'beasiswa-studi', 'networking');
  CREATE TYPE "public"."enum_alumni_jejaring_contact_person_ready" AS ENUM('ya', 'tidak');
  CREATE TYPE "public"."enum_alumni_jejaring_alumni_officer_ready" AS ENUM('ya', 'tidak');
  CREATE TYPE "public"."enum_alumni_metadata_source" AS ENUM('manual', 'google-forms');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"alumni_id_id" integer,
  	"has_password" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "alumni_pekerjaan_work_field" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_alumni_pekerjaan_work_field",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "alumni_kontribusi_willing_to_help" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_alumni_kontribusi_willing_to_help",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "alumni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"batch" numeric NOT NULL,
  	"nim" varchar,
  	"kontak_location_city" varchar NOT NULL,
  	"kontak_location_country" varchar DEFAULT 'Indonesia' NOT NULL,
  	"kontak_phone" varchar NOT NULL,
  	"kontak_email" varchar NOT NULL,
  	"kontak_linkedin" varchar,
  	"pekerjaan_current_employer" varchar NOT NULL,
  	"pekerjaan_position" varchar NOT NULL,
  	"jejaring_contact_person_ready" "enum_alumni_jejaring_contact_person_ready" NOT NULL,
  	"jejaring_alumni_officer_ready" "enum_alumni_jejaring_alumni_officer_ready" NOT NULL,
  	"jejaring_other_contacts" varchar,
  	"kontribusi_help_topics" varchar,
  	"lainnya_suggestions" varchar,
  	"metadata_photo_id" integer,
  	"metadata_is_public" boolean DEFAULT true,
  	"metadata_source" "enum_alumni_metadata_source" DEFAULT 'manual',
  	"metadata_google_forms_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"alumni_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_alumni_id_id_alumni_id_fk" FOREIGN KEY ("alumni_id_id") REFERENCES "public"."alumni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "alumni_pekerjaan_work_field" ADD CONSTRAINT "alumni_pekerjaan_work_field_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "alumni_kontribusi_willing_to_help" ADD CONSTRAINT "alumni_kontribusi_willing_to_help_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "alumni" ADD CONSTRAINT "alumni_metadata_photo_id_media_id_fk" FOREIGN KEY ("metadata_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_alumni_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_alumni_id_idx" ON "users" USING btree ("alumni_id_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "alumni_pekerjaan_work_field_order_idx" ON "alumni_pekerjaan_work_field" USING btree ("order");
  CREATE INDEX "alumni_pekerjaan_work_field_parent_idx" ON "alumni_pekerjaan_work_field" USING btree ("parent_id");
  CREATE INDEX "alumni_kontribusi_willing_to_help_order_idx" ON "alumni_kontribusi_willing_to_help" USING btree ("order");
  CREATE INDEX "alumni_kontribusi_willing_to_help_parent_idx" ON "alumni_kontribusi_willing_to_help" USING btree ("parent_id");
  CREATE INDEX "alumni_name_idx" ON "alumni" USING btree ("name");
  CREATE INDEX "alumni_batch_idx" ON "alumni" USING btree ("batch");
  CREATE UNIQUE INDEX "alumni_kontak_kontak_email_idx" ON "alumni" USING btree ("kontak_email");
  CREATE INDEX "alumni_metadata_metadata_photo_idx" ON "alumni" USING btree ("metadata_photo_id");
  CREATE INDEX "alumni_metadata_metadata_is_public_idx" ON "alumni" USING btree ("metadata_is_public");
  CREATE INDEX "alumni_updated_at_idx" ON "alumni" USING btree ("updated_at");
  CREATE INDEX "alumni_created_at_idx" ON "alumni" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_alumni_id_idx" ON "payload_locked_documents_rels" USING btree ("alumni_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "alumni_pekerjaan_work_field" CASCADE;
  DROP TABLE "alumni_kontribusi_willing_to_help" CASCADE;
  DROP TABLE "alumni" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_alumni_pekerjaan_work_field";
  DROP TYPE "public"."enum_alumni_kontribusi_willing_to_help";
  DROP TYPE "public"."enum_alumni_jejaring_contact_person_ready";
  DROP TYPE "public"."enum_alumni_jejaring_alumni_officer_ready";
  DROP TYPE "public"."enum_alumni_metadata_source";`)
}

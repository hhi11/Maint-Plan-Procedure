CREATE TABLE "job_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"equipment_name" text NOT NULL,
	"equipment_model" text DEFAULT '' NOT NULL,
	"equipment_serial" text DEFAULT '' NOT NULL,
	"scope_of_work" text NOT NULL,
	"job_steps" json DEFAULT '[]'::json NOT NULL,
	"tools_required" text[] DEFAULT '{}' NOT NULL,
	"materials_required" text[] DEFAULT '{}' NOT NULL,
	"manpower_count" text DEFAULT '' NOT NULL,
	"skill_levels" text[] DEFAULT '{}' NOT NULL,
	"estimated_time" text DEFAULT '' NOT NULL,
	"safety_ppe" text[] DEFAULT '{}' NOT NULL,
	"safety_procedures" text[] DEFAULT '{}' NOT NULL,
	"safety_hazards" text[] DEFAULT '{}' NOT NULL,
	"best_practices" text DEFAULT '' NOT NULL,
	"recommendations" json DEFAULT '{"manuals":[],"procedures":[]}'::json NOT NULL,
	"applicable_codes" text[] DEFAULT '{}' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	CONSTRAINT "job_plans_plan_id_unique" UNIQUE("plan_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"date_created" timestamp DEFAULT now() NOT NULL,
	"generation_count" integer DEFAULT 0 NOT NULL,
	"is_admin" text DEFAULT 'false' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

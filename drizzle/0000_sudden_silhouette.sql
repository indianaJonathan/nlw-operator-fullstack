CREATE TYPE "public"."issue_severity_enum" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."language_enum" AS ENUM('javascript', 'typescript', 'python', 'java', 'sql', 'go', 'rust', 'ruby', 'php', 'c', 'cpp', 'csharp', 'swift', 'kotlin', 'html', 'css', 'shell', 'plaintext');--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"severity" "issue_severity_enum" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "language_enum" NOT NULL,
	"line_count" integer NOT NULL,
	"roast_mode" boolean DEFAULT true NOT NULL,
	"score" real NOT NULL,
	"verdict" text NOT NULL,
	"roast" text NOT NULL,
	"suggested_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_issues_submission" ON "issues" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_score" ON "submissions" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_submissions_created_at" ON "submissions" USING btree ("created_at" DESC NULLS LAST);
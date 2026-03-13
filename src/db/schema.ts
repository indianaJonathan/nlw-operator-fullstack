import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language_enum", [
  "javascript",
  "typescript",
  "python",
  "java",
  "sql",
  "go",
  "rust",
  "ruby",
  "php",
  "c",
  "cpp",
  "csharp",
  "swift",
  "kotlin",
  "html",
  "css",
  "shell",
  "plaintext",
]);

export const issueSeverityEnum = pgEnum("issue_severity_enum", [
  "critical",
  "warning",
  "good",
]);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    language: languageEnum().notNull(),
    lineCount: integer().notNull(),
    roastMode: boolean().notNull().default(true),
    score: real().notNull(),
    verdict: text().notNull(),
    roast: text().notNull(),
    suggestedCode: text(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    index("idx_submissions_score").on(t.score.asc()),
    index("idx_submissions_created_at").on(t.createdAt.desc()),
  ],
);

export const issues = pgTable(
  "issues",
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid()
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    severity: issueSeverityEnum().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    order: integer().notNull(),
  },
  (t) => [index("idx_issues_submission").on(t.submissionId)],
);

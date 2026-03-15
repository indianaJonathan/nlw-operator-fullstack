import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ── Auth.js tables ──────────────────────────────────────────────────
// Column names use snake_case to match the Drizzle adapter's expected
// type signatures. The Drizzle client casing config handles DB mapping.

export const users = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique().notNull(),
  emailVerified: timestamp({ mode: "date" }),
  image: text(),
  username: text(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ── App enums ───────────────────────────────────────────────────────

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

// ── App tables ──────────────────────────────────────────────────────

export const submissions = pgTable(
  "submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: text().notNull(),
    language: languageEnum().notNull(),
    lineCount: integer().notNull(),
    roastMode: boolean().notNull().default(true),
    anonymous: boolean().notNull().default(false),
    score: real().notNull(),
    verdict: text().notNull(),
    roast: text().notNull(),
    suggestedCode: text(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    index("idx_submissions_score").on(t.score.asc()),
    index("idx_submissions_created_at").on(t.createdAt.desc()),
    index("idx_submissions_user_id").on(t.userId),
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

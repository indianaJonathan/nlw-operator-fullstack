import { TRPCError } from "@trpc/server";
import { asc, avg, count, eq } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { z } from "zod/v4";
import { db } from "@/db";
import { issues, languageEnum, submissions } from "@/db/schema";
import { analyzeCode } from "@/lib/analyze-code";
import { baseProcedure, createTRPCRouter } from "../init";

const ONE_HOUR = 3600;
const ONE_DAY = 86400;

async function queryStats() {
  "use cache";
  cacheLife({ stale: ONE_HOUR, revalidate: ONE_HOUR, expire: ONE_DAY });
  cacheTag("submission-stats");

  const [result] = await db
    .select({
      count: count(),
      avgScore: avg(submissions.score),
    })
    .from(submissions);

  return {
    count: result?.count ?? 0,
    avgScore: Number(result?.avgScore ?? 0),
  };
}

async function queryLeaderboardPreview() {
  "use cache";
  cacheLife({ stale: ONE_HOUR, revalidate: ONE_HOUR, expire: ONE_DAY });
  cacheTag("leaderboard-preview");

  return db
    .select({
      id: submissions.id,
      code: submissions.code,
      language: submissions.language,
      score: submissions.score,
    })
    .from(submissions)
    .orderBy(asc(submissions.score))
    .limit(3);
}

async function queryLeaderboard() {
  "use cache";
  cacheLife({ stale: ONE_HOUR, revalidate: ONE_HOUR, expire: ONE_DAY });
  cacheTag("leaderboard");

  return db
    .select({
      id: submissions.id,
      code: submissions.code,
      language: submissions.language,
      lineCount: submissions.lineCount,
      score: submissions.score,
    })
    .from(submissions)
    .orderBy(asc(submissions.score))
    .limit(20);
}

async function queryById(id: string) {
  "use cache";
  cacheLife({ stale: ONE_HOUR, revalidate: ONE_HOUR, expire: ONE_DAY });
  cacheTag(`submission-${id}`);

  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!submission) return null;

  const issueList = await db
    .select()
    .from(issues)
    .where(eq(issues.submissionId, id))
    .orderBy(asc(issues.order));

  return { ...submission, issues: issueList };
}

export const submissionRouter = createTRPCRouter({
  getStats: baseProcedure.query(() => queryStats()),

  getLeaderboardPreview: baseProcedure.query(() => queryLeaderboardPreview()),

  getLeaderboard: baseProcedure.query(() => queryLeaderboard()),

  getById: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(({ input }) => queryById(input.id)),

  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2500),
        language: z.enum(languageEnum.enumValues),
        roastMode: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      let analysis: Awaited<ReturnType<typeof analyzeCode>>;

      try {
        analysis = await analyzeCode({
          code: input.code,
          language: input.language,
          roastMode: input.roastMode,
        });
      } catch (err) {
        console.error("[submission.create] AI analysis failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to analyze your code. please try again later.",
        });
      }

      const lineCount = input.code.split("\n").length;

      try {
        const [submission] = await db.transaction(async (tx) => {
          const [sub] = await tx
            .insert(submissions)
            .values({
              code: input.code,
              language: input.language,
              lineCount,
              roastMode: input.roastMode,
              score: analysis.score,
              verdict: analysis.verdict,
              roast: analysis.roast,
              suggestedCode: analysis.suggestedCode,
            })
            .returning({ id: submissions.id });

          if (analysis.issues.length > 0) {
            await tx.insert(issues).values(
              analysis.issues.map((issue, i) => ({
                submissionId: sub.id,
                severity: issue.severity as "critical" | "warning" | "good",
                title: issue.title,
                description: issue.description,
                order: i + 1,
              })),
            );
          }

          return [sub];
        });

        revalidateTag("submission-stats", { expire: ONE_DAY });
        revalidateTag("leaderboard-preview", { expire: ONE_DAY });
        revalidateTag("leaderboard", { expire: ONE_DAY });

        return { id: submission.id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[submission.create] DB insert failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to save your roast. please try again later.",
        });
      }
    }),
});

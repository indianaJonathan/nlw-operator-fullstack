import { asc, avg, count } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { submissions } from "@/db/schema";
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

export const submissionRouter = createTRPCRouter({
  getStats: baseProcedure.query(() => queryStats()),

  getLeaderboardPreview: baseProcedure.query(() => queryLeaderboardPreview()),

  getLeaderboard: baseProcedure.query(() => queryLeaderboard()),
});

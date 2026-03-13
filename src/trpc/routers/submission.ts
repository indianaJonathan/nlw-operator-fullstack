import { avg, count } from "drizzle-orm";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const submissionRouter = createTRPCRouter({
  getStats: baseProcedure.query(async () => {
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
  }),
});

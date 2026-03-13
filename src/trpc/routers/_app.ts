import { createTRPCRouter } from "../init";
import { submissionRouter } from "./submission";

export const appRouter = createTRPCRouter({
  submission: submissionRouter,
});

export type AppRouter = typeof appRouter;

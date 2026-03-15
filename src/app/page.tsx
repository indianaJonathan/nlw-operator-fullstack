import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { CodeEditorSection } from "@/components/code-editor-section";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { LeaderboardPreviewSkeleton } from "@/components/leaderboard-preview-skeleton";
import { StatsCounter } from "@/components/stats-counter";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function Home() {
  await connection();
  prefetch(trpc.submission.getStats.queryOptions());
  const session = await auth();

  return (
    <HydrateClient>
      <main className="min-h-screen">
        {/* Hero + Code Input */}
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-10 pt-20">
          {/* Hero Title */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
              <span className="text-accent-green">$</span>
              <span>paste your code. get roasted.</span>
            </h1>
            <p className="text-sm text-text-secondary">
              {
                "// drop your code below and we'll rate it — brutally honest or full roast mode"
              }
            </p>
          </div>

          <CodeEditorSection isAuthenticated={!!session} />

          {/* Footer Stats */}
          <StatsCounter />
        </div>

        {/* Spacer */}
        <div className="h-15" />

        {/* Leaderboard Preview */}
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-10 pb-15">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm font-bold">
              <span className="text-accent-green">{"// "}</span>
              <span>shame_leaderboard</span>
            </div>
            <Link
              href="/leaderboard"
              className="border border-border-primary px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:border-border-secondary hover:text-text-primary"
            >
              $ view_all {">>"}
            </Link>
          </div>

          {/* Subtitle */}
          <p className="text-2xs text-text-tertiary">
            {"// the worst code on the internet, ranked by shame"}
          </p>

          {/* Table + Footer (streamed via Suspense) */}
          <Suspense fallback={<LeaderboardPreviewSkeleton />}>
            <LeaderboardPreview />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  );
}

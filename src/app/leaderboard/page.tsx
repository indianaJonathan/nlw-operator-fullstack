import { Suspense } from "react";
import { LeaderboardEntries } from "@/components/leaderboard-entries";
import { LeaderboardEntriesSkeleton } from "@/components/leaderboard-entries-skeleton";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-20 py-10">
        {/* Hero Section */}
        <div className="flex flex-col gap-4">
          <h1 className="flex items-center gap-3 font-mono">
            <span className="text-heading-md font-bold text-accent-green">
              {">"}
            </span>
            <span className="text-heading-sm font-bold text-text-primary">
              shame_leaderboard
            </span>
          </h1>
          <p className="text-sm text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>
        </div>

        {/* Stats + Entries (streamed via Suspense) */}
        <Suspense fallback={<LeaderboardEntriesSkeleton />}>
          <LeaderboardEntries />
        </Suspense>
      </div>
    </main>
  );
}

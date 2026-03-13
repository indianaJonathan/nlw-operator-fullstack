import Link from "next/link";
import { CodeEditorSection } from "@/components/code-editor-section";
import { StatsCounter } from "@/components/stats-counter";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const leaderboardData = [
  {
    rank: 1,
    score: 1.2,
    code: [
      'eval(prompt("enter code"))',
      "document.write(response)",
      "// trust the user lol",
    ],
    lang: "javascript",
  },
  {
    rank: 2,
    score: 1.8,
    code: [
      "if (x == true) { return true; }",
      "else if (x == false) { return false; }",
      "else { return !false; }",
    ],
    lang: "typescript",
  },
  {
    rank: 3,
    score: 2.1,
    code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
    lang: "sql",
  },
];

export default function Home() {
  prefetch(trpc.submission.getStats.queryOptions());

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

          <CodeEditorSection />

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

          {/* Table */}
          <div className="overflow-hidden rounded border border-border-primary">
            {/* Table Header */}
            <div className="flex items-center bg-bg-surface px-5 font-mono text-xs font-medium text-text-tertiary">
              <div className="w-12.5 py-3">#</div>
              <div className="w-17.5 py-3">score</div>
              <div className="flex-1 py-3">code</div>
              <div className="w-25 py-3">lang</div>
            </div>

            {/* Table Rows */}
            {leaderboardData.map((row, index) => (
              <div
                key={row.rank}
                className={`flex items-start px-5 py-4 font-mono text-xs ${index < leaderboardData.length - 1 ? "border-b border-border-primary" : ""}`}
              >
                <div className="w-12.5">
                  <span
                    className={
                      row.rank === 1
                        ? "text-accent-amber"
                        : "text-text-secondary"
                    }
                  >
                    {row.rank}
                  </span>
                </div>
                <div className="w-17.5">
                  <span className="font-bold text-accent-red">{row.score}</span>
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  {row.code.map((line) => (
                    <span
                      key={line}
                      className={
                        line.startsWith("//") || line.startsWith("--")
                          ? "text-text-tertiary"
                          : "text-text-primary"
                      }
                    >
                      {line}
                    </span>
                  ))}
                </div>
                <div className="w-25 text-text-secondary">{row.lang}</div>
              </div>
            ))}
          </div>

          {/* Fade Hint */}
          <p className="text-center text-xs text-text-tertiary">
            {"showing top 3 · "}
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-text-secondary"
            >
              view full leaderboard {">>"}
            </Link>
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}

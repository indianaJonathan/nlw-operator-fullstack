import type { BundledLanguage } from "shiki";
import { LeaderboardEntry } from "@/components/ui/leaderboard-entry";

const entries: Array<{
  rank: number;
  score: number;
  lang: string;
  shikiLang: BundledLanguage;
  code: string;
}> = [
  {
    rank: 1,
    score: 1.2,
    lang: "javascript",
    shikiLang: "javascript",
    code: `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
  },
  {
    rank: 2,
    score: 1.8,
    lang: "typescript",
    shikiLang: "typescript",
    code: `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }`,
  },
  {
    rank: 3,
    score: 2.1,
    lang: "sql",
    shikiLang: "sql",
    code: `SELECT * FROM users WHERE 1=1
-- TODO: add authentication`,
  },
  {
    rank: 4,
    score: 2.3,
    lang: "java",
    shikiLang: "java",
    code: `catch (e) {
  // ignore
}`,
  },
  {
    rank: 5,
    score: 2.5,
    lang: "javascript",
    shikiLang: "javascript",
    code: `const sleep = (ms) =>
  new Date(Date.now() + ms)
  while(new Date() < end) {}`,
  },
];

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
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>2,847 submissions</span>
            <span>·</span>
            <span>avg score: 4.2/10</span>
          </div>
        </div>

        {/* Entries */}
        <div className="flex flex-col gap-5">
          {entries.map((entry) => {
            const lines = entry.code.split("\n").length;
            return (
              <LeaderboardEntry.Root key={entry.rank}>
                <LeaderboardEntry.Meta
                  rank={entry.rank}
                  score={entry.score}
                  lang={entry.lang}
                  lines={lines}
                />
                <LeaderboardEntry.Code
                  code={entry.code}
                  lang={entry.shikiLang}
                />
              </LeaderboardEntry.Root>
            );
          })}
        </div>
      </div>
    </main>
  );
}

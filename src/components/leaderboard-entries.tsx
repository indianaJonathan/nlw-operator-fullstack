import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { button } from "@/components/ui/button";
import { getPreviewCode, highlightCode } from "@/lib/code-preview";
import { caller } from "@/trpc/server";

function getScoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

function EntryAuthor({
  anonymous,
  user,
}: {
  anonymous: boolean;
  user: { name: string | null; image: string | null; username: string | null };
}) {
  if (anonymous) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <div className="flex size-6 items-center justify-center rounded-full bg-bg-elevated text-2xs text-text-tertiary">
          ?
        </div>
        <span className="text-text-tertiary">anonymous</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name ?? "avatar"}
          width={24}
          height={24}
          className="rounded-full"
        />
      ) : (
        <div className="flex size-6 items-center justify-center rounded-full bg-bg-elevated text-2xs text-text-secondary">
          {(user.name?.[0] ?? "?").toUpperCase()}
        </div>
      )}
      <span className="text-text-secondary">{user.username ?? user.name}</span>
    </div>
  );
}

function EntryHeader({
  rank,
  score,
  lang,
  lines,
  anonymous,
  user,
}: {
  rank: number;
  score: number;
  lang: string;
  lines: number;
  anonymous: boolean;
  user: { name: string | null; image: string | null; username: string | null };
}) {
  const lineLabel = lines === 1 ? "1 line" : `${lines} lines`;

  return (
    <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-2xs">
          <span className="text-text-tertiary">#</span>
          <span className="font-bold text-accent-amber">{rank}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-text-tertiary">score:</span>
          <span className={twMerge("text-sm font-bold", getScoreColor(score))}>
            {score.toFixed(1)}
          </span>
        </div>
        <EntryAuthor anonymous={anonymous} user={user} />
      </div>
      <span className="flex-1" />
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className="text-text-secondary">{lang}</span>
        <span className="text-text-tertiary">{lineLabel}</span>
      </div>
    </div>
  );
}

async function LeaderboardEntries() {
  const [rows, stats] = await Promise.all([
    caller.submission.getLeaderboard(),
    caller.submission.getStats(),
  ]);

  const highlightedRows = await Promise.all(
    rows.map(async (row, index) => {
      const { code: preview, hasMore } = getPreviewCode(row.code);
      const html = await highlightCode(preview, row.language);
      return { ...row, html, hasMore, rank: index + 1 };
    }),
  );

  return (
    <>
      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <span>{stats.count} submissions</span>
        <span>·</span>
        <span>avg score: {stats.avgScore.toFixed(1)}/10</span>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-5">
        {highlightedRows.length === 0 ? (
          <div className="rounded border border-border-primary px-5 py-10 text-center font-mono text-xs text-text-tertiary">
            {"// no submissions yet — be the first to get roasted"}
          </div>
        ) : (
          highlightedRows.map((row) => (
            <Link
              key={row.id}
              href={`/roast/${row.id}`}
              className="group block overflow-hidden rounded border border-border-primary transition-colors hover:border-border-secondary"
            >
              {/* Header */}
              <EntryHeader
                rank={row.rank}
                score={row.score}
                lang={row.language}
                lines={row.lineCount}
                anonymous={row.anonymous}
                user={row.user}
              />

              {/* Code preview */}
              <div className="relative overflow-hidden px-4 py-3">
                <div
                  className="font-mono transition-[filter] duration-200 group-hover:blur-[2px] [&_code]:text-2xs [&_pre]:m-0 [&_pre]:p-0 [&_pre]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: row.html }}
                />

                {/* Fade gradient */}
                {row.hasMore && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-page from-10% group-hover:from-bg-page group-hover:from-10%" />
                )}

                {/* Hover overlay with "view roast" button */}
                <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span
                    className={button({
                      variant: "secondary",
                      size: "xs",
                      className: "pointer-events-auto",
                    })}
                  >
                    view roast {">>"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export { LeaderboardEntries };

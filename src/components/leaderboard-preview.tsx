import Image from "next/image";
import Link from "next/link";
import { button } from "@/components/ui/button";
import { getPreviewCode, highlightCode } from "@/lib/code-preview";
import { caller } from "@/trpc/server";

function EntryAuthor({
  anonymous,
  user,
}: {
  anonymous: boolean;
  user: { name: string | null; image: string | null; username: string | null };
}) {
  if (anonymous) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex size-5 items-center justify-center rounded-full bg-bg-elevated text-2xs text-text-tertiary">
          ?
        </div>
        <span className="text-text-tertiary">anonymous</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name ?? "avatar"}
          width={20}
          height={20}
          className="rounded-full"
        />
      ) : (
        <div className="flex size-5 items-center justify-center rounded-full bg-bg-elevated text-2xs text-text-secondary">
          {(user.name?.[0] ?? "?").toUpperCase()}
        </div>
      )}
      <span className="text-text-secondary">{user.username ?? user.name}</span>
    </div>
  );
}

async function LeaderboardPreview() {
  const [rows, stats] = await Promise.all([
    caller.submission.getLeaderboardPreview(),
    caller.submission.getStats(),
  ]);

  if (rows.length === 0) {
    return (
      <>
        <div className="rounded border border-border-primary px-5 py-10 text-center font-mono text-xs text-text-tertiary">
          {"// no submissions yet — be the first to get roasted"}
        </div>

        <p className="text-center text-xs text-text-tertiary">
          {"showing top 3 · "}
          <Link
            href="/leaderboard"
            className="transition-colors hover:text-text-secondary"
          >
            view full leaderboard {">>"}
          </Link>
        </p>
      </>
    );
  }

  const highlightedRows = await Promise.all(
    rows.map(async (row) => {
      const { code: preview, hasMore } = getPreviewCode(row.code);
      const html = await highlightCode(preview, row.language);
      return { ...row, html, hasMore };
    }),
  );

  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden overflow-hidden rounded border border-border-primary md:block">
        {/* Table Header */}
        <div className="flex items-center bg-bg-surface px-5 font-mono text-xs font-medium text-text-tertiary">
          <div className="w-12.5 py-3">#</div>
          <div className="w-17.5 py-3">score</div>
          <div className="w-35 py-3">author</div>
          <div className="flex-1 py-3">code</div>
          <div className="w-25 py-3">lang</div>
        </div>

        {/* Table Rows */}
        {highlightedRows.map((row, index) => {
          const rank = index + 1;

          return (
            <Link
              key={row.id}
              href={`/roast/${row.id}`}
              className={`group flex items-start px-5 py-4 font-mono text-xs transition-colors hover:bg-bg-surface ${index < highlightedRows.length - 1 ? "border-b border-border-primary" : ""}`}
            >
              <div className="w-12.5">
                <span
                  className={
                    rank === 1 ? "text-accent-amber" : "text-text-secondary"
                  }
                >
                  {rank}
                </span>
              </div>
              <div className="w-17.5">
                <span className="font-bold text-accent-red">
                  {row.score.toFixed(1)}
                </span>
              </div>
              <div className="w-35">
                <EntryAuthor anonymous={row.anonymous} user={row.user} />
              </div>
              <div className="relative flex-1 overflow-hidden">
                {/* Code with shiki highlighting */}
                <div
                  className="transition-[filter] duration-200 group-hover:blur-[2px] [&_code]:text-xs [&_pre]:m-0 [&_pre]:p-0 [&_pre]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: row.html }}
                />

                {/* Fade gradient (always visible when code is truncated) */}
                {row.hasMore && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-page from-10% group-hover:from-bg-surface group-hover:from-10%" />
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
              <div className="w-25 text-text-secondary">{row.language}</div>
            </Link>
          );
        })}
      </div>

      {/* Mobile: Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {highlightedRows.map((row, index) => {
          const rank = index + 1;

          return (
            <Link
              key={row.id}
              href={`/roast/${row.id}`}
              className="flex flex-col gap-3 rounded border border-border-primary px-4 py-3 font-mono text-xs transition-colors hover:border-border-secondary"
            >
              {/* Header: rank + score + author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      rank === 1 ? "text-accent-amber" : "text-text-secondary"
                    }
                  >
                    #{rank}
                  </span>
                  <span className="font-bold text-accent-red">
                    {row.score.toFixed(1)}
                  </span>
                </div>
                <EntryAuthor anonymous={row.anonymous} user={row.user} />
              </div>

              {/* Code preview */}
              <div className="relative overflow-hidden">
                <div
                  className="[&_code]:text-2xs [&_pre]:m-0 [&_pre]:p-0 [&_pre]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: row.html }}
                />
                {row.hasMore && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-page from-10%" />
                )}
              </div>

              {/* Footer: language + view roast */}
              <div className="flex items-center justify-between text-text-secondary">
                <span>{row.language}</span>
                <span className="text-text-tertiary">view roast {">>"}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-text-tertiary">
        {"showing top 3"}
        {stats.count > 0 && (
          <>
            {" · "}
            <span>{stats.count} codes roasted</span>
            {" · "}
            <span>avg score {stats.avgScore.toFixed(1)}/10</span>
          </>
        )}
        {" · "}
        <Link
          href="/leaderboard"
          className="transition-colors hover:text-text-secondary"
        >
          view full leaderboard {">>"}
        </Link>
      </p>
    </>
  );
}

export { LeaderboardPreview };

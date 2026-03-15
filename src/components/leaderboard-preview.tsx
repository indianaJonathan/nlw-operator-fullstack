import Link from "next/link";
import { button } from "@/components/ui/button";
import { getPreviewCode, highlightCode } from "@/lib/code-preview";
import { caller } from "@/trpc/server";

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

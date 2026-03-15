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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function EntryHeader({
  score,
  lang,
  lines,
  date,
  isAnonymous,
}: {
  score: number;
  lang: string;
  lines: number;
  date: Date;
  isAnonymous: boolean;
}) {
  const lineLabel = lines === 1 ? "1 line" : `${lines} lines`;

  return (
    <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-text-tertiary">score:</span>
          <span className={twMerge("text-sm font-bold", getScoreColor(score))}>
            {score.toFixed(1)}
          </span>
        </div>
        {isAnonymous && (
          <span className="font-mono text-xs text-text-tertiary">
            anonymous
          </span>
        )}
      </div>
      <span className="flex-1" />
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className="text-text-tertiary">{formatDate(date)}</span>
        <span className="text-text-secondary">{lang}</span>
        <span className="text-text-tertiary">{lineLabel}</span>
      </div>
    </div>
  );
}

async function MyRoastsEntries() {
  const rows = await caller.submission.getMyRoasts();

  const highlightedRows = await Promise.all(
    rows.map(async (row) => {
      const { code: preview, hasMore } = getPreviewCode(row.code);
      const html = await highlightCode(preview, row.language);
      return { ...row, html, hasMore };
    }),
  );

  if (highlightedRows.length === 0) {
    return (
      <div className="rounded border border-border-primary px-5 py-10 text-center font-mono text-xs text-text-tertiary">
        {"// no roasts yet — go submit some code and get roasted!"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <span>{highlightedRows.length} submissions</span>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-5">
        {highlightedRows.map((row) => (
          <Link
            key={row.id}
            href={`/roast/${row.id}`}
            className="group block overflow-hidden rounded border border-border-primary transition-colors hover:border-border-secondary"
          >
            {/* Header */}
            <EntryHeader
              score={row.score}
              lang={row.language}
              lines={row.lineCount}
              date={row.createdAt}
              isAnonymous={row.anonymous}
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
        ))}
      </div>
    </div>
  );
}

export { MyRoastsEntries };

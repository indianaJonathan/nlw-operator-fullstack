import type { ComponentProps } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";

/* ─── Root ─── */

type LeaderboardEntryRootProps = ComponentProps<"div">;

function LeaderboardEntryRoot({
  className,
  ...props
}: LeaderboardEntryRootProps) {
  return (
    <div
      className={twMerge(
        "overflow-hidden border border-border-primary",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Meta ─── */

function getScoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

type LeaderboardEntryMetaProps = ComponentProps<"div"> & {
  rank: number;
  score: number;
  lang: string;
  lines: number;
};

function LeaderboardEntryMeta({
  rank,
  score,
  lang,
  lines,
  className,
  ...props
}: LeaderboardEntryMetaProps) {
  const lineLabel = lines === 1 ? "1 line" : `${lines} lines`;

  return (
    <div
      className={twMerge(
        "flex h-12 items-center justify-between border-b border-border-primary px-5",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-2xs">
          <span className="text-text-tertiary">#</span>
          <span className="font-bold text-accent-amber">{rank}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-text-tertiary">score:</span>
          <span className={twMerge("text-sm font-bold", getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className="text-text-secondary">{lang}</span>
        <span className="text-text-tertiary">{lineLabel}</span>
      </div>
    </div>
  );
}

/* ─── Code ─── */

type LeaderboardEntryCodeProps = {
  code: string;
  lang: BundledLanguage;
  className?: string;
};

async function LeaderboardEntryCode({
  code,
  lang,
  className,
}: LeaderboardEntryCodeProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vesper",
  });

  return (
    <div
      className={twMerge(
        [
          "overflow-hidden bg-bg-input",
          "[&_pre]:overflow-x-auto [&_pre]:p-3.5 [&_pre]:pl-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed [&_code]:font-mono",
        ].join(" "),
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ─── Namespace ─── */

const LeaderboardEntry = {
  Root: LeaderboardEntryRoot,
  Meta: LeaderboardEntryMeta,
  Code: LeaderboardEntryCode,
};

export {
  LeaderboardEntry,
  type LeaderboardEntryRootProps,
  type LeaderboardEntryMetaProps,
  type LeaderboardEntryCodeProps,
};

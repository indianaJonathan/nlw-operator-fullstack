import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { CopyButton } from "@/components/ui/copy-button";
import type { SplitDiffRow, SplitDiffSide } from "@/lib/generate-diff";

type SplitDiffRootProps = ComponentProps<"div"> & {
  rows: SplitDiffRow[];
  /** Original code string for the copy button. */
  originalCode?: string;
  /** Suggested code string for the copy button. */
  suggestedCode?: string;
};

const sideBg = {
  added: "bg-diff-added",
  removed: "bg-diff-removed",
  context: "",
  empty: "bg-bg-surface",
} as const;

const sideTextColor = {
  added: "text-text-primary",
  removed: "text-text-secondary",
  context: "text-text-secondary",
  empty: "",
} as const;

const gutterColor = {
  added: "text-accent-green",
  removed: "text-accent-red",
  context: "text-text-tertiary",
  empty: "",
} as const;

const prefixMap = {
  added: "+",
  removed: "-",
  context: " ",
  empty: "",
} as const;

function DiffLine({ side }: { side: SplitDiffSide }) {
  return (
    <div
      className={twMerge("flex min-h-6 font-mono text-2xs", sideBg[side.type])}
    >
      <span
        className={twMerge(
          "flex w-10 shrink-0 select-none items-start justify-end px-2 py-px",
          gutterColor[side.type],
        )}
      >
        {side.lineNumber ?? ""}
      </span>
      <span
        className={twMerge(
          "flex w-4 shrink-0 select-none items-start justify-center py-px",
          gutterColor[side.type],
        )}
      >
        {prefixMap[side.type]}
      </span>
      <span
        className={twMerge(
          "flex-1 whitespace-pre-wrap break-all px-2 py-px",
          sideTextColor[side.type],
        )}
      >
        {side.code}
      </span>
    </div>
  );
}

function SplitDiffRoot({
  rows,
  originalCode,
  suggestedCode,
  className,
  ...props
}: SplitDiffRootProps) {
  const leftLines = rows.map((r, i) => ({ ...r.left, rowIndex: i }));
  const rightLines = rows.map((r, i) => ({ ...r.right, rowIndex: i }));

  return (
    <div
      className={twMerge("border border-border-primary bg-bg-input", className)}
      {...props}
    >
      {/* Desktop: side-by-side */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="flex border-b border-border-primary">
          <div className="flex flex-1 items-center justify-between px-4 py-2 font-mono text-xs font-medium text-text-secondary">
            <span>your_code</span>
            {originalCode && <CopyButton text={originalCode} />}
          </div>
          <div className="w-px bg-border-primary" />
          <div className="flex flex-1 items-center justify-between px-4 py-2 font-mono text-xs font-medium text-text-secondary">
            <span>improved_code</span>
            {suggestedCode && <CopyButton text={suggestedCode} />}
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {rows.map((row) => (
            <div
              key={`${row.left.lineNumber ?? "e"}-${row.left.type}-${row.right.lineNumber ?? "e"}-${row.right.type}`}
              className="flex min-h-6"
            >
              <div
                className={twMerge(
                  "flex flex-1 font-mono text-2xs",
                  sideBg[row.left.type],
                )}
              >
                <span
                  className={twMerge(
                    "flex w-10 shrink-0 select-none items-start justify-end px-2 py-px",
                    gutterColor[row.left.type],
                  )}
                >
                  {row.left.lineNumber ?? ""}
                </span>
                <span
                  className={twMerge(
                    "flex w-4 shrink-0 select-none items-start justify-center py-px",
                    gutterColor[row.left.type],
                  )}
                >
                  {prefixMap[row.left.type]}
                </span>
                <span
                  className={twMerge(
                    "flex-1 whitespace-pre-wrap break-all px-2 py-px",
                    sideTextColor[row.left.type],
                  )}
                >
                  {row.left.code}
                </span>
              </div>

              <div className="w-px bg-border-primary" />

              <div
                className={twMerge(
                  "flex flex-1 font-mono text-2xs",
                  sideBg[row.right.type],
                )}
              >
                <span
                  className={twMerge(
                    "flex w-10 shrink-0 select-none items-start justify-end px-2 py-px",
                    gutterColor[row.right.type],
                  )}
                >
                  {row.right.lineNumber ?? ""}
                </span>
                <span
                  className={twMerge(
                    "flex w-4 shrink-0 select-none items-start justify-center py-px",
                    gutterColor[row.right.type],
                  )}
                >
                  {prefixMap[row.right.type]}
                </span>
                <span
                  className={twMerge(
                    "flex-1 whitespace-pre-wrap break-all px-2 py-px",
                    sideTextColor[row.right.type],
                  )}
                >
                  {row.right.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden">
        {/* your_code */}
        <div className="flex items-center justify-between border-b border-border-primary px-4 py-2 font-mono text-xs font-medium text-text-secondary">
          <span>your_code</span>
          {originalCode && <CopyButton text={originalCode} />}
        </div>
        <div className="flex flex-col">
          {leftLines.map((side) => (
            <DiffLine key={`l-${side.rowIndex}`} side={side} />
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-border-primary" />

        {/* improved_code */}
        <div className="flex items-center justify-between border-b border-border-primary px-4 py-2 font-mono text-xs font-medium text-text-secondary">
          <span>improved_code</span>
          {suggestedCode && <CopyButton text={suggestedCode} />}
        </div>
        <div className="flex flex-col">
          {rightLines.map((side) => (
            <DiffLine key={`r-${side.rowIndex}`} side={side} />
          ))}
        </div>
      </div>
    </div>
  );
}

const SplitDiff = {
  Root: SplitDiffRoot,
};

export { SplitDiff, type SplitDiffRootProps };

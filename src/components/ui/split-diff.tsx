import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import type { SplitDiffRow } from "@/lib/generate-diff";

type SplitDiffRootProps = ComponentProps<"div"> & {
  rows: SplitDiffRow[];
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

function SplitDiffRoot({ rows, className, ...props }: SplitDiffRootProps) {
  return (
    <div
      className={twMerge(
        "overflow-hidden border border-border-primary bg-bg-input",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex border-b border-border-primary">
        <div className="flex-1 px-4 py-2 font-mono text-xs font-medium text-text-secondary">
          your_code
        </div>
        <div className="w-px bg-border-primary" />
        <div className="flex-1 px-4 py-2 font-mono text-xs font-medium text-text-secondary">
          improved_code
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {rows.map((row) => (
          <SplitDiffRowComponent
            key={`${row.left.lineNumber ?? "e"}-${row.left.type}-${row.right.lineNumber ?? "e"}-${row.right.type}`}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}

type SplitDiffRowProps = {
  row: SplitDiffRow;
};

function SplitDiffRowComponent({ row }: SplitDiffRowProps) {
  return (
    <div className="flex min-h-6">
      {/* Left side (original) */}
      <div
        className={twMerge(
          "flex flex-1 font-mono text-2xs",
          sideBg[row.left.type],
        )}
      >
        {/* Line number */}
        <span
          className={twMerge(
            "flex w-10 shrink-0 select-none items-start justify-end px-2 py-px",
            gutterColor[row.left.type],
          )}
        >
          {row.left.lineNumber ?? ""}
        </span>
        {/* Prefix */}
        <span
          className={twMerge(
            "flex w-4 shrink-0 select-none items-start justify-center py-px",
            gutterColor[row.left.type],
          )}
        >
          {prefixMap[row.left.type]}
        </span>
        {/* Code */}
        <span
          className={twMerge(
            "flex-1 whitespace-pre-wrap break-all px-2 py-px",
            sideTextColor[row.left.type],
          )}
        >
          {row.left.code}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px bg-border-primary" />

      {/* Right side (suggested) */}
      <div
        className={twMerge(
          "flex flex-1 font-mono text-2xs",
          sideBg[row.right.type],
        )}
      >
        {/* Line number */}
        <span
          className={twMerge(
            "flex w-10 shrink-0 select-none items-start justify-end px-2 py-px",
            gutterColor[row.right.type],
          )}
        >
          {row.right.lineNumber ?? ""}
        </span>
        {/* Prefix */}
        <span
          className={twMerge(
            "flex w-4 shrink-0 select-none items-start justify-center py-px",
            gutterColor[row.right.type],
          )}
        >
          {prefixMap[row.right.type]}
        </span>
        {/* Code */}
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
  );
}

const SplitDiff = {
  Root: SplitDiffRoot,
};

export { SplitDiff, type SplitDiffRootProps };

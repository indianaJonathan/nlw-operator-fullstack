function LeaderboardPreviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Table */}
      <div className="overflow-hidden rounded border border-border-primary">
        {/* Table Header */}
        <div className="flex items-center bg-bg-surface px-5 font-mono text-xs font-medium text-text-tertiary">
          <div className="w-12.5 py-3">#</div>
          <div className="w-17.5 py-3">score</div>
          <div className="flex-1 py-3">code</div>
          <div className="w-25 py-3">lang</div>
        </div>

        {/* Skeleton Rows */}
        {["row-1", "row-2", "row-3"].map((key, i) => (
          <div
            key={key}
            className={`flex items-start px-5 py-4 ${i < 2 ? "border-b border-border-primary" : ""}`}
          >
            {/* Rank */}
            <div className="w-12.5">
              <div className="h-4 w-4 animate-pulse rounded bg-bg-elevated" />
            </div>

            {/* Score */}
            <div className="w-17.5">
              <div className="h-4 w-8 animate-pulse rounded bg-bg-elevated" />
            </div>

            {/* Code lines */}
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-bg-elevated" />
            </div>

            {/* Language */}
            <div className="w-25">
              <div className="h-4 w-16 animate-pulse rounded bg-bg-elevated" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-center">
        <div className="h-4 w-72 animate-pulse rounded bg-bg-elevated" />
      </div>
    </div>
  );
}

export { LeaderboardPreviewSkeleton };

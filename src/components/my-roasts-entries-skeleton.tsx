function MyRoastsEntriesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Stats skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 animate-pulse rounded bg-bg-elevated" />
      </div>

      {/* Entry skeletons */}
      {["s-1", "s-2", "s-3", "s-4", "s-5"].map((key) => (
        <div
          key={key}
          className="overflow-hidden rounded border border-border-primary"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-primary px-4 py-2 md:h-10 md:flex-nowrap md:py-0">
            <div className="h-4 w-20 animate-pulse rounded bg-bg-elevated" />
            <span className="flex-1" />
            <div className="h-4 w-20 animate-pulse rounded bg-bg-elevated" />
            <div className="h-4 w-16 animate-pulse rounded bg-bg-elevated" />
            <div className="h-4 w-12 animate-pulse rounded bg-bg-elevated" />
          </div>

          {/* Code body */}
          <div className="flex flex-col gap-2 p-4">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-bg-elevated" />
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-bg-elevated" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-bg-elevated" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { MyRoastsEntriesSkeleton };

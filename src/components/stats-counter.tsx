"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";

function StatsCounter() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.submission.getStats.queryOptions());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? (data?.count ?? 0) : 0;
  const avgScore = mounted ? (data?.avgScore ?? 0) : 0;

  return (
    <div className="flex items-center gap-6 text-xs text-text-tertiary">
      <span>
        <NumberFlow value={count} format={{ useGrouping: true }} /> codes
        roasted
      </span>
      <span>·</span>
      <span>
        avg score:{" "}
        <NumberFlow
          value={avgScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  );
}

export { StatsCounter };

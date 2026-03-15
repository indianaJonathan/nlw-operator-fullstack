"use client";

import { Code, Flame, Terminal } from "lucide-react";
import { useEffect } from "react";

type RoastLoadingOverlayProps = {
  open: boolean;
};

function RoastLoadingOverlay({ open }: RoastLoadingOverlayProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-page/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Animated icons */}
        <div className="relative flex items-center justify-center">
          {/* Code icon (target) */}
          <div className="animate-pulse">
            <Code className="size-16 text-text-tertiary" strokeWidth={1.5} />
          </div>

          {/* Flame icon (roasting) */}
          <div className="absolute -top-6 animate-bounce">
            <Flame className="size-10 text-accent-orange" strokeWidth={1.5} />
          </div>

          {/* Terminal sparks */}
          <div className="absolute -right-8 top-0 animate-ping opacity-60">
            <Terminal className="size-5 text-accent-green" strokeWidth={2} />
          </div>
          <div className="absolute -left-8 bottom-0 animate-ping opacity-40 [animation-delay:500ms]">
            <Terminal className="size-4 text-accent-red" strokeWidth={2} />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-lg text-text-primary">
            roasting your code
            <span className="animate-pulse">...</span>
          </p>
          <p className="font-mono text-xs text-text-tertiary">
            {"// analyzing, judging, and preparing your roast"}
          </p>
        </div>

        {/* Loading bar */}
        <div className="h-0.5 w-48 overflow-hidden rounded-full bg-border-primary">
          <div className="h-full w-full animate-loading-bar rounded-full bg-accent-green" />
        </div>
      </div>
    </div>
  );
}

export { RoastLoadingOverlay, type RoastLoadingOverlayProps };

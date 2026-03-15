import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type ScoreRingProps = ComponentProps<"div"> & {
  score: number;
  maxScore?: number;
};

function getScoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

function ScoreRing({
  score,
  maxScore = 10,
  className,
  ...props
}: ScoreRingProps) {
  const size = 180;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(score / maxScore, 1);
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <div
      className={twMerge(
        "relative inline-flex size-30 items-center justify-center md:size-45",
        className,
      )}
      {...props}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
      >
        <title>Score ring</title>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-border-primary"
          strokeWidth={strokeWidth}
        />

        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              className="[stop-color:var(--color-accent-green)]"
            />
            <stop
              offset="100%"
              className="[stop-color:var(--color-accent-amber)]"
            />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      <div className="flex items-end gap-0.5">
        <span
          className={twMerge(
            "font-mono text-3xl font-bold md:text-5xl",
            getScoreColor(score),
          )}
        >
          {score}
        </span>
        <span className="font-mono text-xs text-text-tertiary md:text-base">
          /{maxScore}
        </span>
      </div>
    </div>
  );
}

export { ScoreRing, type ScoreRingProps };

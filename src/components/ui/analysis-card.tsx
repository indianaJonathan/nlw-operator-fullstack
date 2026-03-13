import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type AnalysisCardRootProps = ComponentProps<"div">;

function AnalysisCardRoot({ className, ...props }: AnalysisCardRootProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-3 rounded border border-border-primary p-5",
        className,
      )}
      {...props}
    />
  );
}

type AnalysisCardTitleProps = ComponentProps<"span">;

function AnalysisCardTitle({ className, ...props }: AnalysisCardTitleProps) {
  return (
    <span
      className={twMerge(
        "font-mono text-2xs font-medium text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

type AnalysisCardDescriptionProps = ComponentProps<"p">;

function AnalysisCardDescription({
  className,
  ...props
}: AnalysisCardDescriptionProps) {
  return (
    <p
      className={twMerge(
        "text-xs leading-relaxed text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

const AnalysisCard = {
  Root: AnalysisCardRoot,
  Title: AnalysisCardTitle,
  Description: AnalysisCardDescription,
};

export {
  AnalysisCard,
  type AnalysisCardRootProps,
  type AnalysisCardTitleProps,
  type AnalysisCardDescriptionProps,
};

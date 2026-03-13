import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLine = tv({
  base: "flex gap-2 px-4 py-2 font-mono text-2xs",
  variants: {
    variant: {
      added: "bg-diff-added",
      removed: "bg-diff-removed",
      context: "",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const diffPrefix = tv({
  variants: {
    variant: {
      added: "text-accent-green",
      removed: "text-accent-red",
      context: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const diffCode = tv({
  variants: {
    variant: {
      added: "text-text-primary",
      removed: "text-text-secondary",
      context: "text-text-secondary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const prefixMap = {
  added: "+",
  removed: "-",
  context: " ",
} as const;

type DiffLineVariants = VariantProps<typeof diffLine>;

type DiffLineProps = ComponentProps<"div"> & DiffLineVariants;

function DiffLine({ variant, className, children, ...props }: DiffLineProps) {
  const resolvedVariant = variant ?? "context";

  return (
    <div className={diffLine({ variant, className })} {...props}>
      <span className={diffPrefix({ variant })}>
        {prefixMap[resolvedVariant]}
      </span>
      <span className={diffCode({ variant })}>{children}</span>
    </div>
  );
}

export { DiffLine, diffLine, type DiffLineProps };

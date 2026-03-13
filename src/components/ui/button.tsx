import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-mono cursor-pointer transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-accent-green text-bg-page font-medium hover:bg-accent-green-light",
      secondary: [
        "border border-border-primary text-text-primary",
        "hover:border-border-secondary hover:bg-border-primary/50",
      ],
      danger:
        "bg-accent-red text-text-primary font-medium hover:bg-accent-red-light",
      link: [
        "border border-border-primary text-text-secondary",
        "hover:text-text-primary hover:border-border-secondary",
      ],
    },
    size: {
      default: "px-6 py-2.5 text-2xs",
      sm: "px-4 py-2 text-xs",
      xs: "px-3 py-1.5 text-xs",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ComponentProps<"button"> & ButtonVariants;

function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={button({ variant, size, className })} {...props} />;
}

export { Button, button, type ButtonProps };

"use client";

import { Check, Clipboard } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";

type CopyButtonProps = ComponentProps<"button"> & {
  text: string;
};

function CopyButton({ text, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail if clipboard API is unavailable
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={twMerge(
        "cursor-pointer text-text-tertiary transition-colors hover:text-text-secondary",
        copied && "text-accent-green hover:text-accent-green",
        className,
      )}
      aria-label={copied ? "Copied" : "Copy code"}
      {...props}
    >
      {copied ? <Check size={14} /> : <Clipboard size={14} />}
    </button>
  );
}

export { CopyButton, type CopyButtonProps };

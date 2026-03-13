"use client";

import { Switch } from "@base-ui/react/switch";
import { twMerge } from "tailwind-merge";

type ToggleProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  label?: string;
  className?: string;
};

function Toggle({
  checked,
  onCheckedChange,
  defaultChecked,
  label,
  className,
}: ToggleProps) {
  return (
    <div
      className={twMerge(
        "inline-flex items-center gap-3 font-mono text-xs",
        className,
      )}
    >
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        defaultChecked={defaultChecked}
        aria-label={label}
        className="flex h-5.5 w-10 cursor-pointer items-center rounded-full bg-border-primary p-0.75 transition-colors data-[checked]:bg-accent-green"
      >
        <Switch.Thumb className="size-4 rounded-full bg-text-secondary transition-transform duration-150 data-[checked]:translate-x-4.5 data-[checked]:bg-bg-page" />
      </Switch.Root>
      {label && (
        <span className="text-text-secondary transition-colors [[data-checked]~&]:text-accent-green">
          {label}
        </span>
      )}
    </div>
  );
}

export { Toggle, type ToggleProps };

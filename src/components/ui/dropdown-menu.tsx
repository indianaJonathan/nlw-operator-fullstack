"use client";

import { Menu } from "@base-ui/react/menu";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type DropdownMenuRootProps = {
  children: ReactNode;
};

function DropdownMenuRoot({ children }: DropdownMenuRootProps) {
  return <Menu.Root>{children}</Menu.Root>;
}

type DropdownMenuTriggerProps = ComponentProps<"button">;

function DropdownMenuTrigger({
  className,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <Menu.Trigger className={twMerge("cursor-pointer", className)} {...props} />
  );
}

type DropdownMenuContentProps = ComponentProps<"div"> & {
  sideOffset?: number;
  align?: "start" | "center" | "end";
};

function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "end",
  ...props
}: DropdownMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset} align={align}>
        <Menu.Popup
          className={twMerge(
            "origin-[var(--transform-origin)] rounded border border-border-primary bg-bg-surface py-2 shadow-lg transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

type DropdownMenuItemProps = ComponentProps<"div"> & {
  render?: ReactElement;
};

function DropdownMenuItem({
  className,
  render,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      className={twMerge(
        "flex cursor-default items-center gap-2 px-4 py-2 font-mono text-2xs text-text-secondary outline-none select-none transition-colors data-[highlighted]:bg-bg-elevated data-[highlighted]:text-text-primary",
        className,
      )}
      render={render}
      {...props}
    />
  );
}

type DropdownMenuSeparatorProps = ComponentProps<"div">;

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <Menu.Separator
      className={twMerge("mx-2 my-1.5 h-px bg-border-primary", className)}
      {...props}
    />
  );
}

type DropdownMenuLabelProps = ComponentProps<"div">;

function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      className={twMerge(
        "px-4 py-2 font-mono text-2xs text-text-tertiary",
        className,
      )}
      {...props}
    />
  );
}

const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Label: DropdownMenuLabel,
};

export {
  DropdownMenu,
  type DropdownMenuRootProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuLabelProps,
};

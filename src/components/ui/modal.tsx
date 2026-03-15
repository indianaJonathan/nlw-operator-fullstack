"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type ModalRootProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

function ModalRoot({ open, onOpenChange, children }: ModalRootProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-100 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded border border-border-primary bg-bg-surface p-8 transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type ModalTitleProps = ComponentProps<"h2">;

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <Dialog.Title
      className={twMerge(
        "mb-2 font-mono text-lg font-bold text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

type ModalDescriptionProps = ComponentProps<"p">;

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <Dialog.Description
      className={twMerge(
        "mb-6 font-mono text-2xs text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

type ModalActionsProps = ComponentProps<"div">;

function ModalActions({ className, ...props }: ModalActionsProps) {
  return (
    <div
      className={twMerge("flex items-center justify-end gap-3", className)}
      {...props}
    />
  );
}

const ModalClose = Dialog.Close;

const Modal = {
  Root: ModalRoot,
  Title: ModalTitle,
  Description: ModalDescription,
  Actions: ModalActions,
  Close: ModalClose,
};

export {
  Modal,
  type ModalRootProps,
  type ModalTitleProps,
  type ModalDescriptionProps,
  type ModalActionsProps,
};

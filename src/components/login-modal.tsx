"use client";

import { Dialog } from "@base-ui/react/dialog";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn?: () => void;
};

function LoginModal({ open, onOpenChange, onSignIn }: LoginModalProps) {
  const handleSignIn = () => {
    onSignIn?.();
    signIn("github");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-100 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded border border-border-primary bg-bg-surface p-8 transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <Dialog.Title className="mb-2 font-mono text-lg font-bold text-text-primary">
            {">"} login required
          </Dialog.Title>
          <Dialog.Description className="mb-6 font-mono text-2xs text-text-secondary">
            {
              "// to create a roast, you need to be signed in with your GitHub account."
            }
          </Dialog.Description>
          <div className="flex items-center justify-end gap-3">
            <Dialog.Close
              render={
                <Button variant="secondary" size="sm">
                  cancel
                </Button>
              }
            />
            <Button variant="primary" size="sm" onClick={handleSignIn}>
              $ sign_in_with_github
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { LoginModal };

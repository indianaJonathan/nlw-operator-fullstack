"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Title>{">"} login required</Modal.Title>
      <Modal.Description>
        {
          "// to create a roast, you need to be signed in with your GitHub account."
        }
      </Modal.Description>
      <Modal.Actions>
        <Modal.Close
          render={
            <Button variant="secondary" size="sm">
              cancel
            </Button>
          }
        />
        <Button variant="primary" size="sm" onClick={handleSignIn}>
          $ sign_in_with_github
        </Button>
      </Modal.Actions>
    </Modal.Root>
  );
}

export { LoginModal };

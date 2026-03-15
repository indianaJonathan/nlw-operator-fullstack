"use client";

import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type NavbarAuthProps = {
  session: Session | null;
};

function NavbarAuth({ session }: NavbarAuthProps) {
  if (!session) {
    return (
      <Button variant="primary" size="xs" onClick={() => signIn("github")}>
        $ sign_in
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="cursor-pointer font-mono text-2xs text-text-secondary transition-colors hover:text-accent-red"
    >
      sign_out
    </button>
  );
}

export { NavbarAuth };

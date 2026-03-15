"use client";

import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

type NavbarAuthProps = {
  session: Session | null;
};

function NavbarAuth({ session }: NavbarAuthProps) {
  if (!session) {
    return (
      <button
        type="button"
        onClick={() => signIn("github")}
        className="cursor-pointer font-mono text-2xs text-text-secondary transition-colors hover:text-text-primary"
      >
        sign_in
      </button>
    );
  }

  const user = session.user;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-green">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "avatar"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-bg-elevated font-mono text-xs text-text-secondary">
            {(user.name?.[0] ?? "?").toUpperCase()}
          </div>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Label>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-primary">
              {user.username ?? user.name}
            </span>
            <span className="text-xs text-text-tertiary">{user.email}</span>
          </div>
        </DropdownMenu.Label>

        <DropdownMenu.Separator />

        <DropdownMenu.Item render={<Link href="/my-roasts" />}>
          my_roasts
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          className="text-accent-red data-[highlighted]:text-accent-red-light"
          onClick={() => signOut()}
        >
          sign_out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export { NavbarAuth };

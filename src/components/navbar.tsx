import Link from "next/link";
import { auth } from "@/auth";
import { NavbarAuth } from "@/components/navbar-auth";

async function Navbar() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-primary bg-bg-page pl-10">
      <Link href="/" className="flex items-center gap-2 font-mono">
        <span className="text-xl font-bold text-accent-green">{">"}</span>
        <span className="text-lg font-medium text-text-primary">devroast</span>
      </Link>

      <nav className="flex h-full items-center gap-6">
        <Link
          href="/leaderboard"
          className="font-mono text-2xs text-text-secondary transition-colors hover:text-text-primary"
        >
          leaderboard
        </Link>
        <NavbarAuth session={session} />
      </nav>
    </header>
  );
}

export { Navbar };

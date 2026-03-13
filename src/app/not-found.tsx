import Link from "next/link";
import { button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-heading-md font-bold text-accent-red">
          404
        </span>
        <p className="font-mono text-sm text-text-secondary">
          {"// page not found"}
        </p>
      </div>

      <Link href="/" className={button({ variant: "secondary" })}>
        $ cd ~
      </Link>
    </main>
  );
}

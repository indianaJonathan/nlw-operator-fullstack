import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { MyRoastsEntries } from "@/components/my-roasts-entries";
import { MyRoastsEntriesSkeleton } from "@/components/my-roasts-entries-skeleton";
import { prefetch, trpc } from "@/trpc/server";

export default async function MyRoastsPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  prefetch(trpc.submission.getMyRoasts.queryOptions());

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-6 md:px-20 md:py-10">
        <div className="flex flex-col gap-4">
          <h1 className="flex items-center gap-3 font-mono">
            <span className="text-heading-md font-bold text-accent-green">
              {">"}
            </span>
            <span className="text-heading-sm font-bold text-text-primary">
              my_roasts
            </span>
          </h1>
          <p className="text-sm text-text-secondary">
            {"// your most... interesting code submissions"}
          </p>
        </div>
        <Suspense fallback={<MyRoastsEntriesSkeleton />}>
          <MyRoastsEntries />
        </Suspense>
      </div>
    </main>
  );
}

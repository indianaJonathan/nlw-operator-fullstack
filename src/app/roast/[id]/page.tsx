import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { ScoreRing } from "@/components/ui/score-ring";
import { SplitDiff } from "@/components/ui/split-diff";
import { generateSplitDiff } from "@/lib/generate-diff";
import { shikiLangMap } from "@/lib/languages";
import { caller } from "@/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await caller.submission.getById({ id });

  if (!result) {
    return { title: "DevRoast" };
  }

  const title = `DevRoast — ${result.score}/10`;
  const description = result.roast;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/roast/${id}/og`,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function getVerdictBadgeVariant(
  score: number,
): "critical" | "warning" | "good" {
  if (score <= 3) return "critical";
  if (score <= 6) return "warning";
  return "good";
}

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await caller.submission.getById({ id });

  if (!result) {
    notFound();
  }

  const {
    score,
    verdict,
    roast,
    language,
    lineCount,
    code,
    suggestedCode,
    issues,
    anonymous,
    user,
  } = result;

  const shikiLang = shikiLangMap[language] ?? "plaintext";
  const badgeVariant = getVerdictBadgeVariant(score);

  const diffRows = suggestedCode
    ? generateSplitDiff(code, suggestedCode)
    : null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-6 md:px-20 md:py-10">
        {/* Score Hero */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-12">
          <ScoreRing score={score} />

          <div className="flex flex-1 flex-col gap-4">
            <Badge variant={badgeVariant}>
              verdict: {verdict.replaceAll("_", " ")}
            </Badge>

            <p className="font-mono text-base leading-relaxed text-text-primary md:text-xl">
              {`"${roast}"`}
            </p>

            <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
              <span>lang: {language}</span>
              <span>·</span>
              <span>{lineCount} lines</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-primary" />

        {/* Author */}
        <div className="flex items-center gap-3">
          {anonymous ? (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-bg-elevated font-mono text-sm text-text-tertiary">
                ?
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-sm text-text-primary">
                  anonymous
                </span>
              </div>
            </>
          ) : (
            <>
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "avatar"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-bg-elevated font-mono text-sm text-text-secondary">
                  {(user.name?.[0] ?? "?").toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-sm text-text-primary">
                  {user.username ?? user.name}
                </span>
                <span className="font-mono text-xs text-text-tertiary">
                  {user.email}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Submitted Code Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">your_submission</span>
          </div>

          <CodeBlock
            code={code}
            lang={shikiLang}
            header={
              <>
                <span className="size-2.5 rounded-full bg-accent-red" />
                <span className="size-2.5 rounded-full bg-accent-amber" />
                <span className="size-2.5 rounded-full bg-accent-green" />
                <span className="flex-1" />
                <CopyButton text={code} />
              </>
            }
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border-primary" />

        {/* Detailed Analysis */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">detailed_analysis</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {issues.map((issue) => (
              <AnalysisCard.Root key={issue.id}>
                <Badge variant={issue.severity}>{issue.severity}</Badge>
                <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
                <AnalysisCard.Description>
                  {issue.description}
                </AnalysisCard.Description>
              </AnalysisCard.Root>
            ))}
          </div>
        </div>

        {/* Suggested Fix - Split Diff (only if suggestedCode exists) */}
        {diffRows && (
          <>
            {/* Divider */}
            <div className="h-px bg-border-primary" />

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 font-mono text-sm font-bold">
                <span className="text-accent-green">{"//"}</span>
                <span className="text-text-primary">suggested_fix</span>
              </div>

              <SplitDiff.Root
                rows={diffRows}
                originalCode={code}
                suggestedCode={suggestedCode ?? undefined}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

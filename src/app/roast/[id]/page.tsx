import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
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
  } = result;

  const shikiLang = shikiLangMap[language] ?? "plaintext";
  const badgeVariant = getVerdictBadgeVariant(score);

  const diffRows = suggestedCode
    ? generateSplitDiff(code, suggestedCode)
    : null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-20 py-10">
        {/* Score Hero */}
        <div className="flex items-center gap-12">
          <ScoreRing score={score} />

          <div className="flex flex-1 flex-col gap-4">
            <Badge variant={badgeVariant}>
              verdict: {verdict.replaceAll("_", " ")}
            </Badge>

            <p className="font-mono text-xl leading-relaxed text-text-primary">
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

        {/* Submitted Code Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">your_submission</span>
          </div>

          <CodeBlock code={code} lang={shikiLang} />
        </div>

        {/* Divider */}
        <div className="h-px bg-border-primary" />

        {/* Detailed Analysis */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">detailed_analysis</span>
          </div>

          <div className="grid grid-cols-2 gap-5">
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

              <SplitDiff.Root rows={diffRows} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

const mockResult = {
  score: 3.5,
  verdict: "needs_serious_help" as const,
  roast:
    '"this code looks like it was written during a power outage... in 2005."',
  lang: "javascript",
  lines: 7,
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  issues: [
    {
      variant: "critical" as const,
      label: "critical",
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      variant: "warning" as const,
      label: "warning",
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      variant: "good" as const,
      label: "good",
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
    },
    {
      variant: "good" as const,
      label: "good",
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
    },
  ],
  diff: {
    filename: "your_code.ts → improved_code.ts",
    lines: [
      { type: "context" as const, code: "function calculateTotal(items) {" },
      { type: "removed" as const, code: "  var total = 0;" },
      {
        type: "removed" as const,
        code: "  for (var i = 0; i < items.length; i++) {",
      },
      {
        type: "removed" as const,
        code: "    total = total + items[i].price;",
      },
      { type: "removed" as const, code: "  }" },
      { type: "removed" as const, code: "  return total;" },
      {
        type: "added" as const,
        code: "  return items.reduce((sum, item) => sum + item.price, 0);",
      },
      { type: "context" as const, code: "}" },
    ],
  },
};

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  void id; // will be used to fetch real data later

  const { score, verdict, roast, lang, lines, code, issues, diff } = mockResult;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-20 py-10">
        {/* Score Hero */}
        <div className="flex items-center gap-12">
          <ScoreRing score={score} />

          <div className="flex flex-1 flex-col gap-4">
            <Badge variant="critical">verdict: {verdict}</Badge>

            <p className="font-mono text-xl leading-relaxed text-text-primary">
              {roast}
            </p>

            <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
              <span>lang: {lang}</span>
              <span>·</span>
              <span>{lines} lines</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="border border-border-primary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:border-border-secondary"
              >
                $ share_roast
              </button>
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

          <CodeBlock code={code} lang="javascript" />
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
              <AnalysisCard.Root key={issue.title}>
                <Badge variant={issue.variant}>{issue.label}</Badge>
                <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
                <AnalysisCard.Description>
                  {issue.description}
                </AnalysisCard.Description>
              </AnalysisCard.Root>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-primary" />

        {/* Suggested Fix - Diff */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">suggested_fix</span>
          </div>

          <div className="overflow-hidden border border-border-primary bg-bg-input">
            {/* Diff Header */}
            <div className="flex h-10 items-center border-b border-border-primary px-4">
              <span className="font-mono text-xs font-medium text-text-secondary">
                {diff.filename}
              </span>
            </div>

            {/* Diff Body */}
            <div className="flex flex-col py-1">
              {diff.lines.map((line) => (
                <DiffLine key={`${line.type}-${line.code}`} variant={line.type}>
                  {line.code}
                </DiffLine>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

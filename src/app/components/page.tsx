import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { Toggle } from "@/components/ui/toggle";

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen p-12 font-mono">
      <h1 className="mb-12 text-2xl font-bold">{"// components"}</h1>

      <div className="flex flex-col gap-16">
        {/* Button */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<Button />"}
          </h2>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm text-text-secondary">variants</h3>
            <div className="flex items-center gap-4">
              <Button variant="primary">$ primary</Button>
              <Button variant="secondary">$ secondary</Button>
              <Button variant="danger">$ danger</Button>
              <Button variant="link">$ link {">>"}</Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm text-text-secondary">sizes</h3>
            <div className="flex items-center gap-4">
              <Button size="default">$ default</Button>
              <Button size="sm">$ small</Button>
              <Button size="xs">$ xs</Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm text-text-secondary">disabled</h3>
            <div className="flex items-center gap-4">
              <Button variant="primary" disabled>
                $ disabled
              </Button>
              <Button variant="secondary" disabled>
                $ disabled
              </Button>
              <Button variant="danger" disabled>
                $ disabled
              </Button>
              <Button variant="link" disabled>
                $ disabled {">>"}
              </Button>
            </div>
          </div>
        </section>

        {/* Toggle */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<Toggle />"}
          </h2>
          <div className="flex items-center gap-8">
            <Toggle defaultChecked label="roast mode" />
            <Toggle label="roast mode" />
          </div>
        </section>

        {/* Badge */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<Badge />"}
          </h2>
          <div className="flex items-center gap-6">
            <Badge variant="critical">critical</Badge>
            <Badge variant="warning">warning</Badge>
            <Badge variant="good">good</Badge>
          </div>
        </section>

        {/* AnalysisCard */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<AnalysisCard />"}
          </h2>
          <div className="flex max-w-lg flex-col gap-4">
            <AnalysisCard.Root>
              <Badge variant="critical">critical</Badge>
              <AnalysisCard.Title>
                using var instead of const/let
              </AnalysisCard.Title>
              <AnalysisCard.Description>
                the var keyword is function-scoped rather than block-scoped,
                which can lead to unexpected behavior and bugs. modern
                javascript uses const for immutable bindings and let for mutable
                ones.
              </AnalysisCard.Description>
            </AnalysisCard.Root>

            <AnalysisCard.Root>
              <Badge variant="warning">warning</Badge>
              <AnalysisCard.Title>missing error handling</AnalysisCard.Title>
              <AnalysisCard.Description>
                the function does not handle edge cases like null or undefined
                input. consider adding input validation.
              </AnalysisCard.Description>
            </AnalysisCard.Root>

            <AnalysisCard.Root>
              <Badge variant="good">good</Badge>
              <AnalysisCard.Title>clear function naming</AnalysisCard.Title>
              <AnalysisCard.Description>
                the function name clearly describes its purpose, making the code
                easier to understand and maintain.
              </AnalysisCard.Description>
            </AnalysisCard.Root>
          </div>
        </section>

        {/* CodeBlock */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<CodeBlock />"}
          </h2>
          <div className="flex max-w-xl flex-col gap-4">
            <h3 className="text-sm text-text-secondary">default header</h3>
            <CodeBlock
              code={sampleCode}
              lang="javascript"
              filename="calculate.js"
            />
          </div>
          <div className="flex max-w-xl flex-col gap-4">
            <h3 className="text-sm text-text-secondary">custom header</h3>
            <CodeBlock
              code={`eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol`}
              lang="javascript"
              header={
                <span className="font-mono text-xs text-text-secondary">
                  #1 - score: 1.2
                </span>
              }
            />
          </div>
        </section>

        {/* DiffLine */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<DiffLine />"}
          </h2>
          <div className="max-w-xl">
            <DiffLine variant="removed">var total = 0;</DiffLine>
            <DiffLine variant="added">const total = 0;</DiffLine>
            <DiffLine variant="context">
              {"for (let i = 0; i < items.length; i++) {"}
            </DiffLine>
          </div>
        </section>

        {/* ScoreRing */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-accent-green">
            {"<ScoreRing />"}
          </h2>
          <div className="flex items-center gap-12">
            <ScoreRing score={3.5} />
            <ScoreRing score={7.2} />
            <ScoreRing score={10} />
          </div>
        </section>
      </div>
    </div>
  );
}

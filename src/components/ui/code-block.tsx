import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";

type CodeBlockProps = {
  code: string;
  lang: BundledLanguage;
  filename?: string;
  className?: string;
};

async function CodeBlock({ code, lang, filename, className }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vesper",
  });

  return (
    <div
      className={twMerge(
        "overflow-hidden rounded border border-border-primary",
        className,
      )}
    >
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <span className="size-2.5 rounded-full bg-accent-red" />
        <span className="size-2.5 rounded-full bg-accent-amber" />
        <span className="size-2.5 rounded-full bg-accent-green" />
        <span className="flex-1" />
        {filename && (
          <span className="font-mono text-xs text-text-tertiary">
            {filename}
          </span>
        )}
      </div>

      <div
        className="[&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-2xs [&_pre]:leading-relaxed [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export { CodeBlock, type CodeBlockProps };

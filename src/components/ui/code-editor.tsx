"use client";

import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import { twMerge } from "tailwind-merge";
import { detectLanguage } from "@/lib/detect-language";
import { AUTO_DETECT_KEY, languageList, languages } from "@/lib/languages";
import { highlight as shikiHighlight } from "@/lib/shiki";

const MIN_LINES = 16;
const HIGHLIGHT_DEBOUNCE_MS = 300;
const DETECT_DEBOUNCE_MS = 400;
const CODE_MAX_CHARS = 2500;

/**
 * Ensure that `html` contains exactly the same number of `\n` as `code`.
 *
 * `react-simple-code-editor` overlays a `<pre>` on top of a `<textarea>`.
 * Both must render the same number of visual lines; otherwise lines beyond
 * the `<pre>` content become invisible.
 */
function padNewlines(html: string, code: string): string {
  const expected = (code.match(/\n/g) ?? []).length;
  const actual = (html.match(/\n/g) ?? []).length;

  if (actual < expected) {
    return html + "\n".repeat(expected - actual);
  }

  return html;
}

/* ------------------------------------------------------------------ */
/*  CodeEditorRoot                                                     */
/* ------------------------------------------------------------------ */

type CodeEditorRootProps = ComponentProps<"div">;

function CodeEditorRoot({ className, ...props }: CodeEditorRootProps) {
  return (
    <div
      className={twMerge(
        "flex w-full flex-col overflow-clip rounded border border-vesper-border bg-vesper-bg",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CodeEditorHeader                                                   */
/* ------------------------------------------------------------------ */

type CodeEditorHeaderProps = ComponentProps<"div"> & {
  language: string;
  onLanguageChange: (lang: string) => void;
  detectedLabel?: string | null;
};

function CodeEditorHeader({
  className,
  language,
  onLanguageChange,
  detectedLabel,
  ...props
}: CodeEditorHeaderProps) {
  return (
    <div
      className={twMerge(
        "flex h-10 items-center justify-between border-b border-vesper-border px-4",
        className,
      )}
      {...props}
    >
      {/* Traffic light dots */}
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-2">
        {language === AUTO_DETECT_KEY && detectedLabel && (
          <span className="text-2xs text-vesper-gutter">{detectedLabel}</span>
        )}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="cursor-pointer rounded bg-vesper-input-bg px-2 py-1 font-mono text-2xs text-vesper-muted outline-none transition-colors hover:text-vesper-fg"
        >
          <option value={AUTO_DETECT_KEY}>Auto-Detect</option>
          {languageList.map((lang) => (
            <option key={lang.key} value={lang.key}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CodeEditorBody                                                     */
/* ------------------------------------------------------------------ */

type CodeEditorBodyProps = {
  code: string;
  onCodeChange: (code: string) => void;
  /** Language key for highlighting (from our languages map). */
  language: string | null;
  /** Whether auto-detection is active. */
  autoDetect?: boolean;
  onDetectedLanguage?: (key: string) => void;
  className?: string;
};

function CodeEditorBody({
  code,
  onCodeChange,
  language,
  autoDetect = false,
  onDetectedLanguage,
  className,
}: CodeEditorBodyProps) {
  /** Stores the highlighted HTML **and** the source code it was generated from. */
  const [highlightCache, setHighlightCache] = useState<{
    code: string;
    html: string;
  } | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const lineCount = Math.max(code.split("\n").length, MIN_LINES);

  // Async highlight with debounce
  useEffect(() => {
    if (!code.trim()) {
      setHighlightCache(null);
      return;
    }

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    const currentCode = code;

    highlightTimerRef.current = setTimeout(async () => {
      const langEntry = language ? languages[language] : null;
      const shikiLang = langEntry?.shikiKey ?? "javascript";

      const html = await shikiHighlight(currentCode, shikiLang);
      if (html) {
        setHighlightCache({
          code: currentCode,
          html: padNewlines(html, currentCode),
        });
      }
    }, HIGHLIGHT_DEBOUNCE_MS);

    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, [code, language]);

  // Auto-detect language with debounce
  useEffect(() => {
    if (!autoDetect || !code.trim()) {
      return;
    }

    if (detectTimerRef.current) {
      clearTimeout(detectTimerRef.current);
    }

    detectTimerRef.current = setTimeout(() => {
      const detected = detectLanguage(code);
      if (detected) {
        onDetectedLanguage?.(detected);
      }
    }, DETECT_DEBOUNCE_MS);

    return () => {
      if (detectTimerRef.current) {
        clearTimeout(detectTimerRef.current);
      }
    };
  }, [code, autoDetect, onDetectedLanguage]);

  // Sync highlight callback for react-simple-code-editor.
  // Only returns cached HTML when it matches the current code;
  // otherwise falls back to escaped plaintext so every line is visible.
  const syncHighlight = useCallback(
    (input: string) => {
      if (highlightCache && highlightCache.code === input) {
        return highlightCache.html;
      }
      // Escape HTML so the raw code renders safely while loading
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    [highlightCache],
  );

  return (
    <div className={twMerge("min-h-90 max-h-120 overflow-y-auto", className)}>
      <div className="flex">
        {/* Line Numbers */}
        <div
          aria-hidden="true"
          className="flex flex-col border-r border-vesper-border bg-vesper-gutter-bg px-3 py-4 font-mono text-xs leading-relaxed text-vesper-gutter"
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const line = i + 1;
            return (
              <span key={`ln-${line}`} className="text-right">
                {line}
              </span>
            );
          })}
        </div>

        {/* Editor */}
        <Editor
          placeholder="// Paste your code here"
          value={code}
          onValueChange={onCodeChange}
          highlight={syncHighlight}
          tabSize={2}
          padding={16}
          textareaClassName="code-editor-textarea"
          preClassName="code-editor-pre"
          style={{
            fontFamily:
              "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.75rem",
            lineHeight: "1.625",
            flex: 1,
            background: "transparent",
            caretColor: "var(--color-vesper-caret)",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CodeEditorFooter                                                   */
/* ------------------------------------------------------------------ */

type CodeEditorFooterProps = ComponentProps<"div"> & {
  /** Current character count of the code. */
  charCount: number;
};

function CodeEditorFooter({
  className,
  charCount,
  ...props
}: CodeEditorFooterProps) {
  const isOverLimit = charCount > CODE_MAX_CHARS;

  return (
    <div
      className={twMerge(
        "flex items-center justify-end border-t border-vesper-border px-4 py-2",
        className,
      )}
      {...props}
    >
      <span
        className={twMerge(
          "font-mono text-2xs tabular-nums text-vesper-gutter",
          isOverLimit && "text-accent-red",
        )}
      >
        {charCount} / {CODE_MAX_CHARS}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Namespace export                                                   */
/* ------------------------------------------------------------------ */

const CodeEditor = {
  Root: CodeEditorRoot,
  Header: CodeEditorHeader,
  Body: CodeEditorBody,
  Footer: CodeEditorFooter,
};

export {
  CodeEditor,
  CODE_MAX_CHARS,
  type CodeEditorRootProps,
  type CodeEditorHeaderProps,
  type CodeEditorBodyProps,
  type CodeEditorFooterProps,
};

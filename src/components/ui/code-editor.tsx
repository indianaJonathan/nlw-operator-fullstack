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

/**
 * Strip shiki's outer `<pre><code>` wrapper, keeping only the inner
 * `<span class="line">` elements with `\n` separators.
 */
function stripShikiWrapper(html: string): string {
  return html
    .replace(/^<pre[^>]*><code>/, "")
    .replace(/<\/code><\/pre>\s*$/, "");
}

/* ------------------------------------------------------------------ */
/*  CodeEditorRoot                                                     */
/* ------------------------------------------------------------------ */

type CodeEditorRootProps = ComponentProps<"div">;

function CodeEditorRoot({ className, ...props }: CodeEditorRootProps) {
  return (
    <div
      className={twMerge(
        "w-full overflow-hidden rounded border border-vesper-border bg-vesper-bg",
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
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const lineCount = Math.max(code.split("\n").length, MIN_LINES);

  // Async highlight with debounce
  useEffect(() => {
    if (!code.trim()) {
      setHighlightedHtml("");
      return;
    }

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    highlightTimerRef.current = setTimeout(async () => {
      const langEntry = language ? languages[language] : null;
      const shikiLang = langEntry?.shikiKey ?? "javascript";

      const html = await shikiHighlight(code, shikiLang);
      if (html) {
        setHighlightedHtml(stripShikiWrapper(html));
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
  // Returns cached HTML or falls back to escaped plaintext.
  const syncHighlight = useCallback(
    (input: string) => {
      if (highlightedHtml) {
        return highlightedHtml;
      }
      // Escape HTML so the raw code renders safely while loading
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    [highlightedHtml],
  );

  return (
    <div className={twMerge("flex min-h-90", className)}>
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
          minHeight: "100%",
          background: "transparent",
          caretColor: "var(--color-vesper-caret)",
        }}
      />
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
};

export {
  CodeEditor,
  type CodeEditorRootProps,
  type CodeEditorHeaderProps,
  type CodeEditorBodyProps,
};

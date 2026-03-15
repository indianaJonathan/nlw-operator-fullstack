"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { RoastLoadingOverlay } from "@/components/roast-loading-overlay";
import { Button } from "@/components/ui/button";
import { CODE_MAX_CHARS, CodeEditor } from "@/components/ui/code-editor";
import { Toggle } from "@/components/ui/toggle";
import type { languageEnum } from "@/db/schema";
import {
  AUTO_DETECT_KEY,
  editorKeyToDbLanguage,
  languages,
} from "@/lib/languages";
import { useTRPC } from "@/trpc/client";

function CodeEditorSection() {
  const router = useRouter();
  const trpc = useTRPC();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(AUTO_DETECT_KEY);
  const [detectedLangKey, setDetectedLangKey] = useState<string | null>(null);
  const [roastMode, setRoastMode] = useState(true);

  const hasCode = code.trim().length > 0;
  const isOverLimit = code.length > CODE_MAX_CHARS;

  const detectedLabel = detectedLangKey
    ? (languages[detectedLangKey]?.label ?? null)
    : null;

  const handleDetectedLanguage = useCallback((key: string) => {
    setDetectedLangKey(key);
  }, []);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    if (lang === AUTO_DETECT_KEY) {
      setDetectedLangKey(null);
    }
  }, []);

  const isAutoDetect = language === AUTO_DETECT_KEY;

  /** Resolve the effective language for highlighting. */
  const effectiveLanguage = isAutoDetect ? detectedLangKey : language;

  type DbLanguage = (typeof languageEnum.enumValues)[number];

  /** Resolve the DB language enum value for submission. */
  const resolveDbLanguage = (): DbLanguage => {
    const editorKey = effectiveLanguage ?? "plaintext";
    return (editorKeyToDbLanguage[editorKey] ?? "plaintext") as DbLanguage;
  };

  const createSubmission = useMutation(
    trpc.submission.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/roast/${data.id}`);
      },
    }),
  );

  const handleSubmit = () => {
    if (!hasCode || isOverLimit || createSubmission.isPending) return;

    createSubmission.mutate({
      code: code.trim(),
      language: resolveDbLanguage(),
      roastMode,
    });
  };

  return (
    <>
      <RoastLoadingOverlay open={createSubmission.isPending} />

      {/* Code Editor */}
      <CodeEditor.Root className="max-w-195">
        <CodeEditor.Header
          language={language}
          onLanguageChange={handleLanguageChange}
          detectedLabel={detectedLabel}
        />
        <CodeEditor.Body
          code={code}
          onCodeChange={setCode}
          language={effectiveLanguage}
          autoDetect={isAutoDetect}
          onDetectedLanguage={handleDetectedLanguage}
        />
        <CodeEditor.Footer charCount={code.length} />
      </CodeEditor.Root>

      {/* Actions Bar */}
      <div className="flex w-full max-w-195 items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            onCheckedChange={setRoastMode}
            label="roast mode"
          />
          <span className="text-xs text-text-tertiary">
            {roastMode ? "// maximum sarcasm enabled" : "// professional mode"}
          </span>
        </div>
        <Button
          variant="primary"
          disabled={!hasCode || isOverLimit || createSubmission.isPending}
          className="disabled:cursor-not-allowed enabled:cursor-pointer"
          onClick={handleSubmit}
        >
          {createSubmission.isPending ? "$ roasting..." : "$ roast_my_code"}
        </Button>
      </div>

      {/* Error feedback */}
      {createSubmission.isError && (
        <div className="w-full max-w-195 font-mono text-xs text-accent-red">
          {"// error: "}
          {createSubmission.error.message || "something went wrong. try again."}
        </div>
      )}
    </>
  );
}

export { CodeEditorSection };

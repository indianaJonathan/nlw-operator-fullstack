"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoginModal } from "@/components/login-modal";
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

const PENDING_ROAST_KEY = "devroast:pending-roast";

type PendingRoast = {
  code: string;
  language: string;
  detectedLanguage: string | null;
  roastMode: boolean;
};

function savePendingRoast(data: PendingRoast) {
  sessionStorage.setItem(PENDING_ROAST_KEY, JSON.stringify(data));
}

function consumePendingRoast(): PendingRoast | null {
  const raw = sessionStorage.getItem(PENDING_ROAST_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_ROAST_KEY);
  try {
    return JSON.parse(raw) as PendingRoast;
  } catch {
    return null;
  }
}

type CodeEditorSectionProps = {
  isAuthenticated: boolean;
};

function CodeEditorSection({ isAuthenticated }: CodeEditorSectionProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(AUTO_DETECT_KEY);
  const [detectedLangKey, setDetectedLangKey] = useState<string | null>(null);
  const [roastMode, setRoastMode] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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
  const resolveDbLanguage = (editorKey?: string | null): DbLanguage => {
    const key = editorKey ?? effectiveLanguage ?? "plaintext";
    return (editorKeyToDbLanguage[key] ?? "plaintext") as DbLanguage;
  };

  const createSubmission = useMutation(
    trpc.submission.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/roast/${data.id}`);
      },
    }),
  );
  const mutate = createSubmission.mutate;

  // Restore pending roast after login redirect
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const pending = consumePendingRoast();
    if (!pending) return;

    setCode(pending.code);
    setLanguage(pending.language);
    setRoastMode(pending.roastMode);

    const editorKey =
      pending.language === AUTO_DETECT_KEY
        ? (pending.detectedLanguage ?? "plaintext")
        : pending.language;
    const dbLang = (editorKeyToDbLanguage[editorKey] ??
      "plaintext") as DbLanguage;

    mutate({
      code: pending.code.trim(),
      language: dbLang,
      roastMode: pending.roastMode,
      anonymous: false,
    });
  }, [isAuthenticated, mutate]);

  const handleSignIn = () => {
    savePendingRoast({
      code,
      language,
      detectedLanguage: detectedLangKey,
      roastMode,
    });
  };

  const handleSubmit = () => {
    if (!hasCode || isOverLimit || createSubmission.isPending) return;

    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    createSubmission.mutate({
      code: code.trim(),
      language: resolveDbLanguage(),
      roastMode,
      anonymous: false,
    });
  };

  return (
    <>
      <RoastLoadingOverlay open={createSubmission.isPending} />
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSignIn={handleSignIn}
      />

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

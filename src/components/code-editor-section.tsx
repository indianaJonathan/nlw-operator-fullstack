"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Toggle } from "@/components/ui/toggle";
import { AUTO_DETECT_KEY, languages } from "@/lib/languages";

function CodeEditorSection() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(AUTO_DETECT_KEY);
  const [detectedLangKey, setDetectedLangKey] = useState<string | null>(null);

  const hasCode = code.trim().length > 0;

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

  return (
    <>
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
      </CodeEditor.Root>

      {/* Actions Bar */}
      <div className="flex w-full max-w-195 items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle defaultChecked label="roast mode" />
          <span className="text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>
        <Button
          variant="primary"
          disabled={!hasCode}
          className="disabled:cursor-not-allowed enabled:cursor-pointer"
        >
          $ roast_my_code
        </Button>
      </div>
    </>
  );
}

export { CodeEditorSection };

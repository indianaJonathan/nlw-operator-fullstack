"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const placeholder = `// paste your code here...`;

const MIN_LINES = 16;

function CodeEditorSection() {
  const [code, setCode] = useState("");

  const lines = code.split("\n");
  const lineCount = Math.max(lines.length, MIN_LINES);
  const hasCode = code.trim().length > 0;

  return (
    <>
      {/* Code Editor */}
      <div className="w-full max-w-195 overflow-hidden rounded border border-border-primary bg-bg-input">
        {/* Window Header */}
        <div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
          <span className="size-3 rounded-full bg-accent-red" />
          <span className="size-3 rounded-full bg-accent-amber" />
          <span className="size-3 rounded-full bg-accent-green" />
        </div>

        {/* Code Body */}
        <div className="flex min-h-90">
          {/* Line Numbers */}
          <div className="flex flex-col gap-2 border-r border-border-primary bg-bg-surface px-3 py-4 font-mono text-xs leading-relaxed text-text-tertiary">
            {Array.from({ length: lineCount }, (_, i) => {
              const line = i + 1;
              return (
                <span key={`ln-${line}`} className="text-right">
                  {line}
                </span>
              );
            })}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </div>
      </div>

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

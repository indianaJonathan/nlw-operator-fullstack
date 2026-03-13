import hljs from "highlight.js/lib/common";
import { hljsToKey } from "@/lib/languages";

/**
 * Auto-detect the programming language of a code snippet.
 *
 * Uses highlight.js `highlightAuto` for detection and maps the result
 * to our internal language key via `hljsToKey`. Returns `null` if the
 * detected language is not in our supported set or if detection fails.
 *
 * Debouncing is the caller's responsibility.
 */
function detectLanguage(code: string): string | null {
  if (!code.trim()) {
    return null;
  }

  const result = hljs.highlightAuto(code);

  if (!result.language) {
    return null;
  }

  return hljsToKey[result.language] ?? null;
}

export { detectLanguage };

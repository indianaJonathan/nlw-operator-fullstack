import { type BundledLanguage, createHighlighter } from "shiki/bundle/web";
import { vesperPP } from "@/lib/vesper-pp-theme";

/** Languages pre-loaded at initialization for instant highlighting. */
const PRELOAD_LANGS: BundledLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "sql",
  "html",
];

const THEME = vesperPP.name;

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

/**
 * Returns a singleton shiki highlighter (client-side, web bundle).
 * Uses the custom Vesper++ theme (more colorized fork of Vesper).
 * The first call triggers initialization; subsequent calls return
 * the same resolved instance.
 */
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [vesperPP],
      langs: PRELOAD_LANGS,
    });
  }
  return highlighterPromise;
}

/**
 * Highlight code to an HTML string using shiki + Vesper++ theme.
 *
 * If the language is not yet loaded, it will be lazy-loaded first.
 * Returns an empty string if highlighting fails (e.g. unsupported lang).
 */
async function highlight(code: string, lang: BundledLanguage): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const loadedLangs = highlighter.getLoadedLanguages();

    if (!loadedLangs.includes(lang)) {
      await highlighter.loadLanguage(lang);
    }

    return highlighter.codeToHtml(code, { lang, theme: THEME });
  } catch {
    return "";
  }
}

export { getHighlighter, highlight, THEME };

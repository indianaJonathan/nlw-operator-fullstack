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

const THEME = vesperPP.name as string;

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

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Highlight code and return **flat** HTML (no `<pre>/<code>/<span class="line">`
 * wrappers). Each token becomes a `<span style="color:…">` and lines are joined
 * with literal `\n`.
 *
 * This output is designed for `react-simple-code-editor`, which overlays a `<pre>`
 * on a `<textarea>`. Both must have the exact same number of `\n` characters so
 * their visual lines stay aligned.
 */
async function highlight(code: string, lang: BundledLanguage): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const loadedLangs = highlighter.getLoadedLanguages();

    if (!loadedLangs.includes(lang)) {
      await highlighter.loadLanguage(lang);
    }

    const { tokens } = highlighter.codeToTokens(code, { lang, theme: THEME });

    const html = tokens
      .map((line) =>
        line.length === 0
          ? ""
          : line
              .map((token) =>
                token.color
                  ? `<span style="color:${token.color}">${escapeHtml(token.content)}</span>`
                  : escapeHtml(token.content),
              )
              .join(""),
      )
      .join("\n");

    return html;
  } catch {
    return "";
  }
}

export { getHighlighter, highlight, THEME };

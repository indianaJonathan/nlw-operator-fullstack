import type { BundledLanguage } from "shiki/bundle/web";

type Language = {
  label: string;
  shikiKey: BundledLanguage;
  hljsKey: string;
};

/**
 * Map of supported languages for the code editor.
 * Keys are internal identifiers; each entry maps to a shiki language
 * (from `shiki/bundle/web`) and a highlight.js language key.
 *
 * Only languages available in both shiki web bundle and hljs common
 * are included. Languages outside the web bundle (go, rust, ruby,
 * swift, kotlin) are intentionally excluded.
 */
const languages: Record<string, Language> = {
  javascript: {
    label: "JavaScript",
    shikiKey: "javascript",
    hljsKey: "javascript",
  },
  typescript: {
    label: "TypeScript",
    shikiKey: "typescript",
    hljsKey: "typescript",
  },
  jsx: { label: "JSX", shikiKey: "jsx", hljsKey: "javascript" },
  tsx: { label: "TSX", shikiKey: "tsx", hljsKey: "typescript" },
  python: { label: "Python", shikiKey: "python", hljsKey: "python" },
  html: { label: "HTML", shikiKey: "html", hljsKey: "xml" },
  css: { label: "CSS", shikiKey: "css", hljsKey: "css" },
  json: { label: "JSON", shikiKey: "json", hljsKey: "json" },
  sql: { label: "SQL", shikiKey: "sql", hljsKey: "sql" },
  bash: { label: "Bash", shikiKey: "shellscript", hljsKey: "bash" },
  c: { label: "C", shikiKey: "c", hljsKey: "c" },
  cpp: { label: "C++", shikiKey: "cpp", hljsKey: "cpp" },
  java: { label: "Java", shikiKey: "java", hljsKey: "java" },
  php: { label: "PHP", shikiKey: "php", hljsKey: "php" },
  r: { label: "R", shikiKey: "r", hljsKey: "r" },
  yaml: { label: "YAML", shikiKey: "yaml", hljsKey: "yaml" },
  markdown: { label: "Markdown", shikiKey: "markdown", hljsKey: "markdown" },
  graphql: { label: "GraphQL", shikiKey: "graphql", hljsKey: "graphql" },
  scss: { label: "SCSS", shikiKey: "scss", hljsKey: "scss" },
  xml: { label: "XML", shikiKey: "xml", hljsKey: "xml" },
};

const AUTO_DETECT_KEY = "auto";

/**
 * Map hljs language key -> our internal language key.
 * Used by `detectLanguage` to resolve auto-detect results.
 */
const hljsToKey: Record<string, string> = {};
for (const [key, lang] of Object.entries(languages)) {
  hljsToKey[lang.hljsKey] = key;
}

/** Sorted list of language entries for dropdown rendering. */
const languageList = Object.entries(languages)
  .map(([key, lang]) => ({ key, label: lang.label }))
  .sort((a, b) => a.label.localeCompare(b.label));

export { languages, languageList, hljsToKey, AUTO_DETECT_KEY, type Language };

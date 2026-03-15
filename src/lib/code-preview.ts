import { cacheLife } from "next/cache";
import { codeToHtml } from "shiki";
import { shikiLangMap } from "@/lib/languages";
import { vesperPP } from "@/lib/vesper-pp-theme";

const CODE_PREVIEW_LINES = 3;

const commentPatterns = [
  /^\s*\/\//, // // comment
  /^\s*#/, // # comment (python, bash, ruby, etc.)
  /^\s*--/, // -- comment (sql)
  /^\s*\/\*/, // /* block comment start
  /^\s*\*/, // * block comment continuation
  /^\s*\*\//, // */ block comment end
];

function isComment(line: string) {
  return commentPatterns.some((pattern) => pattern.test(line));
}

function getPreviewCode(code: string) {
  const lines = code.split("\n");
  const meaningful: string[] = [];
  let totalMeaningful = 0;

  for (const line of lines) {
    if (line.trim() === "") continue;
    if (isComment(line)) continue;
    totalMeaningful++;
    if (meaningful.length < CODE_PREVIEW_LINES) {
      meaningful.push(line);
    }
  }

  return {
    code: meaningful.join("\n"),
    hasMore: totalMeaningful > CODE_PREVIEW_LINES,
  };
}

async function highlightCode(code: string, language: string) {
  "use cache";
  cacheLife("max");

  const lang = shikiLangMap[language];

  if (!lang) {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code>${escaped}</code></pre>`;
  }

  const html = await codeToHtml(code, {
    lang,
    theme: vesperPP,
  });

  // Remove shiki inline background-color so the row bg shows through
  return html.replace(/background-color:#[0-9a-fA-F]+/g, "");
}

export { getPreviewCode, highlightCode };

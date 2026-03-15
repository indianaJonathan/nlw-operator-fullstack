# Lib — Utilitários

Módulos utilitários reutilizáveis que não pertencem a nenhuma feature específica.

## Convenções

- Um módulo por responsabilidade.
- Arquivos em kebab-case.
- Named exports apenas.
- Sem dependência de React (exceto quando necessário para singletons com cache).

---

## Módulos

### `languages.ts` — Mapa de linguagens suportadas

Define as linguagens suportadas pelo projeto com mapeamento entre chaves internas, shiki e highlight.js.

```tsx
type Language = {
  label: string;         // Nome exibido na UI ("JavaScript")
  shikiKey: BundledLanguage; // Chave do shiki ("javascript")
  hljsKey: string;       // Chave do highlight.js ("javascript")
};
```

**Exports**:
- `languages`: `Record<string, Language>` — mapa completo (20 linguagens)
- `languageList`: array ordenado por label para renderização em dropdowns
- `AUTO_DETECT_KEY`: constante `"auto"` usada no dropdown de linguagem
- `hljsToKey`: `Record<string, string>` — mapa reverso hljs → chave interna

Para adicionar uma nova linguagem, adicionar entrada no objeto `languages` com as três chaves.

---

### `detect-language.ts` — Detecção automática de linguagem

Wrapper sobre `hljs.highlightAuto()` do `highlight.js/lib/common`. Retorna a chave interna da linguagem detectada ou `null`.

```tsx
import { detectLanguage } from "@/lib/detect-language";

const lang = detectLanguage(code); // "javascript" | "python" | null
```

- Importa apenas `highlight.js/lib/common` (subset menor, ~50 kB).
- O debounce é responsabilidade do caller (não está no módulo).

---

### `shiki.ts` — Singleton do highlighter shiki (client-side)

Highlighter para uso em **client components** (code editor). Usa `shiki/bundle/web` e o tema customizado `vesper-pp`.

```tsx
import { highlight } from "@/lib/shiki";

const html = await highlight(code, "typescript");
// Retorna HTML flat: spans com style="color:..." separados por \n
// Sem wrappers <pre>/<code>/<span class="line">
```

**Características**:
- Singleton: `getHighlighter()` cria uma vez, reutiliza.
- Pre-load: javascript, typescript, python, sql, html.
- Lazy-load: outras linguagens carregadas sob demanda.
- Output flat: `structure: "inline"` — cada token é um `<span style="color:...">`, linhas separadas por `\n`.

**Importante**: para server components, usar `codeToHtml` diretamente do shiki com o tema built-in `"vesper"` (ver `CodeBlock` em `src/components/ui/code-block.tsx`).

---

### `vesper-pp-theme.ts` — Tema shiki customizado

Fork do tema Vesper (por raunofreiberg) com mais cores. Usado exclusivamente no client-side (`shiki.ts`).

Cores principais:
- Background: `#101010`, Foreground: `#FFF`
- Keywords: `#FBADFF` (rosa/magenta)
- Functions/tags: `#FFC799` (laranja)
- Strings/symbols: `#99FFE4` (verde)
- Comments: `#595959` (cinza)
- Errors: `#FF8080` (vermelho)

**Não modificar** sem validar visualmente no code editor.

# Spec: Code Editor com Syntax Highlight

## Contexto

O editor atual (`src/components/code-editor-section.tsx`) é um `<textarea>` simples sem syntax highlight. O objetivo é transformá-lo em um editor com highlight em tempo real, detecção automática de linguagem e opção de seleção manual.

---

## Pesquisa realizada

### Como o ray-so funciona

O [ray-so](https://github.com/raycast/ray-so) usa uma abordagem **textarea overlay**:

- Um `<textarea>` transparente (`background: transparent`, `-webkit-text-fill-color: transparent`) fica em `z-index: 2`
- Abaixo dele, um `<div>` renderiza o HTML syntax-highlighted via `dangerouslySetInnerHTML`
- Ambos compartilham a mesma grid cell CSS, mesma fonte, mesmo padding — ficam perfeitamente alinhados
- O cursor do textarea fica visível via `caret-color`
- **Highlighting**: shiki v1 com WASM e CSS variables theme
- **Auto-detect**: `highlight.js` (`highlightAuto()`) apenas para detecção; shiki faz o rendering
- **Keyboard**: Tab (indent/dedent), Enter (auto-indent), Escape (blur) — implementados manualmente
- **State**: Jotai atoms. Linguagens lazy-loaded sob demanda
- **SSR**: desabilitado para o editor (`"use client"` + `next/dynamic` com `ssr: false`)

### Opções avaliadas

| Opção | Bundle (gzip) | Prós | Contras |
|---|---|---|---|
| **react-simple-code-editor + shiki** | ~3.4 kB (editor) + 0 (shiki já instalado) | Overlay já resolvido; Tab/undo/redo built-in; plugável com qualquer highlighter | Highlight prop é síncrona (shiki é async — precisa de wrapper com cache) |
| **shiki + textarea overlay custom** | 0 (shiki já instalado) | Zero dependência nova; controle total | ~60-80 linhas de CSS/React para scroll sync, line-height, resize |
| **CodeMirror 6** | ~80-120 kB | Melhor experiência de editor; parser incremental | Overkill para paste + edição leve; não é React nativo; sem auto-detect |
| **Prism.js + overlay** | ~7 kB (core) | Leve; rápido | Menos preciso que shiki; CJS/globals; redundante com shiki já no projeto |

### Auto-detecção de linguagem

| Opção | Precisão | Bundle |
|---|---|---|
| **highlight.js `highlightAuto`** | Boa (~37 langs) | ~80 kB gzip (`highlight.js/lib/common`) |
| Heurística custom | Baixa (~10 langs) | 0 kB |
| Só seleção manual | N/A | 0 kB |

---

## Decisão

### Editor: `react-simple-code-editor` + `shiki`

**Motivo**: shiki já está no projeto (mesmo tema `vesper`, mesma precisão dos outros componentes). O `react-simple-code-editor` (3.4 kB) resolve o overlay e entrega Tab, undo/redo e alinhamento de texto sem precisar reimplementar.

### Auto-detect: `highlight.js/lib/common`

**Motivo**: battle-tested, mesma abordagem do ray-so. Usado **apenas** para detecção (`.language`), não para rendering. O rendering fica 100% com shiki.

### Seleção manual: dropdown com "Auto-Detect" como opção padrão

O usuário pode trocar a linguagem manualmente. Se selecionar "Auto-Detect", volta a usar `highlightAuto`.

---

## Arquitetura

```
src/
  components/
    code-editor-section.tsx    # refatorar — orquestra editor + actions bar
  components/ui/
    code-editor.tsx            # novo — componente do editor com highlight
  lib/
    shiki.ts                   # novo — instância singleton do highlighter (client-side)
    detect-language.ts         # novo — wrapper do highlightAuto
    languages.ts               # novo — mapa de linguagens suportadas (label, shiki key, hljs key)
```

### Fluxo

```
1. Usuário cola/digita código no editor
2. onChange → atualiza state do código
3. Se "Auto-Detect" ativo:
   a. debounce(300ms) → hljs.highlightAuto(code) → detecta linguagem
   b. Atualiza state da linguagem detectada
4. shiki.codeToHtml(code, { lang, theme: 'vesper' }) → HTML highlighted
5. react-simple-code-editor renderiza o HTML no <pre> overlay
6. Usuário pode trocar linguagem manualmente no dropdown → desativa auto-detect
```

### Detalhes técnicos

**Highlighter singleton** (`lib/shiki.ts`):
- Usar `createHighlighterCore` do `shiki/bundle/web` com engine JS (não WASM — mais leve)
- Pré-carregar `vesper` theme + top 5 linguagens (js, ts, python, sql, html)
- Outras linguagens lazy-loaded sob demanda via `highlighter.loadLanguage()`
- Exportar função `getHighlighter()` que retorna a instância (Promise resolvida uma vez)

**Highlight assíncrono + react-simple-code-editor**:
- O `highlight` prop do `react-simple-code-editor` espera retorno síncrono (`string → string`)
- Solução: manter um state `highlightedHtml` e atualizar via `useEffect` com debounce
- Enquanto o highlight processa, mostrar o HTML anterior (sem flash)
- Alternativa: usar `codeToTokens()` + renderizar tokens como JSX (evita `dangerouslySetInnerHTML`)

**Auto-detect** (`lib/detect-language.ts`):
- Importar `hljs` de `highlight.js/lib/common`
- `detectLanguage(code: string): string` → retorna key da linguagem (ex: `"javascript"`)
- Mapear keys do hljs para keys do shiki via `languages.ts`
- Debounce de 300ms para não rodar a cada keystroke

**Dropdown de linguagem**:
- Componente `<select>` ou Base UI combobox
- Opções: "Auto-Detect" (default) + lista de ~20 linguagens comuns
- Ao selecionar manualmente, salvar em state e pular o auto-detect
- Ao selecionar "Auto-Detect", limpar seleção manual e reativar detecção

**SSR**:
- O editor é `"use client"` — shiki no client usa `shiki/bundle/web`
- O `<CodeBlock>` existente (server component) continua usando `shiki` normal
- Sem conflito — são imports diferentes

---

## Impacto no bundle

| Dependência | Tamanho (gzip) | Nota |
|---|---|---|
| `react-simple-code-editor` | ~3.4 kB | Nova dependência |
| `highlight.js/lib/common` | ~80 kB | Nova dependência (só auto-detect) |
| `shiki/bundle/web` (client) | ~15-25 kB | Já instalado, novo entry point client-side |
| **Total estimado** | **~100 kB** | |

---

## To-dos de implementação

- [ ] Instalar `react-simple-code-editor` e `highlight.js`
- [ ] Criar `src/lib/languages.ts` com mapa de linguagens (label, shiki key, hljs key)
- [ ] Criar `src/lib/shiki.ts` com highlighter singleton client-side (`shiki/bundle/web` + `vesper`)
- [ ] Criar `src/lib/detect-language.ts` com wrapper debounced do `highlightAuto`
- [ ] Criar `src/components/ui/code-editor.tsx` — componente composto do editor
  - [ ] Integrar `react-simple-code-editor` com highlight via shiki
  - [ ] Resolver async highlight (state + useEffect + debounce)
  - [ ] Manter line numbers sincronizados
  - [ ] Estilizar com tokens Tailwind (`bg-bg-input`, `border-border-primary`, etc.)
  - [ ] Suportar Tab indent/dedent (built-in do react-simple-code-editor)
- [ ] Criar dropdown de seleção de linguagem com opção "Auto-Detect"
- [ ] Integrar auto-detect: `highlightAuto` → state de linguagem → shiki re-highlight
- [ ] Refatorar `src/components/code-editor-section.tsx` para usar o novo `<CodeEditor>`
- [ ] Garantir que o highlight usa o tema `vesper` igual ao `<CodeBlock>` existente
- [ ] Testar: paste de código, edição, troca de linguagem, auto-detect
- [ ] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `react-simple-code-editor` espera highlight síncrono mas shiki é async | Usar pattern de cache: state `highlightedHtml` atualizado via `useEffect`. O editor mostra o último HTML válido enquanto processa. |
| Performance em code grande (>100 linhas) | Debounce de 300ms no highlight. `codeToHtml` do shiki com engine JS é rápido o suficiente para snippets. |
| `highlight.js/lib/common` adiciona ~80 kB | Aceitável para a funcionalidade. Alternativa futura: substituir por heurística custom se o bundle ficar pesado. |
| Scroll sync entre textarea e pre overlay | `react-simple-code-editor` já resolve isso internamente. |
| Mismatch de fontes entre textarea e highlight | Usar mesma `font-family` (JetBrains Mono) e `font-size` em ambos via classe compartilhada. |

---

## Referências

- [ray-so source](https://github.com/raycast/ray-so) — `app/(navigation)/(code)/components/Editor.tsx`
- [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor)
- [shiki docs](https://shiki.style/)
- [highlight.js highlightAuto](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto)

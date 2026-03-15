# Spec: Criacao de Roasts

## Contexto

A homepage ja possui um editor de codigo funcional com toggle de roast mode e botao "$ roast_my_code", mas o botao nao faz nada. A pagina `/roast/[id]` exibe o resultado completo (ScoreRing, issues, diff) mas usa dados mock hardcoded. O banco ja tem as tabelas `submissions` e `issues` populadas pelo seed. Faltava a integracao com IA para analisar o codigo e os procedures tRPC `create` e `getById` para persistir e consultar resultados.

---

## Decisao

### Google Gemini 2.0 Flash via `@google/genai`

SDK oficial do Google, leve e direto. Suporta structured output nativo via `responseJsonSchema` + `responseMimeType: "application/json"`, garantindo que `response.text` seja JSON valido. Modelo `gemini-2.0-flash` e rapido e barato, ideal para MVP.

### Structured output (sem parsing manual)

O Gemini retorna JSON garantido quando usa `responseJsonSchema`. O schema e definido inline usando `Type` do `@google/genai`. A resposta e parseada com `JSON.parse(response.text)` com validacao pos-parse (clamp de score, validacao de verdict e severities).

### Overlay de loading com animacao

Modal/overlay fullscreen com fundo escuro semi-transparente e backdrop blur. Animacao com icones do `lucide-react` (Flame + Code + Terminal). Mensagem "roasting your code..." com loading bar animada. Bloqueia scroll do body enquanto aberto.

### Cache invalidation via `revalidateTag`

Apos criar uma submission, a mutation chama `revalidateTag` nas tags `submission-stats`, `leaderboard-preview` e `leaderboard` para que os dados atualizem imediatamente.

### Diff com lib `diff`

A lib `diff` do npm (~7kB, server-only) gera diff real linha-a-linha com algoritmo LCS. Mais preciso que comparacao simples.

### Fallback de linguagem para `plaintext`

Linguagens do editor sem match no enum do banco (json, yaml, markdown, graphql, r) vao como `plaintext`. Mapa `editorKeyToDbLanguage` em `src/lib/languages.ts`.

### Sem share roast

A feature de compartilhamento nao foi implementada nesta iteracao. O botao "$ share_roast" foi removido da pagina de resultado.

---

## Arquitetura

### Estrutura de arquivos

**Novos:**
```
src/lib/gemini.ts              -- Client Gemini lazy singleton
src/lib/analyze-code.ts        -- Servico de analise com prompt + structured output
src/lib/generate-diff.ts       -- Diff visual entre codigo original e sugerido
src/components/roast-loading-overlay.tsx  -- Overlay animado de loading
```

**Alterados:**
```
src/lib/languages.ts           -- Adicionado mapa editorKeyToDbLanguage
src/trpc/routers/submission.ts -- Adicionado procedures create + getById
src/components/code-editor-section.tsx -- Conectado mutation + overlay + redirect
src/app/roast/[id]/page.tsx    -- Removido mock, consumindo dados reais via caller
src/app/globals.css            -- Adicionada animacao loading-bar
.env.example                   -- Adicionado GEMINI_API_KEY
```

### Fluxo de dados

```
1. Usuario cola codigo no editor, configura roast mode, clica "$ roast_my_code"
2. CodeEditorSection dispara mutation tRPC submission.create
3. Overlay de loading aparece
4. Mutation no server:
   a. Chama analyzeCode() que envia codigo para Gemini 2.0 Flash
   b. Gemini retorna structured JSON (score, verdict, roast, issues, suggestedCode)
   c. Insere submission + issues em transacao Drizzle
   d. revalidateTag para invalidar caches do leaderboard/stats
   e. Retorna { id }
5. onSuccess: router.push('/roast/{id}')
6. Pagina /roast/[id]:
   a. caller.submission.getById({ id })
   b. Renderiza ScoreRing, Badge, CodeBlock, AnalysisCards
   c. Se suggestedCode existe, gera diff e renderiza DiffLines
```

### Detalhes do prompt

Dois system prompts distintos:
- **Roast mode ON**: Personalidade sarcastica, humor acido, metaforas criativas. Temperature 0.9.
- **Roast mode OFF**: Profissional, direto, construtivo. Temperature 0.4.

Schema de resposta:
- `score`: 0.0-10.0 (1 casa decimal)
- `verdict`: um dos 6 valores validos
- `roast`: frase resumo
- `issues`: 2-6 issues com severity (critical/warning/good), title, description
- `suggestedCode`: codigo melhorado completo ou null

---

## Impacto no bundle

| Dependencia | Tamanho (gzip) | Nota |
|---|---|---|
| `@google/genai` | ~30 kB | Server-only (nao entra no client bundle) |
| `lucide-react` (3 icons) | ~3 kB | Tree-shaked, apenas Flame + Code + Terminal |
| `diff` | ~7 kB | Server-only (usado em generate-diff.ts) |
| **Total novo no client** | **~3 kB** | Apenas icones do lucide |

---

## To-dos de implementacao

- [x] Instalar dependencias: `@google/genai`, `lucide-react`, `diff`
- [x] Criar `src/lib/gemini.ts` — client Gemini lazy singleton
- [x] Criar `src/lib/analyze-code.ts` — servico de analise com prompt e structured output
- [x] Criar `src/lib/generate-diff.ts` — diff visual com lib diff
- [x] Adicionar `editorKeyToDbLanguage` em `src/lib/languages.ts`
- [x] Adicionar procedures `create` + `getById` em `src/trpc/routers/submission.ts`
- [x] Criar `src/components/roast-loading-overlay.tsx` — overlay animado com lucide icons
- [x] Conectar fluxo no `code-editor-section.tsx` — mutation + overlay + redirect
- [x] Atualizar `/roast/[id]/page.tsx` — remover mock, consumir dados reais
- [x] Adicionar animacao `loading-bar` no `globals.css`
- [x] Atualizar `.env.example` com `GEMINI_API_KEY`
- [x] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| Gemini retorna JSON invalido ou fora do schema | Validacao pos-parse: clamp de score, fallback de verdict via `getVerdictForScore`, fallback de severity para "warning" |
| Gemini API timeout ou indisponibilidade | Erro propagado via tRPC, exibido no CodeEditorSection com mensagem de erro |
| `GEMINI_API_KEY` nao configurada | Client lazy-initialized, warnings apenas em runtime quando mutation e chamada |
| Linguagens do editor sem match no DB enum | Fallback para "plaintext" via `editorKeyToDbLanguage` |
| Diff muito grande para codigos longos | Limite de 2500 chars no input garante diffs razoaveis |

---

## Referencias

- [@google/genai SDK](https://github.com/googleapis/js-genai)
- [Gemini Structured Output](https://ai.google.dev/gemini-api/docs/structured-output)
- [diff npm](https://www.npmjs.com/package/diff)
- [lucide-react](https://lucide.dev/)

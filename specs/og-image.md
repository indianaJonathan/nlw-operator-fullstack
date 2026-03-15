# Spec: OG Image dinamica para compartilhamento de roasts

## Contexto

Os links compartilhaveis de resultados (`/roast/[id]`) nao possuem nenhuma imagem OpenGraph. Quando um usuario compartilha um link no Twitter/X, Discord, WhatsApp ou qualquer plataforma com embed, nao aparece preview visual — apenas titulo e descricao genericos do site. A pagina de resultado tem todos os dados necessarios (score, verdict, roast, language, lineCount) mas nao gera metadata dinamica nem imagem OG.

---

## Pesquisa realizada

### Opcoes de geracao de imagem

| Opcao | Pros | Contras |
|---|---|---|
| `next/og` (Vercel, satori) | Convencao do Next.js, zero config | Performance inferior, SVG intermediario |
| `@takumi-rs/image-response` | Engine Rust (rapida), JSX direto, Tailwind via `tw` prop, Geist Mono built-in | Dependencia nativa requer `serverExternalPackages` |
| Imagem estatica placeholder | Zero custo de runtime | Sem informacao dinamica, sem engajamento |

### Abordagem de rota

| Opcao | Pros | Contras |
|---|---|---|
| `opengraph-image.tsx` (convencao App Router) | Auto-gera meta tags, zero config | Acoplado ao diretorio da pagina, menos controle sobre cache headers |
| API route customizada (`/api/roast/[id]/og`) | Controle total de headers, cache e formato; reutilizavel | Precisa de `generateMetadata` manual para apontar a URL |

---

## Decisao

### Takumi (`@takumi-rs/image-response`)

Escolhido por performance superior (engine Rust nativa) e API identica ao `next/og` (JSX + `tw` prop). Suporta Tailwind CSS inline sem build step e ja inclui Geist Mono como fonte built-in — visual similar ao JetBrains Mono do projeto sem necessidade de carregar fontes extras.

### API route customizada em `/api/roast/[id]/og`

Controle total sobre cache headers e formato de resposta. A meta tag `og:image` sera configurada via `generateMetadata` na pagina `/roast/[id]`.

### Fonte Geist Mono (built-in)

Takumi inclui Geist e Geist Mono com todos os pesos (100-900) embutidos. Visual monospaced consistente com o design do projeto sem overhead de carregar `.ttf` customizado.

### Formato PNG

Maxima compatibilidade com crawlers de redes sociais. Todos os principais (Twitter, Discord, WhatsApp, Telegram, LinkedIn, Facebook) suportam PNG sem problemas.

### Cache via `"use cache"` do Next.js

Seguindo o padrao existente do projeto. A funcao `queryById` em `submission.ts` ja usa `"use cache"` com `cacheTag("submission-${id}")`. A API route vai reutilizar essa funcao cacheada. Submissions sao imutaveis apos criacao, entao o cache e seguro.

### Cores dinamicas baseadas no score

Mesma logica do `ScoreRing` e `Badge` existentes:
- Score <= 3: vermelho (`#ef4444` / accent-red)
- Score <= 6: amber (`#f59e0b` / accent-amber)
- Score > 6: verde (`#10b981` / accent-green)

A cor se aplica ao numero do score grande e ao dot + texto do verdict.

---

## Arquitetura

### Estrutura de arquivos

**Novos:**
```
src/app/api/roast/[id]/og/route.tsx   -- API route que gera a imagem OG com Takumi
```

**Alterados:**
```
src/app/roast/[id]/page.tsx           -- Adicionar generateMetadata com og:image e twitter:card
next.config.ts                        -- Adicionar serverExternalPackages: ["@takumi-rs/core"]
package.json                          -- Adicionar @takumi-rs/image-response
```

### Design da imagem OG (1200x630)

Layout extraido do frame "Screen 4 - OG Image" no Pencil (ID `4J5QT`). Container vertical centralizado com `gap: 28px` e `padding: 64px`, todos os filhos centralizados horizontal e verticalmente.

Hierarquia de elementos (de cima para baixo):

```
1200x630, fundo #0A0A0A
+--------------------------------------------------+
|                  padding: 64px                    |
|                                                  |
|   [logoRow] flex horizontal, gap 8, center       |
|     ">"  — Geist Mono, 24px, weight 700, #10B981 |
|     "devroast" — Geist Mono, 20px, w500, #FAFAFA |
|                     gap: 28                      |
|   [scoreRow] flex horizontal, gap 4, align-end   |
|     "3.5" — Geist Mono, 160px, w900, lineH 1    |
|             cor dinamica (score-based)            |
|     "/10" — Geist Mono, 56px, normal, lineH 1   |
|             cor #4B5563 (text-tertiary)           |
|                     gap: 28                      |
|   [verdictRow] flex horizontal, gap 8, center    |
|     (dot) — ellipse 12x12, cor dinamica          |
|     "needs_serious_help" — Geist Mono, 20px      |
|             cor dinamica (mesma do dot)           |
|                     gap: 28                      |
|   [langInfo] — Geist Mono, 16px, normal          |
|     "lang: {language} · {lineCount} lines"       |
|     cor #4B5563 (text-tertiary)                  |
|                     gap: 28                      |
|   [roastQuote] — Geist, 22px, normal, lineH 1.5 |
|     "\u201C{roast}\u201D" (aspas curvas)                    |
|     cor #FAFAFA (text-primary)                   |
|     textAlign center, width fill                 |
|                                                  |
+--------------------------------------------------+
```

**Fontes** (todas built-in no Takumi):
- Geist Mono: logo, score, denominador, verdict, langInfo
- Geist (sans): roast quote

**Tokens de cor** (valores hex do globals.css — Takumi nao le CSS variables):
- Fundo: `#0A0A0A` (bg-page)
- Texto primario: `#FAFAFA` (text-primary)
- Texto terciario: `#4B5563` (text-tertiary)
- Accent green: `#10B981`
- Accent red: `#EF4444`
- Accent amber: `#F59E0B`

**Logica de cor do score e verdict:**

```tsx
function getScoreColor(score: number): string {
  if (score <= 3) return "#EF4444";
  if (score <= 6) return "#F59E0B";
  return "#10B981";
}
```

**Aspas curvas** no roast quote: usar `\u201C` e `\u201D` (left/right double quotation marks).

### Fluxo de dados

```
1. Crawler/usuario acessa /roast/{id}
2. Next.js executa generateMetadata:
   a. caller.submission.getById({ id }) (cacheado via "use cache")
   b. Retorna og:image URL: /api/roast/{id}/og
   c. Retorna twitter:card: "summary_large_image"
3. Crawler solicita /api/roast/{id}/og
4. API route:
   a. Extrai id dos params
   b. caller.submission.getById({ id }) (cacheado)
   c. Se nao encontrado, retorna 404
   d. Renderiza JSX com Takumi ImageResponse (1200x630, PNG)
   e. Retorna imagem com Content-Type: image/png
```

### Detalhes da API route

```tsx
// src/app/api/roast/[id]/og/route.tsx
import { ImageResponse } from "@takumi-rs/image-response";
import { caller } from "@/trpc/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await caller.submission.getById({ id });

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    <OgImage
      score={result.score}
      verdict={result.verdict}
      roast={result.roast}
      language={result.language}
      lineCount={result.lineCount}
    />,
    {
      width: 1200,
      height: 630,
      format: "png",
    },
  );
}
```

### Detalhes do generateMetadata

```tsx
// src/app/roast/[id]/page.tsx (adicionar)
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await caller.submission.getById({ id });

  if (!result) {
    return { title: "DevRoast — Not Found" };
  }

  const title = `DevRoast — ${result.score}/10`;
  const description = result.roast;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/roast/${id}/og`,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
```

**Nota**: `generateMetadata` e a pagina vao ambos chamar `caller.submission.getById({ id })`, mas como a funcao `queryById` usa `"use cache"` com a mesma cache key (`submission-${id}`), o Next.js vai deduplicar — efetivamente uma unica query ao banco por request.

---

## Impacto no bundle

| Dependencia | Tamanho | Nota |
|---|---|---|
| `@takumi-rs/image-response` | ~2 kB (JS wrapper) | Server-only, nao entra no client bundle |
| `@takumi-rs/core` (binario nativo) | ~15-25 MB | Binario nativo por plataforma, nao entra no bundle JS, carregado em runtime |
| **Total novo no client** | **0 kB** | Tudo server-side |

---

## To-dos de implementacao

- [ ] Instalar dependencia: `pnpm add @takumi-rs/image-response`
- [ ] Configurar `next.config.ts`: adicionar `serverExternalPackages: ["@takumi-rs/core"]`
- [ ] Criar `src/app/api/roast/[id]/og/route.tsx` — API route com Takumi ImageResponse
- [ ] Adicionar `generateMetadata` em `src/app/roast/[id]/page.tsx` — meta tags og:image e twitter:card
- [ ] Testar: acessar `/api/roast/{id}/og` no browser e verificar imagem gerada
- [ ] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| Binario nativo do `@takumi-rs/core` incompativel com ambiente de deploy | Takumi oferece fallback WASM via `@takumi-rs/image-response/wasm`; testar no ambiente alvo |
| pnpm virtual store nao resolve o binario nativo | Adicionar `public-hoist-pattern[]=@takumi-rs/core-*` no `.npmrc` se necessario |
| Roast text muito longo estourando layout da imagem | Aplicar `textOverflow: "ellipsis"` + `lineClamp` no container do roast text |
| Takumi nao suporta todas as classes Tailwind | Usar apenas classes basicas (flex, text, bg, p, gap) que sao suportadas; verificar mapa de classes suportadas |
| `generateMetadata` + pagina chamam `getById` duas vezes | Deduplicado pelo `"use cache"` com mesma cache key — sem impacto real |

---

## Referencias

- [Takumi — Quick Start](https://takumi.kane.tw/docs/)
- [Takumi — Migracao do next/og](https://takumi.kane.tw/docs/migration/image-response)
- [Takumi — Tailwind CSS](https://takumi.kane.tw/docs/tailwind-css)
- [Takumi — Tipografia e Fontes](https://takumi.kane.tw/docs/typography-and-fonts)
- [Takumi — Referencia de estilos](https://takumi.kane.tw/docs/reference)
- [Takumi — GitHub](https://github.com/kane50613/takumi)
- [Next.js — generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

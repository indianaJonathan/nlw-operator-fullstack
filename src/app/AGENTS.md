# App Router — Padrões de Rotas e Páginas

## Convenções

### Export default em páginas

Páginas (`page.tsx`) e layouts (`layout.tsx`) usam `export default function` por convenção do Next.js. Esta é a **única exceção** à regra de named exports do projeto.

```tsx
// page.tsx — correto
export default function Home() {
  return <main>...</main>;
}
```

### Tipagem de params dinâmicos

No Next.js 16, `params` é uma `Promise`. Sempre usar `await`:

```tsx
export default async function RoastPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

### Server vs Client components

- Páginas são **server components** por padrão. Delegar interatividade para componentes client importados.
- Usar `"use client"` apenas nos componentes que realmente precisam de hooks/eventos.
- **Nunca** colocar `"use client"` em `page.tsx` ou `layout.tsx`.

### Data fetching com tRPC

Páginas server-side usam o padrão **prefetch + hydrate** para dados que serão consumidos por client components:

```tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function Page() {
  prefetch(trpc.submission.getStats.queryOptions());

  return (
    <HydrateClient>
      {/* Client components consomem os dados via useQuery */}
      <StatsCounter />
    </HydrateClient>
  );
}
```

Para dados consumidos diretamente no server component, usar `caller`:

```tsx
import { caller } from "@/trpc/server";

export default async function Page() {
  const data = await caller.submission.getStats();
  return <div>{data.count}</div>;
}
```

### Suspense + Streaming com server components async

Para exibir skeleton/loading enquanto dados carregam, usar `<Suspense>` com server components async:

```tsx
import { Suspense } from "react";

<HydrateClient>
  <ClientComponent />
  <Suspense fallback={<Skeleton />}>
    <AsyncServerComponent />  {/* chama caller.* internamente */}
  </Suspense>
</HydrateClient>
```

O `<Suspense>` pode ficar dentro do `<HydrateClient>` sem problemas — o `HydrationBoundary` é síncrono e não bloqueia streaming. O React vai enviar o fallback imediatamente e substituir pelo conteúdo real quando o server component async resolver.

**Armadilha: nunca mover `HydrateClient` para envolver apenas parte da árvore.**

Componentes headless como `@base-ui/react` usam `useId()` internamente para gerar IDs. Mudar a posição do `HydrateClient` na árvore altera o tree path do React, o que gera IDs diferentes entre server e client, causando hydration mismatch. Manter o `HydrateClient` envolvendo a árvore inteira da página.

### Cache Components (`cacheComponents: true`)

O projeto usa a API de **Cache Components** do Next.js 16. Com essa flag ativada em `next.config.ts`:

- **Todas as páginas são dinâmicas por default** — não usar `export const dynamic = "force-dynamic"` (incompatível).
- Para marcar uma página como dinâmica explicitamente, usar `await connection()` de `next/server` (necessário quando há `HydrateClient`/`dehydrate` que usam `Date.now()`).
- O cache de dados é feito no nível das **funções** com a diretiva `"use cache"` + `cacheLife()` + `cacheTag()`.
- Os argumentos da função formam a cache key automaticamente.
- O layout usa `<Suspense>` envolvendo o `TRPCReactProvider` para compatibilidade com PPR (Partial Prerender).

```tsx
// Função cacheada — dados revalidam a cada 1 hora
async function queryStats() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag("submission-stats");

  const [result] = await db.select({ ... }).from(submissions);
  return { count: result?.count ?? 0, ... };
}
```

```tsx
// Para funções puras como highlight de código (sem revalidação):
async function highlightCode(code: string, lang: string) {
  "use cache";
  cacheLife("max"); // cache permanente — mesmos inputs = mesmo output
  // ...
}
```

**Regras**:
- `"use cache"` em funções de dados → `cacheLife({ stale, revalidate, expire })` com tempos em segundos
- `"use cache"` em funções puras (ex.: shiki highlight) → `cacheLife("max")` (cache permanente)
- `cacheTag("nome")` para invalidação on-demand via `revalidateTag("nome")`
- **Nunca** usar `export const dynamic` ou `export const revalidate` com `cacheComponents`

### Partial Prerender (PPR)

Com `cacheComponents`, o Next.js ativa PPR automaticamente. As páginas são pré-renderizadas parcialmente:
- Shell estático (hero, títulos, layout) é enviado imediatamente
- Conteúdo dinâmico dentro de `<Suspense>` é streamed quando resolve
- Dados cacheados via `"use cache"` são servidos do cache sem hit no banco

---

## Rotas existentes

| Rota | Arquivo | Tipo | Descrição |
|------|---------|------|-----------|
| `/` | `page.tsx` | PPR (connection + Suspense) | Homepage: hero, code editor (client), stats (client), leaderboard preview |
| `/roast/[id]` | `roast/[id]/page.tsx` | PPR | Resultado do roast: score ring, analysis cards, code block, diff |
| `/leaderboard` | `leaderboard/page.tsx` | PPR (Suspense) | Leaderboard completo: 20 piores códigos com preview + stats |
| `/components` | `components/page.tsx` | Static (cached) | Showcase de componentes do design system |
| `/api/trpc/[trpc]` | `api/trpc/[trpc]/route.ts` | Dynamic | Handler tRPC (GET + POST via `fetchRequestHandler`) |

---

## Layout

O root layout (`layout.tsx`) define:

1. **Font**: JetBrains Mono como `--font-mono` CSS variable
2. **Metadata**: título e descrição globais
3. **Providers**: `TRPCReactProvider` envolto em `<Suspense>` (necessário para PPR com `cacheComponents`)
4. **Navbar**: renderizada em todas as páginas
5. **Body classes**: `bg-bg-page text-text-primary` (tokens globais)

```
<html lang="en">
  <body className={`${font.variable} bg-bg-page text-text-primary`}>
    <Suspense>
      <TRPCReactProvider>
        <Navbar />
        {children}
      </TRPCReactProvider>
    </Suspense>
  </body>
</html>
```

**Nota**: o `<Suspense>` no layout é necessário porque o `TRPCReactProvider` (client component) usa `Date.now()` internamente via TanStack Query. Sem o `<Suspense>`, o Next.js com `cacheComponents` bloqueia a pré-renderização de páginas estáticas como `/_not-found` e `/components`.

---

## Estrutura de arquivos

- `globals.css` — tokens Tailwind v4 (`@theme`), scrollbar, overlays do code editor
- `favicon.ico` — ícone da aplicação
- `layout.tsx` — root layout (font, metadata, providers)
- `page.tsx` — homepage
- `not-found.tsx` — página 404 customizada (estilo terminal)

### Padrão de página 404

A `not-found.tsx` usa o estilo terminal do projeto e importa a função `button()` do `tv` diretamente para estilizar um `<Link>` (sem usar o componente `<Button>`):

```tsx
import { button } from "@/components/ui/button";

<Link href="/" className={button({ variant: "secondary", size: "sm" })}>
  $ cd /home
</Link>
```

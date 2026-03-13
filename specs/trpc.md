# Spec: tRPC + TanStack React Query

## Contexto

O DevRoast não tem camada de API. As páginas usam dados mock estáticos. O banco (Drizzle + PostgreSQL) já está implementado mas não é consumido por nenhuma rota. Precisamos de uma camada tipada de API que funcione tanto em server components (prefetch/SSR) quanto em client components (mutations, revalidação).

---

## Pesquisa realizada

### Por que tRPC e não API routes puras?

| Aspecto | API Routes (Next.js) | tRPC |
|---|---|---|
| Type safety end-to-end | Manual (duplicar types) | Automático via inferência do router |
| Validação de input | Manual (zod avulso) | Built-in com zod no procedure |
| Client-side fetching | Fetch manual ou React Query avulso | Integração nativa com TanStack React Query |
| SSR/prefetch | Fetch direto no server component | `caller` direto + `prefetch` com hydration |
| Boilerplate | Baixo por rota, alto no total | Setup inicial maior, menos boilerplate por procedure |

### Versão

tRPC v11 com a integração `@trpc/tanstack-react-query` (novo client baseado em `queryOptions`/`mutationOptions`). Não usaremos a integração "classic" (`@trpc/react-query`).

---

## Decisão

### tRPC v11 + TanStack React Query + fetch adapter

**Motivo**: type safety end-to-end sem code generation, integração nativa com React Query para cache/mutations, e suporte a server components via `createTRPCOptionsProxy`. O projeto já usa zod (dependência do tRPC) e o App Router do Next.js.

### Sem `superjson`

O schema do Drizzle usa tipos simples (`string`, `number`, `boolean`, `Date`). Datas serão serializadas como ISO strings. Não há necessidade de transformer.

### Context com `headers`

O context aceita `Headers` para permitir futura autenticação. Por enquanto retorna objeto vazio — sem auth.

---

## Arquitetura

### Estrutura de arquivos

```
src/
  trpc/
    init.ts              # initTRPC, createTRPCContext, baseProcedure, createTRPCRouter
    query-client.ts      # makeQueryClient (shared entre server e client)
    client.tsx           # "use client" — TRPCReactProvider, useTRPC (context provider)
    server.tsx           # "server-only" — trpc proxy (prefetch), caller (server direto), HydrateClient, prefetch helper
    routers/
      _app.ts            # appRouter (merge de sub-routers), export type AppRouter
      submission.ts      # procedures: create, getById, getLeaderboard, getStats
  app/
    api/trpc/[trpc]/
      route.ts           # fetch adapter (GET + POST)
    layout.tsx           # montar TRPCReactProvider
```

### Fluxo — Server Component (prefetch + hydration)

```
1. Server component chama prefetch(trpc.submission.getLeaderboard.queryOptions(...))
2. tRPC executa a procedure no servidor via caller direto (sem HTTP)
3. Dados são serializados no QueryClient via dehydrate()
4. HydrateClient envia o state para o client via HydrationBoundary
5. Client component consome com useQuery(trpc.submission.getLeaderboard.queryOptions(...))
6. React Query usa o cache hydratado — sem refetch imediato (staleTime: 30s)
```

### Fluxo — Server Component (caller direto)

```
1. Server component chama await caller.submission.getById({ id })
2. tRPC executa a procedure diretamente, retorna dados tipados
3. Dados renderizados no server — sem hydration para o client
```

### Fluxo — Client Component (mutation)

```
1. Client component chama useMutation(trpc.submission.create.mutationOptions())
2. Ao submeter, mutation faz POST /api/trpc/submission.create
3. fetch adapter roteia para o appRouter → submission.create procedure
4. Procedure valida input (zod), executa query no Drizzle, retorna resultado
5. Client recebe resposta tipada, pode invalidar queries do leaderboard
```

### Detalhes técnicos

**`trpc/init.ts`**:
- `createTRPCContext` aceita `{ headers: Headers }` — cacheia via `React.cache()`
- `initTRPC.context<...>().create()` — sem transformer
- Exporta `baseProcedure`, `createTRPCRouter`, `createCallerFactory`

**`trpc/query-client.ts`**:
- `makeQueryClient()` retorna `new QueryClient` com `staleTime: 30_000`
- `shouldDehydrateQuery` extendido para incluir queries pending (streaming)
- Sem `serializeData`/`deserializeData` (sem superjson)

**`trpc/client.tsx`** (`"use client"`):
- `createTRPCContext<AppRouter>()` exporta `TRPCProvider` e `useTRPC`
- `getQueryClient()` — singleton no browser, nova instância no server
- `getUrl()` — relativo no browser, `VERCEL_URL` em prod, `localhost:3000` em dev
- `TRPCReactProvider` wrapa `QueryClientProvider` + `TRPCProvider`
- `httpBatchLink` para agrupar requests

**`trpc/server.tsx`** (`import "server-only"`):
- `getQueryClient` via `React.cache(makeQueryClient)` — estável por request
- `trpc` = `createTRPCOptionsProxy({ ctx, router, queryClient })` — para prefetch
- `caller` = `appRouter.createCaller(...)` — para acesso direto em server components
- `HydrateClient` helper: wrapa children em `HydrationBoundary` com `dehydrate(queryClient)`
- `prefetch` helper: chama `queryClient.prefetchQuery` ou `prefetchInfiniteQuery`

**`app/api/trpc/[trpc]/route.ts`**:
- `fetchRequestHandler` do `@trpc/server/adapters/fetch`
- Endpoint: `/api/trpc`
- Exporta `handler as GET, handler as POST`

**`app/layout.tsx`**:
- Wrapa children com `<TRPCReactProvider>`

### Procedures planejadas (`submission` router)

| Procedure | Tipo | Input | Output | Query Drizzle |
|---|---|---|---|---|
| `create` | `mutation` | `{ code, language, lineCount, roastMode, score, verdict, roast, suggestedCode?, issues[] }` | `{ id }` | Insert `submissions` + `issues` em transação |
| `getById` | `query` | `{ id: uuid }` | Submission completa + issues | Select com join |
| `getLeaderboard` | `query` | `{ limit?, offset? }` | Array de submissions (sem issues) | Select ordenado por `score ASC` |
| `getStats` | `query` | — | `{ count, avgScore }` | `COUNT(*)` + `AVG(score)` |

---

## Impacto no bundle

| Dependência | Tamanho (gzip) | Nota |
|---|---|---|
| `@trpc/server` | ~15 kB | Server-only (não entra no client bundle) |
| `@trpc/client` | ~5 kB | Client bundle |
| `@trpc/tanstack-react-query` | ~3 kB | Client bundle |
| `@tanstack/react-query` | ~13 kB | Client bundle |
| `zod` | ~14 kB | Já é dep transitiva; usada em procedures |
| `server-only` / `client-only` | ~0 kB | Guardrails de import |
| **Total novo no client** | **~35 kB** | |

---

## To-dos de implementação

- [ ] Instalar dependências: `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query`, `zod`, `server-only`, `client-only`
- [ ] Criar `src/trpc/init.ts` — context, initTRPC, baseProcedure, createTRPCRouter
- [ ] Criar `src/trpc/query-client.ts` — makeQueryClient com staleTime e dehydrate config
- [ ] Criar `src/trpc/client.tsx` — TRPCReactProvider, useTRPC, getQueryClient, getUrl
- [ ] Criar `src/trpc/server.tsx` — trpc proxy, caller, HydrateClient, prefetch helper
- [ ] Criar `src/trpc/routers/_app.ts` — appRouter com merge de sub-routers
- [ ] Criar `src/trpc/routers/submission.ts` — procedures create, getById, getLeaderboard, getStats
- [ ] Criar `src/app/api/trpc/[trpc]/route.ts` — fetch adapter handler
- [ ] Atualizar `src/app/layout.tsx` — montar TRPCReactProvider
- [ ] Testar: chamada de procedure via client component e server component
- [ ] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Import acidental de server code no client | `server-only` no `trpc/server.tsx` e `client-only` implícito no `trpc/client.tsx` (`"use client"`) |
| QueryClient compartilhado entre requests no server | `React.cache(makeQueryClient)` garante instância por request |
| Hydration mismatch se dados mudarem entre server e client | `staleTime: 30s` evita refetch imediato; dados são estáveis para submissions já criadas |
| Bundle size do React Query no client | ~13 kB gzip é aceitável; necessário para cache, mutations e revalidação |

---

## Referências

- [tRPC — Next.js App Router setup](https://trpc.io/docs/client/nextjs/app-router-setup)
- [tRPC — TanStack React Query setup](https://trpc.io/docs/client/tanstack-react-query/setup)
- [tRPC — Server Components integration](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [TanStack Query — Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

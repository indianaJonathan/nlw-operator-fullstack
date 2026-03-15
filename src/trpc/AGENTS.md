# tRPC v11 — Padrões

## Stack

- **tRPC**: v11 com `@trpc/tanstack-react-query`
- **Transport**: `httpBatchLink` (batch automático de requests)
- **Sem transformer**: não usa superjson — tipos simples apenas (string, number, boolean, Date serializada)
- **Query Client**: staleTime de 30s, dehydrate de pending queries

## Arquitetura

```
src/trpc/
  init.ts          # Context factory, baseProcedure, createTRPCRouter
  query-client.ts  # Factory do QueryClient compartilhado (server + client)
  client.tsx       # "use client" — TRPCReactProvider, useTRPC, httpBatchLink
  server.tsx       # "server-only" — trpc proxy, caller, HydrateClient, prefetch
  routers/
    _app.ts        # Root router (merge de sub-routers)
    submission.ts  # Procedures de submission
```

## Convenções

### Criar novo router

1. Criar arquivo em `src/trpc/routers/<nome>.ts`
2. Usar `createTRPCRouter` e `baseProcedure` de `@/trpc/init`
3. Registrar no `appRouter` em `routers/_app.ts`

```tsx
// src/trpc/routers/example.ts
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod/v4";

export const exampleRouter = createTRPCRouter({
  getById: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ input }) => {
      // ...
    }),
});
```

```tsx
// src/trpc/routers/_app.ts
import { exampleRouter } from "./example";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  // ...
});
```

### Validation com Zod v4

- Usar `z` de `zod/v4` (import path do Zod v4).
- Input validation via `.input()` no procedure.
- Schemas reutilizáveis devem ser exportados do arquivo do router.

### Context

O context é criado em `init.ts` via `createTRPCContext` (cacheado com `React.cache()`). Recebe `{ headers: Headers }` para futura autenticação.

### Cache de queries com `"use cache"`

As queries do banco são cacheadas usando a diretiva `"use cache"` do Next.js 16 (requer `cacheComponents: true` no `next.config.ts`). Cada query é extraída para uma função async separada com `"use cache"`:

```tsx
import { cacheLife, cacheTag } from "next/cache";

async function queryStats() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag("submission-stats");

  const [result] = await db.select({ ... }).from(submissions);
  return { ... };
}

// Procedure chama a função cacheada
getStats: baseProcedure.query(() => queryStats()),
```

**Convenções**:
- Cada query do banco deve ter sua própria função cacheada (`queryNome`)
- `cacheLife({ stale, revalidate, expire })` em segundos (1h = 3600, 1d = 86400)
- `cacheTag("nome")` para invalidação on-demand via `revalidateTag("nome")`
- Os argumentos da função formam a cache key automaticamente
- O procedure apenas delega para a função cacheada

---

## Fluxos de dados

### 1. Server component — Prefetch + Hydrate

Para dados que serão consumidos por client components. O server pré-carrega e o client pega do cache:

```tsx
// page.tsx (server)
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function Page() {
  prefetch(trpc.submission.getStats.queryOptions());
  return (
    <HydrateClient>
      <ClientComponent />
    </HydrateClient>
  );
}

// client-component.tsx (client)
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

function ClientComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.submission.getStats.queryOptions());
}
```

### 2. Server component — Caller direto

Para dados consumidos diretamente no server component (sem hidratação):

```tsx
import { caller } from "@/trpc/server";

export default async function Page() {
  const stats = await caller.submission.getStats();
  return <div>{stats.count}</div>;
}
```

### 3. Client component — Mutation

Para ações do usuário (criar submission, etc.):

```tsx
"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

function SubmitForm() {
  const trpc = useTRPC();
  const mutation = useMutation(trpc.submission.create.mutationOptions());
  // mutation.mutate({ code, language, ... });
}
```

---

## API Route

O handler tRPC fica em `src/app/api/trpc/[trpc]/route.ts`. Usa `fetchRequestHandler` do `@trpc/server/adapters/fetch`. Exporta o handler como GET e POST:

```tsx
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
```

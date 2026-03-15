# Spec: Autenticacao com GitHub

## Contexto

O DevRoast e atualmente anonimo — qualquer pessoa pode submeter codigo e ver roasts sem login. Nao existe tabela de users, sessoes ou qualquer mecanismo de autenticacao. Para a nova feature de "Meus Roasts" e para vincular submissions a autores, precisamos de autenticacao. A unica forma de login sera via GitHub OAuth.

---

## Pesquisa realizada

| Opcao | Pros | Contras |
|---|---|---|
| **Auth.js v5 (NextAuth)** | Adapter oficial para Drizzle, suporte nativo a GitHub, grande comunidade, docs maduros, suporte a Next.js 16 (`proxy.ts`) | Bundle maior (~30kB server), abstracao pesada para um unico provider |
| Better Auth | API mais simples, plugin Drizzle | Menos madura, comunidade menor, menos battle-tested |
| Lucia Auth | Minimalista, controle total | Descontinuada (archived), autor recomenda implementacao manual |
| Implementacao manual | Zero dependencias, controle total | Mais trabalho, risco de bugs de seguranca, reimplementar o que libs ja resolvem |

---

## Decisao

### Auth.js v5 (next-auth) com Drizzle adapter

Auth.js v5 e a escolha mais segura: adapter oficial para Drizzle ORM (`@auth/drizzle-adapter`), provider GitHub built-in, e ja suporta Next.js 16 com `proxy.ts` (substituto do `middleware.ts` para manter sessao viva). O bundle extra fica 100% no server — nao impacta o client.

### Estrategia de sessao: database

Usar `strategy: "database"` (padrao do adapter Drizzle) em vez de JWT. Sessoes ficam persistidas no PostgreSQL, permitindo revogacao e consulta server-side via `auth()`. Consistente com o stack Drizzle ja existente.

### Schema de autenticacao: tabelas do Auth.js

O Drizzle adapter exige 4 tabelas: `users`, `accounts`, `sessions`, `verificationTokens`. Vamos usar os schemas padrao do adapter, definidos no mesmo `src/db/schema.ts`. A tabela `verificationTokens` sera criada por compatibilidade do adapter mas nao sera usada (sem magic link).

### Dados do GitHub armazenados no user

A tabela `users` do Auth.js ja armazena `name`, `email`, `image`. Para o username do GitHub (login), vamos adicionar uma coluna extra `username` (text, nullable) na tabela `users` e popular via callback `session`/`signIn` do Auth.js. Dados completos: `name`, `email`, `image` (avatar_url), `username`.

### Limpar banco e comecar fresh

Os dados existentes sao fake (seed). Ao adicionar as tabelas de auth e mudar `submissions` para exigir `userId NOT NULL`, faremos wipe do banco via nova migration. O seed sera atualizado para criar users fake e vincular submissions a eles.

### Submissions vinculadas a userId NOT NULL

A coluna `userId` sera adicionada a tabela `submissions` como `NOT NULL` com FK para `users.id` (cascade delete). Toda submission passa a pertencer a um usuario. Sem submissions anonimas.

### Campo `anonymous` na submission

Nova coluna `anonymous` (boolean, default `false`) na tabela `submissions`. Quando `true`, o leaderboard nao exibe o username/avatar do autor. O usuario escolhe no momento da criacao se quer manter o roast anonimo.

### Protecao de rota via tRPC context

A mutation `submission.create` deve exigir usuario autenticado. Em vez de middleware Next.js para proteger rotas, a verificacao sera feita no tRPC context, criando uma `protectedProcedure` que verifica a sessao e injeta o `userId` no context. O frontend exibe um modal pedindo login quando o usuario tenta submeter sem estar autenticado.

---

## Arquitetura

### Estrutura de arquivos

**Novos:**
```
src/auth.ts                              -- Config NextAuth (providers, adapter, callbacks)
src/app/api/auth/[...nextauth]/route.ts  -- Route handler (GET + POST)
src/proxy.ts                             -- Proxy para manter sessao viva (Next.js 16)
```

**Alterados:**
```
src/db/schema.ts          -- Novas tabelas (users, accounts, sessions, verificationTokens) + userId/anonymous em submissions
src/trpc/init.ts          -- Context com sessao auth(), protectedProcedure
src/trpc/routers/submission.ts -- create usa protectedProcedure, getLeaderboard inclui dados do user
src/db/seed.ts            -- Criar users fake + vincular submissions
.env.example              -- AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
```

### Config Auth.js (`src/auth.ts`)

```ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub],
  callbacks: {
    async session({ session, user }) {
      // Injetar username na sessao
      session.user.username = user.username
      return session
    },
  },
})
```

### Schema do banco

Tabelas do Auth.js (padrao do adapter):
- `users`: id, name, email, emailVerified, image + **username** (text, nullable)
- `accounts`: id, userId (FK), type, provider, providerAccountId, tokens...
- `sessions`: id, sessionToken, userId (FK), expires
- `verificationTokens`: identifier, token, expires

Alteracoes em `submissions`:
- Nova coluna: `userId` (text, NOT NULL, FK -> users.id, cascade delete)
- Nova coluna: `anonymous` (boolean, NOT NULL, default false)
- Novo indice: `idx_submissions_user_id` em `userId`

### Fluxo de autenticacao

```
1. Usuario clica "Sign in with GitHub" na navbar
2. Auth.js redireciona para GitHub OAuth consent screen
3. GitHub callback retorna para /api/auth/callback/github
4. Auth.js cria/atualiza user + account no banco via Drizzle adapter
5. Sessao criada no banco (tabela sessions)
6. Cookie de sessao setado no browser
7. Navbar atualiza: mostra avatar + dropdown (username, email, "Meus Roasts", "Sair")
```

### Fluxo de criacao de roast (com auth)

```
1. Usuario cola codigo, clica "$ roast_my_code"
2. Se nao logado: modal aparece pedindo login (com botao "Sign in with GitHub")
3. Se logado: mutation tRPC submission.create e chamada
4. protectedProcedure verifica sessao, injeta userId no context
5. Submission e criada com userId do context + anonymous do input
6. Fluxo segue como antes (Gemini, issues, redirect)
```

### tRPC context com auth

```ts
// src/trpc/init.ts
import { auth } from "@/auth"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()
  return { session }
}

// protectedProcedure
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx: { session: ctx.session } })
})
```

### Variaveis de ambiente

| Variavel | Descricao |
|---|---|
| `AUTH_SECRET` | Secret para assinar cookies (gerado via `npx auth secret`) |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret |

O Auth.js v5 detecta `AUTH_GITHUB_ID` e `AUTH_GITHUB_SECRET` automaticamente — nao precisa passar como opcao no provider.

---

## Impacto no bundle

| Dependencia | Tamanho (gzip) | Destino |
|---|---|---|
| `next-auth` | ~30 kB | Server-only (route handler + auth()) |
| `@auth/drizzle-adapter` | ~5 kB | Server-only (adapter) |
| **Total novo no client** | **0 kB** | Toda logica de auth fica no server |

---

## To-dos de implementacao

- [ ] Instalar dependencias: `next-auth@beta`, `@auth/drizzle-adapter`
- [ ] Criar GitHub OAuth App no GitHub Developer Settings (manual)
- [ ] Adicionar variaveis de ambiente ao `.env` e `.env.example`
- [ ] Gerar AUTH_SECRET via `npx auth secret`
- [ ] Adicionar tabelas do Auth.js ao `src/db/schema.ts` (users, accounts, sessions, verificationTokens)
- [ ] Adicionar coluna `username` a tabela `users`
- [ ] Adicionar colunas `userId` (NOT NULL FK) e `anonymous` (boolean) a tabela `submissions`
- [ ] Criar `src/auth.ts` com config NextAuth (GitHub provider, Drizzle adapter, callbacks)
- [ ] Criar route handler `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Criar `src/proxy.ts` para manter sessao viva (Next.js 16)
- [ ] Atualizar `src/trpc/init.ts` — context com sessao, `protectedProcedure`
- [ ] Atualizar `submission.create` para usar `protectedProcedure` e incluir `userId` + `anonymous`
- [ ] Atualizar `submission.getLeaderboard` para incluir dados do autor (quando nao anonimo)
- [ ] Gerar e aplicar migration (`pnpm db:generate && pnpm db:migrate`)
- [ ] Atualizar `src/db/seed.ts` — criar users fake e vincular submissions
- [ ] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| Auth.js v5 ainda em beta (`next-auth@beta`) | E a versao recomendada oficialmente, usada em producao por milhares de apps. Estavel o suficiente |
| GitHub OAuth App requer callback URL fixa | Usar `http://localhost:3000/api/auth/callback/github` para dev. Criar app separado para producao |
| Sessao expira e usuario perde roast em andamento | Modal de login aparece antes da mutation — usuario loga antes de submeter |
| Wipe do banco remove dados existentes | Dados sao fake (seed). Seed sera atualizado para repopular com users |
| `proxy.ts` e padrao Next.js 16 (novo) | Documentado oficialmente pelo Auth.js, simples (1 linha: `export { auth as proxy }`) |

---

## Referencias

- [Auth.js v5 Docs](https://authjs.dev)
- [Auth.js Drizzle Adapter](https://authjs.dev/getting-started/adapters/drizzle)
- [Auth.js GitHub Provider](https://authjs.dev/getting-started/providers/github)
- [Auth.js Next.js 16 proxy.ts](https://authjs.dev/getting-started/installation)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

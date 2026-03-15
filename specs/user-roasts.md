# Spec: Meus Roasts e Navbar autenticada

## Contexto

Com a autenticacao via GitHub implementada (ver `github-auth.md`), o usuario precisa de uma forma de ver seus proprios roasts e de gerenciar sua sessao. A navbar atual tem apenas o link para o leaderboard. Precisamos adicionar: botao de login (quando deslogado), dropdown de perfil com avatar (quando logado), link para "Meus Roasts", e a propria pagina `/my-roasts`. Alem disso, o leaderboard passa a mostrar o autor dos roasts nao-anonimos e a criacao de roast precisa de um modal de login para usuarios nao autenticados.

---

## Decisao

### Pagina `/my-roasts` com layout similar ao leaderboard

A pagina "Meus Roasts" reutiliza o mesmo estilo visual do leaderboard: cards com preview do codigo, score, linguagem e data. A diferenca e que lista apenas os roasts do usuario logado, ordenados por data (mais recente primeiro). Se o usuario nao estiver logado, redireciona para a homepage.

### Navbar com dropdown de perfil

Quando logado, a navbar mostra o avatar do GitHub como botao. Ao clicar, abre um dropdown (via `@base-ui/react` Menu) com: nome de usuario, email, link "Meus Roasts", botao "Sair". Quando deslogado, mostra um botao "sign_in" estilizado como link (mesmo estilo do "leaderboard").

### Modal de login obrigatorio na criacao

Quando um usuario nao logado tenta clicar em "$ roast_my_code", um modal aparece informando que e necessario logar. O modal tem um botao "Sign in with GitHub" que inicia o fluxo OAuth. Apos o login, o usuario volta para a homepage e pode submeter normalmente. Usar `@base-ui/react` Dialog para o modal.

### Leaderboard com autoria

O leaderboard passa a mostrar o avatar e username do autor em cada entry — exceto para roasts marcados como `anonymous: true`, que exibem um placeholder generico (icone de usuario sem rosto). O component `leaderboard-entries.tsx` e `leaderboard-preview.tsx` precisam ser atualizados.

### Procedure tRPC `getMyRoasts`

Nova query `submission.getMyRoasts` usando `protectedProcedure`. Retorna todas as submissions do usuario logado com suas issues, ordenadas por `createdAt DESC`. Sem paginacao no MVP — assumimos volume baixo por usuario.

### Toggle de anonimato no editor

Novo toggle no `CodeEditor.Footer` (ao lado do roast mode toggle) para "anonymous". Quando ativo, o roast nao mostra o autor no leaderboard. O estado `anonymous` e enviado na mutation `submission.create`.

---

## Arquitetura

### Estrutura de arquivos

**Novos:**
```
src/app/my-roasts/page.tsx                -- Pagina "Meus Roasts" (server, protegida)
src/components/my-roasts-entries.tsx       -- Lista de roasts do usuario (server async)
src/components/my-roasts-entries-skeleton.tsx -- Skeleton loading
src/components/navbar-auth.tsx            -- Parte autenticada da navbar (client)
src/components/login-modal.tsx            -- Modal de login obrigatorio (client)
src/components/ui/dropdown-menu.tsx       -- Dropdown generico com @base-ui/react Menu
src/components/ui/modal.tsx               -- Modal generico com @base-ui/react Dialog
```

**Alterados:**
```
src/components/navbar.tsx                 -- Integrar NavbarAuth (avatar/dropdown ou botao login)
src/components/code-editor-section.tsx    -- Adicionar toggle anonymous + verificar auth antes de submit
src/components/leaderboard-entries.tsx    -- Mostrar autor (avatar + username) em entries nao-anonimas
src/components/leaderboard-preview.tsx    -- Mostrar autor em preview entries
src/trpc/routers/submission.ts           -- Adicionar getMyRoasts, atualizar getLeaderboard/getLeaderboardPreview
src/components/ui/code-editor.tsx        -- Slot no Footer para toggle anonymous
```

### Layout da navbar

```
+---------------------------------------------------------------+
| > devroast       leaderboard   my_roasts   [avatar ▼] / sign_in |
+---------------------------------------------------------------+

Deslogado:
  - Links: "leaderboard"
  - Botao: "sign_in" (text link style)

Logado:
  - Links: "leaderboard", "my_roasts"
  - Avatar do GitHub (circular, 32px) como trigger do dropdown
  - Dropdown:
    - Header: username + email (text-secondary, text-2xs)
    - Separador
    - "Meus Roasts" (link)
    - "Sair" (botao, text-accent-red)
```

### Dropdown de perfil

Usar `@base-ui/react` Menu (Trigger + Portal + Positioner + Popup + Item). O componente `NavbarAuth` sera client (`"use client"`) pois precisa de interatividade (dropdown state). A navbar em si continua server component, renderizando `NavbarAuth` como filho.

A sessao sera passada via prop do server component para o client component (evitando `useSession` que exigia SessionProvider). No server, chamar `auth()` e passar `session` para `NavbarAuth`.

### Pagina `/my-roasts`

```
Protecao: verificar sessao via auth() no server. Se nao logado, redirect("/").

Layout:
+-----------------------------------------------+
|  > meus roasts                                 |
|  Seus codigos mais... interessantes            |
|                                                |
|  [Card 1: score | language | date | preview]   |
|  [Card 2: score | language | date | preview]   |
|  ...                                           |
|                                                |
|  Nenhum roast ainda? Submeta seu codigo!       |
+-----------------------------------------------+
```

Reutilizar o estilo visual de `leaderboard-entries.tsx` (cards com code preview, score badge, hover blur). Diferenca: ordenado por data (nao por score), sem ranking numerico, e mostra indicador de anonimato.

### Modal de login

```
+-------------------------------------------+
|  Login necessario                          |
|                                            |
|  Para criar um roast, voce precisa estar   |
|  logado com sua conta do GitHub.           |
|                                            |
|  [Sign in with GitHub]     [Cancelar]      |
+-------------------------------------------+
```

Usar `@base-ui/react` Dialog. O botao "Sign in with GitHub" chama `signIn("github")` via server action. O modal e controlado por estado no `CodeEditorSection`.

### Fluxo de dados — Meus Roasts

```
1. Usuario acessa /my-roasts
2. Server: auth() verifica sessao
3. Se nao logado: redirect("/")
4. Se logado: prefetch submission.getMyRoasts
5. Renderiza MyRoastsEntries (server async)
6. Query retorna submissions do userId com issues
7. Renderiza cards com preview do codigo (reutiliza codePreview())
```

### Fluxo de dados — Criacao com auth check

```
1. Usuario clica "$ roast_my_code"
2. CodeEditorSection verifica se tem sessao (prop do server)
3. Se nao logado: abre LoginModal
4. Se logado: dispara mutation com { code, language, roastMode, anonymous }
5. protectedProcedure verifica sessao, injeta userId
6. Submission criada com userId + anonymous
```

### Procedure `getMyRoasts`

```ts
getMyRoasts: protectedProcedure.query(async ({ ctx }) => {
  return queryMyRoasts(ctx.session.user.id)
})

// queryMyRoasts com "use cache" + cacheTag(`my-roasts-${userId}`)
// SELECT submissions.*, issues.* FROM submissions
// LEFT JOIN issues ON issues.submissionId = submissions.id
// WHERE submissions.userId = $userId
// ORDER BY submissions.createdAt DESC
```

Cache tag `my-roasts-${userId}` invalidado na mutation `create`.

### Leaderboard com autoria

A query `getLeaderboard` e `getLeaderboardPreview` passam a fazer JOIN com `users` para trazer `name`, `image`, `username`. No frontend, cada entry mostra:
- Se `anonymous = false`: avatar (24px, rounded) + username
- Se `anonymous = true`: icone generico + "anonymous"

---

## To-dos de implementacao

- [ ] Criar componente `src/components/ui/dropdown-menu.tsx` com `@base-ui/react` Menu
- [ ] Criar componente `src/components/ui/modal.tsx` com `@base-ui/react` Dialog
- [ ] Criar `src/components/navbar-auth.tsx` (client) — avatar dropdown ou botao login
- [ ] Atualizar `src/components/navbar.tsx` — integrar NavbarAuth com sessao via prop
- [ ] Criar `src/components/login-modal.tsx` — modal de login obrigatorio
- [ ] Atualizar `src/components/code-editor-section.tsx` — toggle anonymous + auth check + login modal
- [ ] Adicionar procedure `getMyRoasts` em `src/trpc/routers/submission.ts`
- [ ] Atualizar `getLeaderboard` e `getLeaderboardPreview` — JOIN com users, incluir dados do autor
- [ ] Criar `src/app/my-roasts/page.tsx` — pagina protegida com prefetch
- [ ] Criar `src/components/my-roasts-entries.tsx` — lista de roasts do usuario (server async)
- [ ] Criar `src/components/my-roasts-entries-skeleton.tsx` — skeleton loading
- [ ] Atualizar `src/components/leaderboard-entries.tsx` — mostrar autor (avatar/username ou anonymous)
- [ ] Atualizar `src/components/leaderboard-preview.tsx` — mostrar autor em preview
- [ ] Invalidar cache `my-roasts-${userId}` na mutation `create`
- [ ] Atualizar seed para incluir mix de roasts anonimos e nao-anonimos
- [ ] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| `auth()` no server pode ser lento (DB lookup a cada request) | Sessao e cacheada pelo Auth.js via cookie. DB lookup so acontece na validacao periodica |
| Dropdown de perfil precisa de JS (client component) | Apenas o `NavbarAuth` e client. O resto da navbar continua server component. Impacto minimo |
| Sem paginacao em "Meus Roasts" | Volume baixo por usuario no MVP. Se crescer, adicionar cursor-based pagination |
| Modal de login pode frustrar usuario | Mensagem clara e acao direta (1 clique para logar). Apos login, volta para a homepage pronto para submeter |
| Toggle anonymous pode confundir | Label claro: "anonymous" com tooltip explicando que o username nao aparecera no leaderboard |

---

## Referencias

- [@base-ui/react Menu](https://base-ui.com/react/components/menu)
- [@base-ui/react Dialog](https://base-ui.com/react/components/dialog)
- [Auth.js Session in Server Components](https://authjs.dev/getting-started/session-management/get-session)

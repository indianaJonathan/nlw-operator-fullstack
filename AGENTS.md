# DevRoast - Agent Guidelines

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack, `src/` dir)
- **Package manager**: pnpm
- **Styling**: Tailwind CSS v4 (`@theme` em `globals.css`)
- **Linting/Formatting**: Biome (2 spaces, 80 chars, lineWidth 80) — sem ESLint
- **Fonts**: JetBrains Mono via `next/font/google` (`--font-mono`). Sans usa system default.
- **Syntax highlight**: shiki + tema customizado `vesper-pp` (client) e `vesper` built-in (server)
- **Headless UI**: `@base-ui/react`
- **Variantes**: `tailwind-variants` (`tv()`)
- **Data layer**: tRPC v11 + TanStack React Query + Drizzle ORM + PostgreSQL 16
- **Validation**: Zod v4

## Regras globais

- **Cores**: sempre via tokens Tailwind definidos em `globals.css`. Nunca hex hardcoded em componentes.
- **Named exports only**: nunca `export default` em componentes UI. Páginas usam `export default function` por convenção do Next.js.
- **className**: compor via `tv({ className })` ou `twMerge()`. Nunca template string interpolation.
- **Componentes atômicos**: usar `tv()` com `defaultVariants`. Exportar componente + tv + type.
- **Componentes compostos**: usar namespace object (`Component.Root`, `Component.Title`). Ver `src/components/ui/AGENTS.md`.
- **Props**: estender `ComponentProps<"element">` nativo.
- **Arbitrary values**: evitar `[Npx]`. Criar token no `@theme` se o valor aparece mais de uma vez.
- **Imports**: usar path alias `@/*` que resolve para `./src/*`.
- **Idioma do código**: inglês (nomes de variáveis, funções, componentes). Documentação em português.

## Tokens de Design

Todos os tokens estão em `src/app/globals.css` dentro do bloco `@theme`. Exemplos de uso:

| Categoria | Token | Utility class |
|-----------|-------|---------------|
| Background | `--color-bg-page` | `bg-bg-page` |
| Background | `--color-bg-surface` | `bg-bg-surface` |
| Background | `--color-bg-elevated` | `bg-bg-elevated` |
| Border | `--color-border-primary` | `border-border-primary` |
| Text | `--color-text-primary` | `text-text-primary` |
| Text | `--color-text-secondary` | `text-text-secondary` |
| Accent | `--color-accent-green` | `text-accent-green` |
| Accent | `--color-accent-red` | `text-accent-red` |
| Diff | `--color-diff-added` | `bg-diff-added` |
| Font size | `--text-2xs` | `text-2xs` |

Para a lista completa, consultar `src/app/globals.css`.

## Estrutura

```
src/
  app/           # Rotas (App Router) — ver src/app/AGENTS.md
  components/    # Componentes de página (navbar, code-editor-section) — ver src/components/AGENTS.md
    ui/          # Componentes de design system (button, badge, toggle, etc.) — ver src/components/ui/AGENTS.md
  db/            # Drizzle ORM (schema, client, seed) — ver src/db/AGENTS.md
  trpc/          # tRPC v11 (init, client, server, routers) — ver src/trpc/AGENTS.md
  lib/           # Utilitários (shiki, languages, detect-language) — ver src/lib/AGENTS.md
specs/           # Documentos de decisão técnica — ver specs/AGENTS.md
drizzle/         # Migrations geradas pelo drizzle-kit (não editar manualmente)
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | `biome check .` |
| `pnpm format` | `biome format . --write` |
| `pnpm db:generate` | Gerar migrations com drizzle-kit |
| `pnpm db:migrate` | Aplicar migrations |
| `pnpm db:studio` | Abrir Drizzle Studio (GUI do banco) |
| `pnpm db:seed` | Popular banco com dados fake (`tsx --env-file=.env src/db/seed.ts`) |

## Configuração do Biome

- Indent: 2 spaces, lineWidth: 80
- Excludes: `.next`, `node_modules`, `drizzle`
- Overrides em `biome.json`:
  - `code-block.tsx`: `noDangerouslySetInnerHtml` desabilitado (necessário para shiki)
  - `globals.css`: `noImportantStyles` desabilitado (necessário para overlay do code editor)
- CSS parser com `tailwindDirectives: true`

## Infra

- **Docker Compose**: PostgreSQL 16 Alpine na porta 5432 (user/password/db: `devroast`)
- **Env**: `DATABASE_URL` em `.env` (ver `.env.example`)

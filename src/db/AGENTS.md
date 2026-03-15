# Database — Drizzle ORM + PostgreSQL

## Stack

- **ORM**: Drizzle ORM (`drizzle-orm`)
- **Driver**: `postgres` (PostgreSQL driver nativo)
- **Banco**: PostgreSQL 16 Alpine (via Docker Compose)
- **Migrations**: `drizzle-kit` (geradas em `drizzle/`, nunca editar manualmente)
- **Casing**: `snake_case` configurado no Drizzle (props JS em camelCase mapeiam para colunas snake_case)

## Convenções

### Schema

- Todo o schema fica em `src/db/schema.ts` (arquivo único).
- Enums são definidos com `pgEnum()` e exportados individualmente.
- Tabelas usam `pgTable()` com o nome da tabela em plural (`submissions`, `issues`).
- IDs são UUID com `defaultRandom()` (não auto-increment — seguro para URLs públicas).
- Timestamps usam `timestamp().notNull().defaultNow()`.
- Índices são definidos no terceiro argumento de `pgTable()`.

```tsx
export const submissions = pgTable(
  "submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull(),
    // ...
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    index("idx_submissions_score").on(t.score.asc()),
  ],
);
```

### Client

O client Drizzle é um singleton em `src/db/index.ts`. Importar sempre via:

```tsx
import { db } from "@/db";
```

### Enums

Enums do banco são definidos com `pgEnum` e devem ter sufixo `Enum`:

```tsx
export const languageEnum = pgEnum("language_enum", [...]);
export const issueSeverityEnum = pgEnum("issue_severity_enum", [...]);
```

---

## Schema atual

### Tabela `submissions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único, gerado automaticamente |
| `code` | text | Código enviado pelo usuário |
| `language` | enum | Linguagem detectada/selecionada |
| `lineCount` | integer | Número de linhas do código |
| `roastMode` | boolean | Se o roast mode está ativo (default: true) |
| `score` | real | Nota de 0 a 10 |
| `verdict` | text | Veredito curto |
| `roast` | text | Texto do roast |
| `suggestedCode` | text? | Código sugerido (nullable) |
| `createdAt` | timestamp | Data de criação |

### Tabela `issues`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `submissionId` | UUID (FK) | Referência para `submissions.id` (cascade delete) |
| `severity` | enum | `critical`, `warning` ou `good` |
| `title` | text | Título do problema |
| `description` | text | Descrição detalhada |
| `order` | integer | Ordem de exibição |

---

## Workflow de migrations

1. Alterar `src/db/schema.ts`
2. `pnpm db:generate` — gera SQL de migração em `drizzle/`
3. `pnpm db:migrate` — aplica no banco
4. **Nunca** editar arquivos em `drizzle/` manualmente

## Seed

`pnpm db:seed` popula o banco com 100 submissions fake usando `@faker-js/faker`. Executado via `tsx --env-file=.env src/db/seed.ts`.

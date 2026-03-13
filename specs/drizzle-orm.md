# Spec: Drizzle ORM + PostgreSQL

## Contexto

Atualmente todos os dados do DevRoast são mock estáticos. Precisamos de um banco de dados para persistir submissões de código, resultados de análise (score, roast, issues, diff) e alimentar o leaderboard.

---

## Stack de dados

- **ORM**: Drizzle ORM
- **Banco**: PostgreSQL 16
- **Infraestrutura local**: Docker Compose
- **Migrations**: `drizzle-kit`

---

## Schema

### Enums

```
language_enum:
  javascript | typescript | python | java | sql | go | rust | ruby |
  php | c | cpp | csharp | swift | kotlin | html | css | shell | plaintext

issue_severity_enum:
  critical | warning | good

diff_line_type_enum:
  added | removed | context
```

### Tabelas

#### `submissions`

Tabela principal. Uma linha por código submetido.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `code` | `text` | Código submetido (obrigatório) |
| `language` | `language_enum` | Linguagem detectada ou selecionada |
| `line_count` | `integer` | Quantidade de linhas do código |
| `roast_mode` | `boolean` | Se o modo roast estava ativo, default `true` |
| `score` | `real` | Nota 0.0–10.0 retornada pela análise |
| `verdict` | `text` | Ex: `"needs_serious_help"`, `"decent_code"`, `"impressive"` |
| `roast` | `text` | Frase de roast gerada pela IA |
| `suggested_code` | `text` | Código corrigido sugerido (para gerar o diff) |
| `created_at` | `timestamp` | `now()`, default |

**Índices:**
- `idx_submissions_score` em `score ASC` — leaderboard (piores primeiro)
- `idx_submissions_created_at` em `created_at DESC` — ordenação cronológica

#### `issues`

Issues da análise detalhada. N issues por submission.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `submission_id` | `uuid` | FK → `submissions.id`, `ON DELETE CASCADE` |
| `severity` | `issue_severity_enum` | `critical`, `warning` ou `good` |
| `title` | `text` | Ex: `"using var instead of const/let"` |
| `description` | `text` | Explicação detalhada do issue |
| `order` | `integer` | Ordem de exibição |

**Índice:**
- `idx_issues_submission` em `submission_id`

---

## Decisões de modelagem

### Por que `suggested_code` em vez de tabela `diff_lines`?

O diff é gerado a partir da comparação entre `code` (original) e `suggested_code` (corrigido). A UI pode computar o diff no servidor com uma lib como `diff` ou `fast-diff`, ou o diff pode ser gerado pela IA junto com o `suggested_code`. Armazenar linhas individuais de diff seria sobre-normalização — o diff muda inteiro se o código sugerido mudar.

### Por que não ter tabela de usuários?

O DevRoast é anônimo. Não há login, perfil ou autenticação. Submissões são registros públicos sem dono. Se no futuro precisar de auth, adicionar `user_id` nullable na `submissions`.

### Por que UUID e não auto-increment?

As IDs aparecem na URL (`/results/:id`). UUIDs evitam enumeração sequencial e são mais seguros para um app público.

---

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Connection string** (`.env`):
```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## Estrutura de arquivos

```
devroast/
  docker-compose.yml
  drizzle.config.ts           # Config do drizzle-kit (migrations)
  .env                        # DATABASE_URL (gitignored)
  .env.example                # Template sem secrets
  src/
    db/
      index.ts                # Instância do drizzle client (singleton)
      schema.ts               # Todas as tabelas e enums
```

---

## Queries previstas

| Query | Uso | Detalhes |
|---|---|---|
| `insertSubmission` | POST `/api/roast` | Insere submission + issues em transação |
| `getSubmission` | GET `/results/:id` | Busca submission + issues por ID |
| `getLeaderboard` | GET `/leaderboard` | Top N submissions ordenadas por `score ASC` |
| `getLeaderboardPreview` | Homepage | Top 3 submissions (score ASC) |
| `getStats` | Homepage + Leaderboard | `COUNT(*)` e `AVG(score)` |

---

## To-dos de implementação

- [ ] Instalar dependências: `drizzle-orm`, `postgres` (driver), `drizzle-kit`
- [ ] Criar `docker-compose.yml` na raiz do projeto
- [ ] Criar `.env.example` com `DATABASE_URL` template
- [ ] Adicionar `.env` ao `.gitignore`
- [ ] Criar `drizzle.config.ts` com config de migrations
- [ ] Criar `src/db/schema.ts` com enums e tabelas (`submissions`, `issues`)
- [ ] Criar `src/db/index.ts` com instância singleton do drizzle client
- [ ] Gerar migration inicial: `pnpm drizzle-kit generate`
- [ ] Rodar migration: `pnpm drizzle-kit migrate`
- [ ] Adicionar scripts ao `package.json`: `db:generate`, `db:migrate`, `db:studio`
- [ ] Testar conexão e queries básicas (insert + select)
- [ ] Validar: `pnpm lint && pnpm build`

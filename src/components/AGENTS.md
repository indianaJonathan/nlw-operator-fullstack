# Componentes de Página

Componentes em `src/components/` são **componentes de nível de página** — orquestram UI components de `ui/` e lógica de negócio. Diferem dos componentes de design system (`ui/`) por serem específicos de features.

## Convenções

### Named exports

Mesmo padrão do restante do projeto. Nunca `export default`.

```tsx
// Correto
export { CodeEditorSection };

// Errado
export default CodeEditorSection;
```

### Server vs Client

- **Server components** (padrão): componentes que apenas renderizam HTML sem interatividade.
- **Client components**: adicionar `"use client"` no topo quando há hooks, eventos ou estado.

### Consumo de dados tRPC (client components)

Client components usam `useTRPC()` + `useQuery()` para consumir dados pré-carregados pelo server:

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

function StatsCounter() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.submission.getStats.queryOptions());
  // ...
}
```

### Padrão de hidratação

Para evitar mismatch de hidratação com valores dinâmicos no client, usar o padrão `mounted`:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <Skeleton />;
return <AnimatedValue value={data.count} />;
```

### Queries paralelas em server components

Quando um server component async precisa de **múltiplas queries independentes**, usar `Promise.all` para executá-las em paralelo. Isso evita waterfalls sequenciais e reduz o tempo total de loading.

```tsx
async function LeaderboardPreview() {
  // Correto: queries disparam em paralelo
  const [rows, stats] = await Promise.all([
    caller.submission.getLeaderboardPreview(),
    caller.submission.getStats(),
  ]);

  return (
    <>
      <Table data={rows} />
      <Footer stats={stats} />
    </>
  );
}
```

```tsx
// Errado: queries sequenciais (waterfall)
async function LeaderboardPreview() {
  const rows = await caller.submission.getLeaderboardPreview();
  const stats = await caller.submission.getStats();
  // ...
}
```

Quando os dados de múltiplas queries são usados na mesma UI (ex.: tabela + footer dentro do mesmo `<Suspense>`), **prefira um único componente com `Promise.all`** em vez de componentes async separados. Isso garante paralelismo explícito e evita depender do comportamento interno do React para paralelizar renders de siblings.

---

## Componentes existentes

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `navbar.tsx` | Server | Header com logo e links de navegação |
| `code-editor-section.tsx` | Client | Orquestra CodeEditor + Toggle + Button, gerencia estado de código/linguagem |
| `stats-counter.tsx` | Client | Exibe contagem de submissions e score médio com animação (`@number-flow/react`) |
| `leaderboard-preview.tsx` | Server async | Tabela dos 3 piores códigos + footer com métricas. Usa `Promise.all` para queries paralelas + `<Suspense>` com skeleton |
| `leaderboard-preview-skeleton.tsx` | Server | Skeleton com `animate-pulse` para loading state do leaderboard |

### Padrão do CodeEditorSection

Exemplo de orquestração de componentes compostos com estado local:

```tsx
"use client";

function CodeEditorSection() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(AUTO_DETECT_KEY);

  return (
    <CodeEditor.Root>
      <CodeEditor.Header
        language={language}
        onLanguageChange={setLanguage}
      />
      <CodeEditor.Body
        code={code}
        onCodeChange={setCode}
        language={language}
      />
      <CodeEditor.Footer code={code} />
    </CodeEditor.Root>
  );
}
```

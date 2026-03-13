# DevRoast - Agent Guidelines

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack, `src/` dir)
- **Package manager**: pnpm
- **Styling**: Tailwind CSS v4 (`@theme` em `globals.css`)
- **Linting/Formatting**: Biome (2 spaces, 80 chars) — sem ESLint
- **Fonts**: JetBrains Mono via `next/font/google` (`--font-mono`). Sans usa system default.
- **Syntax highlight**: shiki + tema `vesper` (server components async)
- **Headless UI**: `@base-ui/react`
- **Variantes**: `tailwind-variants` (`tv()`)

## Regras globais

- **Cores**: sempre via tokens Tailwind definidos em `globals.css`. Nunca hex hardcoded em componentes.
- **Named exports only**: nunca `export default` em componentes UI.
- **className**: compor via `tv({ className })` ou `twMerge()`. Nunca template string interpolation.
- **Componentes atômicos**: usar `tv()` com `defaultVariants`. Exportar componente + tv + type.
- **Componentes compostos**: usar namespace object (`Component.Root`, `Component.Title`). Ver `src/components/ui/AGENTS.md`.
- **Props**: estender `ComponentProps<"element">` nativo.
- **Arbitrary values**: evitar `[Npx]`. Criar token no `@theme` se o valor aparece mais de uma vez.

## Estrutura

```
src/
  app/           # Rotas (App Router)
  components/    # Componentes de página (navbar, code-editor-section)
    ui/          # Componentes de design system (button, badge, toggle, etc.)
      AGENTS.md  # Padrões específicos de criação de componentes UI
```

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm lint` — `biome check .`
- `pnpm format` — `biome format . --write`

# Padrões de Criação de Componentes UI

Regras e convenções para criar componentes dentro de `src/components/ui/`.

## Estrutura de Arquivo

- Um componente por arquivo.
- Nome do arquivo em **kebab-case**: `button.tsx`, `text-input.tsx`.
- Sempre usar **named exports**, nunca `export default`.

```tsx
// Correto
export { Button, button, type ButtonProps };

// Errado
export default Button;
```

## Tipagem

- Estender as propriedades nativas do elemento HTML correspondente usando `ComponentProps<"elemento">`.
- Criar um type `VariantProps` a partir da função `tv` e intersectar com as props nativas.
- Exportar o type das props junto com o componente.

```tsx
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({ ... });

type ButtonVariants = VariantProps<typeof button>;
type ButtonProps = ComponentProps<"button"> & ButtonVariants;
```

## Composição de className

Existem **dois cenários** para lidar com `className` externo nos componentes:

### 1. Componentes com `tv()` (tailwind-variants)

Passar `className` diretamente como propriedade na chamada da função `tv()`. O `tailwind-variants` já integra `tailwind-merge` internamente e resolve conflitos automaticamente. **Não** importar `twMerge` neste caso.

```tsx
// Correto: className passado dentro da chamada tv()
function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={button({ variant, size, className })}
      {...props}
    />
  );
}
```

### 2. Componentes sem `tv()` (classes fixas)

Para componentes que não usam `tv()` mas possuem classes base fixas e aceitam `className` externo, usar `twMerge` do `tailwind-merge` para unir as classes. Isso garante que o consumidor consiga fazer override de classes sem conflitos.

```tsx
import { twMerge } from "tailwind-merge";

// Correto: twMerge para unir classes fixas + className externo
function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={twMerge("rounded border border-border-primary p-5", className)}
      {...props}
    />
  );
}

// Errado: interpolação de string (não resolve conflitos de classes)
function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`rounded border border-border-primary p-5 ${className ?? ""}`}
      {...props}
    />
  );
}
```

**Nunca use interpolação de template string** para unir `className` externo. Classes conflitantes não serão resolvidas e o resultado visual será imprevisível.

## Definição de Variantes

- Definir `base` com as classes comuns a todas as variantes.
- Agrupar classes longas em arrays para melhor legibilidade.
- Sempre definir `defaultVariants` para que o componente funcione sem props obrigatórias.
- Incluir states (`disabled`, `hover`, `focus-visible`) nas classes base ou nas variantes conforme o caso.

```tsx
const component = tv({
  base: [
    "classes-de-layout",
    "classes-de-tipografia",
    "classes-de-estado",
  ],
  variants: {
    variant: {
      primary: "...",
      secondary: ["classe-1", "classe-2"],
    },
    size: {
      default: "...",
      sm: "...",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});
```

## Composição (Compound Components)

Componentes que possuem sub-partes visuais distintas (ex.: título, descrição, badge) devem usar o **pattern de composição** ao invés de receber tudo via props.

### Quando usar

- O componente renderiza **2+ pedaços** internos que poderiam ser customizados individualmente.
- O consumidor pode querer trocar, omitir ou reordenar as partes.

### Quando NÃO usar

- Componentes **atômicos** sem sub-partes (Button, Badge, DiffLine).
- Componentes cujas props são **dados computacionais**, não conteúdo visual (ScoreRing recebe `score`, CodeBlock recebe `code`).

### Estrutura

Cada sub-componente é uma function component independente. O namespace é exportado como um **objeto literal**.

```tsx
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type CardRootProps = ComponentProps<"div">;

function CardRoot({ className, ...props }: CardRootProps) {
  return (
    <div
      className={twMerge("rounded border border-border-primary p-5", className)}
      {...props}
    />
  );
}

type CardTitleProps = ComponentProps<"span">;

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <span
      className={twMerge("font-mono text-sm text-text-primary", className)}
      {...props}
    />
  );
}

const Card = {
  Root: CardRoot,
  Title: CardTitle,
};

export { Card, type CardRootProps, type CardTitleProps };
```

### Uso

```tsx
<Card.Root>
  <Badge variant="critical">critical</Badge>
  <Card.Title>using var instead of const/let</Card.Title>
</Card.Root>
```

### Convenções

- Nomes dos sub-componentes: `ComponentNameRoot`, `ComponentNameTitle`, etc.
- O objeto namespace usa o nome base: `const AnalysisCard = { Root, Title, Description }`.
- Cada sub-componente aceita `className` via `twMerge` para override.
- Types exportados individualmente: `type AnalysisCardRootProps`, `type AnalysisCardTitleProps`.
- Sub-componentes que são apenas containers (Root) renderizam `children` via spread (`...props`).

## Exports

Cada arquivo de componente deve exportar:

### Componentes atômicos

1. **O componente React** (function component).
2. **A função `tv`** para uso externo (composição, testes, etc.).
3. **O type das props** do componente.

```tsx
export { Button, button, type ButtonProps };
```

### Componentes compostos

1. **O objeto namespace** com os sub-componentes.
2. **Os types das props** de cada sub-componente.

```tsx
export {
  AnalysisCard,
  type AnalysisCardRootProps,
  type AnalysisCardTitleProps,
  type AnalysisCardDescriptionProps,
};
```

## Checklist para Novos Componentes

- [ ] Arquivo em kebab-case
- [ ] Named exports (nunca default)
- [ ] Props estendem `ComponentProps<"elemento">`
- [ ] Variantes definidas com `tv()` do `tailwind-variants` (componentes atômicos)
- [ ] `className` composto via `tv({ className })` ou `twMerge("...", className)` (nunca interpolação de string)
- [ ] `defaultVariants` definido (quando usa `tv()`)
- [ ] Composição via objeto namespace quando há sub-partes visuais
- [ ] Exporta componente/namespace + types das props
- [ ] Passa no `pnpm lint` (Biome)

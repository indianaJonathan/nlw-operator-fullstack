# Spec: Layout Responsivo

## Contexto

A aplicacao foi construida inteiramente para viewports desktop. Nao existe nenhum uso de breakpoints responsivos (`sm:`, `md:`, `lg:`) nem `@media` queries em todo o codebase. Em telas mobile (<768px), multiplos problemas visuais ocorrem: paddings excessivos (`px-20` = 160px total), elementos lado-a-lado que nao cabem (ScoreRing 180px + texto, toggles + botao, tabela com 5 colunas), grids fixos (`grid-cols-2`) e fontes grandes demais (`text-4xl`). Validacao feita via Playwright em viewport 375x812 (iPhone padrao).

---

## Pesquisa realizada

### Breakpoint principal

| Opcao | Valor | Pros | Contras |
|---|---|---|---|
| **`md:` (768px)** | Tailwind default | Conteudo minimo da app (tabela, diff, editor) precisa de ~700px para formato desktop; alinha com iPads em portrait | Tablets menores (600-767px) recebem layout mobile |
| `sm:` (640px) | Tailwind default | Captura mais dispositivos como "desktop" | Muitos layouts quebram entre 640-768px (nao ha espaco para tabelas/diffs) |
| `lg:` (1024px) | Tailwind default | Mais seguro para layouts complexos | Desperdiça espaco em tablets que poderiam mostrar layout desktop |

### Leaderboard preview (homepage) no mobile

| Opcao | Pros | Contras |
|---|---|---|
| Scroll horizontal na tabela | Simples de implementar, mantem estrutura existente | UX ruim — usuario precisa rolar horizontalmente para ver conteudo |
| **Layout de cards empilhados** | Melhor UX mobile, cada entry vira um card vertical legivel | Mais trabalho — duplicar markup (tabela desktop + cards mobile) |

### Split diff no mobile

| Opcao | Pros | Contras |
|---|---|---|
| **Scroll horizontal** | Mantem visualizacao lado-a-lado que e a essencia do diff | Usuario precisa rolar |
| Diff unificado (stacked) | Cabe no mobile | Perde comparacao visual direta; precisa de novo componente |

---

## Decisao

### Breakpoint: `md:` (768px)

Mobile-first approach usando `md:` como breakpoint primario. Classes base sao para mobile, classes com prefixo `md:` sao para desktop. Motivo: o conteudo da app exige ~700px minimos para layout desktop funcionar.

### Leaderboard preview: cards empilhados no mobile

Cada entry da tabela da homepage vira um card vertical no mobile. A tabela desktop fica escondida com `hidden md:block` e os cards mobile com `md:hidden`. O card mostra: header com rank + score + author, code preview embaixo, language como metadata.

### Leaderboard/My Roasts entries: headers responsivos

Os entry headers das paginas `/leaderboard` e `/my-roasts` usam `flex-wrap` no mobile para que os metadados (rank, score, author, lang, lines) fluam em multiplas linhas quando nao cabem.

### Split diff: scroll horizontal

O diff lado-a-lado e inerentemente um componente de largura fixa (duas colunas de codigo). Adicionar `overflow-x-auto` permite scroll horizontal no mobile mantendo a comparacao visual intacta.

### ScoreRing: tamanho responsivo via CSS

O SVG do ScoreRing usa `viewBox`, entao escala naturalmente. Trocar o `style={{ width: 180, height: 180 }}` hardcoded por classes Tailwind responsivas (`w-30 md:w-45 h-30 md:h-45`) para que o anel fique menor no mobile (120px) e mantenha o tamanho original no desktop (180px).

### Code Editor: altura reduzida no mobile

O editor ocupa altura excessiva no mobile com `min-h-90 max-h-120` (360px-480px). Reduzir para `min-h-60 max-h-80 md:min-h-90 md:max-h-120` para melhor proporcao em telas menores.

### Actions bar: empilhado no mobile

A barra de acoes (toggles + botao de submit) muda de `flex-row` (tudo numa linha) para `flex-col` no mobile, com toggles em cima e botao embaixo ocupando largura total.

---

## Arquitetura

### Arquivos alterados

```
src/components/navbar.tsx                     -- Padding responsivo
src/app/page.tsx                              -- Padding, titulo, spacer responsivos
src/components/code-editor-section.tsx        -- Actions bar empilhado, comment escondido
src/components/ui/code-editor.tsx             -- Altura responsiva do Body
src/components/ui/score-ring.tsx              -- Tamanho responsivo via classes CSS
src/components/ui/split-diff.tsx              -- Scroll horizontal no container
src/app/roast/[id]/page.tsx                   -- Padding, score hero, analysis grid responsivos
src/app/leaderboard/page.tsx                  -- Padding responsivo
src/app/my-roasts/page.tsx                    -- Padding responsivo
src/components/leaderboard-preview.tsx        -- Tabela desktop + cards mobile
src/components/leaderboard-preview-skeleton.tsx -- Skeleton responsivo (tabela + cards)
src/components/leaderboard-entries.tsx        -- Entry headers com flex-wrap
src/components/leaderboard-entries-skeleton.tsx -- Skeleton responsivo
src/components/my-roasts-entries.tsx          -- Entry headers com flex-wrap
src/components/my-roasts-entries-skeleton.tsx -- Skeleton responsivo
```

### Padroes aplicados

**Padding responsivo (todas as paginas):**
```
Antes:  px-20 py-10
Depois: px-4 py-6 md:px-20 md:py-10
```

**Padding hero homepage:**
```
Antes:  px-10 pt-20
Depois: px-4 pt-10 md:px-10 md:pt-20
```

**Titulo hero:**
```
Antes:  text-4xl
Depois: text-xl md:text-4xl
```

**Score hero na pagina /roast/[id]:**
```
Antes:  flex items-center gap-12
Depois: flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-12
```

**Analysis cards grid:**
```
Antes:  grid grid-cols-2 gap-5
Depois: grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5
```

**Actions bar:**
```
Antes:  flex items-center justify-between
Depois: flex flex-col gap-4 md:flex-row md:items-center md:justify-between
```

**ScoreRing:**
```tsx
// Antes: hardcoded
const size = 180;
<div style={{ width: size, height: size }}>

// Depois: responsivo via classes
<div className="size-30 md:size-45">
  <svg width="100%" height="100%" viewBox="0 0 180 180">
```

**Code editor body:**
```
Antes:  min-h-90 max-h-120
Depois: min-h-60 max-h-80 md:min-h-90 md:max-h-120
```

**Navbar:**
```
Antes:  pl-10
Depois: px-4 md:pl-10 md:pr-0
```

**Entry headers (leaderboard + my-roasts):**
```
Antes:  flex h-10 items-center gap-3 px-4
Depois: flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 md:h-10 md:flex-nowrap md:py-0
```

**Leaderboard preview (homepage) — cards mobile:**
```tsx
{/* Desktop: tabela */}
<div className="hidden md:block">
  {/* tabela existente */}
</div>

{/* Mobile: cards */}
<div className="flex flex-col gap-3 md:hidden">
  {rows.map(row => (
    <Link key={row.id} href={`/roast/${row.id}`} className="...">
      <div className="flex items-center justify-between">
        <span>#{rank}</span>
        <span>{score}</span>
        <EntryAuthor />
      </div>
      <div className="code-preview" />
      <div className="flex items-center justify-between">
        <span>{language}</span>
        <span>view roast {">>"}</span>
      </div>
    </Link>
  ))}
</div>
```

### Detalhes tecnicos

**Sem dependencias novas**: todas as mudancas usam classes Tailwind responsivas ja disponiveis. Nenhum pacote precisa ser instalado.

**Sem novos componentes**: as mudancas sao ajustes in-place nos componentes existentes. A unica excecao e o markup duplicado na leaderboard preview (tabela desktop + cards mobile), que fica no mesmo componente.

**Mobile-first**: classes base (sem prefixo) definem o layout mobile. Prefixo `md:` sobrescreve para desktop. Isso garante que mobile e o default e evita `max-width` media queries.

**Skeletons**: acompanham a estrutura dos componentes reais. Se o componente real muda para cards no mobile, o skeleton tambem deve.

---

## To-dos de implementacao

- [ ] Navbar (`navbar.tsx`): padding responsivo, gap reduzido no mobile
- [ ] Homepage (`page.tsx`): padding, titulo `text-xl md:text-4xl`, spacer `h-8 md:h-15`, container leaderboard `px-4 md:px-10`
- [ ] Code editor body (`code-editor.tsx`): altura `min-h-60 max-h-80 md:min-h-90 md:max-h-120`
- [ ] Code editor section (`code-editor-section.tsx`): actions bar empilhado, roast mode comment `hidden md:inline`, botao `w-full md:w-auto`
- [ ] ScoreRing (`score-ring.tsx`): trocar `style={{ width, height }}` por classes responsivas `size-30 md:size-45`, SVG com `width/height=100%`
- [ ] Roast page (`roast/[id]/page.tsx`): padding `px-4 py-6 md:px-20 md:py-10`, score hero empilhado, analysis grid `grid-cols-1 md:grid-cols-2`, roast text `text-base md:text-xl`
- [ ] Split diff (`split-diff.tsx`): adicionar `overflow-x-auto` no container
- [ ] Leaderboard preview (`leaderboard-preview.tsx`): tabela desktop `hidden md:block` + cards mobile `md:hidden`
- [ ] Leaderboard preview skeleton (`leaderboard-preview-skeleton.tsx`): versao responsiva (tabela + cards)
- [ ] Leaderboard page (`leaderboard/page.tsx`): padding responsivo
- [ ] Leaderboard entries (`leaderboard-entries.tsx`): entry headers com `flex-wrap`
- [ ] Leaderboard entries skeleton (`leaderboard-entries-skeleton.tsx`): ajustar para responsivo
- [ ] My Roasts page (`my-roasts/page.tsx`): padding responsivo
- [ ] My Roasts entries (`my-roasts-entries.tsx`): entry headers com `flex-wrap`
- [ ] My Roasts entries skeleton (`my-roasts-entries-skeleton.tsx`): ajustar para responsivo
- [ ] Validar visualmente com Playwright em viewport 375x812 (mobile) e 1280x800 (desktop)
- [ ] Validar: `pnpm lint && pnpm build`

---

## Riscos e mitigacoes

| Risco | Mitigacao |
|---|---|
| Markup duplicado na leaderboard preview (tabela + cards) aumenta o HTML | Sao apenas 3 entries — impacto negligivel. A alternativa (CSS-only) nao consegue transformar tabela em cards |
| Code editor com altura reduzida no mobile pode ficar apertado para codigos longos | Mantido `overflow-y-auto` — usuario pode rolar. O `max-h-80` (320px) ainda e maior que metade de uma tela 812px |
| ScoreRing com tamanho menor pode dificultar leitura do score | 120px ainda e grande o suficiente para texto `text-3xl` (30px). Testado visualmente |
| Split diff com scroll horizontal pode nao ser obvio | O overflow natural do conteudo indica scroll. Futuramente pode-se adicionar indicador visual |

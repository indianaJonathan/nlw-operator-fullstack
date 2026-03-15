<p align="center">
  <img src="https://xesque.rocketseat.dev/platform/1772214874591.svg" alt="NLW Orbiter" />
</p>

<h1 align="center">DevRoast</h1>

<p align="center">
  Paste your code. Get roasted.
</p>

<p align="center">
  Projeto construído durante o evento <strong>NLW Orbiter</strong> da <a href="https://rocketseat.com.br">Rocketseat</a>.
</p>

---

## Sobre

DevRoast é uma ferramenta que analisa trechos de código e devolve um "roast" — uma avaliação brutalmente honesta (e divertida) da qualidade do código, com nota, análise detalhada dos problemas e sugestão de correção.

## Funcionalidades

- **Code Input** — cole seu código no editor com syntax highlight e line numbers
- **Roast Mode** — ative o modo "roast" para avaliações com sarcasmo máximo
- **Score Ring** — nota visual de 0 a 10 com anel colorido (vermelho, âmbar, verde)
- **Análise Detalhada** — cards categorizados como critical, warning ou good explicando cada ponto
- **Suggested Fix** — diff mostrando o código original vs. a versão corrigida
- **Shame Leaderboard** — ranking dos piores códigos já submetidos
- **OG Image** — imagem dinâmica para compartilhamento nas redes sociais

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Homepage com editor de código e preview do leaderboard |
| `/roast/:id` | Resultado da análise com score, roast e diff |
| `/leaderboard` | Ranking completo dos códigos mais roasted |
| `/components` | Showcase dos componentes do design system |

## Como rodar

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build de produção
pnpm build && pnpm start
```

## Tecnologias

- [Next.js 16](https://nextjs.org/) — App Router + Turbopack
- [Tailwind CSS v4](https://tailwindcss.com/) — Estilização via design tokens
- [Biome](https://biomejs.dev/) — Linting e formatação
- [shiki](https://shiki.style/) — Syntax highlighting
- [tailwind-variants](https://www.tailwind-variants.org/) — Variantes de componentes

## Contributing

```bash
# 1. Fork o repositorio
# 2. Crie uma branch para sua feature
git checkout -b feat/minha-feature

# 3. Commit suas alteracoes
git commit -m "feat: descricao da feature"

# 4. Push para o fork
git push origin feat/minha-feature

# 5. Abra um Pull Request
```

---

<p align="center">
  Feito durante o <strong>NLW Orbiter</strong> da <a href="https://rocketseat.com.br">Rocketseat</a>
</p>

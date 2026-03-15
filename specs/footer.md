# Spec: Footer com Link para Contribuicao

## Contexto

A aplicacao nao possui footer. Nao ha nenhum link para o repositorio GitHub do projeto nem indicacao de como contribuir. O objetivo e adicionar um footer global com link para abertura de PRs e atualizar o README com instrucoes de contribuicao.

---

## Decisao

### Footer como server component global no layout

O footer sera um server component renderizado no root layout (`layout.tsx`), abaixo do `{children}`. Assim aparece em todas as paginas automaticamente sem duplicar codigo. Nao precisa de `"use client"` porque e apenas HTML estatico com um link.

### Texto no estilo terminal do projeto

Manter a identidade visual do projeto com linguagem de terminal:

```
// want to improve this project? open a PR at github.com/indianaJonathan/nlw-operator-fullstack
```

O texto usa a notacao `//` como comentario (padrao ja usado nos titulos de secao do projeto), fonte mono e cores de texto secundario/terciario, com o link em destaque usando `text-text-secondary` com hover para `text-text-primary`.

### Contributing no README

Adicionar secao "Contributing" no README com os passos basicos para abrir um PR: fork, branch, commit, push, PR. Manter conciso e alinhado com o tom do projeto.

---

## Arquitetura

### Arquivos novos

```
src/components/footer.tsx    -- Server component do footer
```

### Arquivos alterados

```
src/app/layout.tsx           -- Importar e renderizar <Footer /> apos {children}
README.md                    -- Adicionar secao "Contributing"
```

### Estrutura do footer

```tsx
// src/components/footer.tsx
function Footer() {
  return (
    <footer className="border-t border-border-primary px-4 py-6 md:px-10">
      <p className="text-center font-mono text-2xs text-text-tertiary">
        {"// want to improve this project? "}
        <a
          href="https://github.com/indianaJonathan/nlw-operator-fullstack"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          open a PR
        </a>
      </p>
    </footer>
  );
}

export { Footer };
```

### Posicao no layout

```tsx
// src/app/layout.tsx
<body>
  <Suspense>
    <TRPCReactProvider>
      <Navbar />
      {children}
      <Footer />
    </TRPCReactProvider>
  </Suspense>
</body>
```

O footer fica dentro do `TRPCReactProvider`/`Suspense` por consistencia, embora nao dependa de nenhum provider. Mover para fora introduziria assimetria no DOM sem ganho funcional.

### Detalhes tecnicos

**Sem dependencias novas**: o footer e HTML puro com classes Tailwind.

**Link externo**: usa `target="_blank"` com `rel="noopener noreferrer"` por seguranca. O link aponta para a raiz do repositorio — o usuario pode navegar para a aba "Pull Requests" ou seguir as instrucoes do README.

**Responsividade**: o footer ja nasce responsivo com `px-4 md:px-10` e `text-center`, alinhado com o spec de layout responsivo.

---

## To-dos de implementacao

- [ ] Criar `src/components/footer.tsx` — server component com link para o repositorio
- [ ] Alterar `src/app/layout.tsx` — importar e renderizar `<Footer />` apos `{children}`
- [ ] Atualizar `README.md` — adicionar secao "Contributing" com instrucoes para PRs
- [ ] Validar: `pnpm lint && pnpm build`

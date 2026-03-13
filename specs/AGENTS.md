# Specs — Formato

Specs são documentos de decisão técnica criados **antes** da implementação. Um spec por feature.

## Estrutura

```md
# Spec: <Nome da Feature>

## Contexto
# O que existe hoje e por que precisa mudar. 2–3 frases.

## Pesquisa realizada (se houver)
# Opções avaliadas com prós/contras. Usar tabelas quando comparar alternativas.

## Decisão
# O que foi escolhido e por quê. Uma subseção por decisão relevante.

## Arquitetura
# Estrutura de arquivos novos/alterados + fluxo de dados.
# Incluir detalhes técnicos de implementação (patterns, edge cases, async handling).

## Impacto no bundle (se aplicável)
# Tabela com dependências novas e tamanhos estimados.

## To-dos de implementação
# Checklist ordenado com todas as tarefas para implementar a feature.

## Riscos e mitigações (se aplicável)
# Tabela risco → mitigação.

## Referências (se aplicável)
# Links para repos, docs ou artigos consultados.
```

## Regras

- **Arquivo**: `specs/<nome-da-feature>.md` (kebab-case)
- **Idioma**: português
- **Seções obrigatórias**: Contexto, Decisão, Arquitetura, To-dos de implementação
- **Seções opcionais**: Pesquisa realizada, Impacto no bundle, Riscos, Referências
- **Tabelas** para comparações (opções, dependências, riscos)
- **Separar seções** com `---`
- Manter conciso — spec não é documentação, é registro de decisão

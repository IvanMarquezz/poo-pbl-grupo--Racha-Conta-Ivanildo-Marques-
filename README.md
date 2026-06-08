# 💸 RachaConta — Finanças Coletivas para Repúblicas

> Projeto da disciplina de Orientação a Objetos — Tema 10

## Sobre o Projeto

Sistema para gerenciar as despesas compartilhadas de uma república ou grupo de pessoas. Registra quem pagou o quê, divide entre os membros e calcula automaticamente quem deve pra quem.

Feito em TypeScript com arquitetura DDD (Domain-Driven Design).

## Como Rodar

```bash
# instala as dependencias
npm install

# roda os testes
npm test

# inicia o servidor web (http://localhost:3000)
npm run dev
```

## Estrutura do Projeto

```
├── .github/workflows/ci.yml     # pipeline CI/CD
├── src/
│   ├── domain/
│   │   ├── value-objects/
│   │   │   ├── Dinheiro.ts      # valor monetário (sem float!)
│   │   │   └── NomeMembro.ts    # nome com validação
│   │   ├── entities/
│   │   │   ├── Membro.ts        # pessoa do grupo
│   │   │   └── Despesa.ts       # gasto registrado
│   │   └── aggregates/
│   │       └── GrupoFinanceiro.ts  # aggregate root principal
│   ├── application/
│   │   └── GrupoFinanceiroService.ts  # casos de uso
│   ├── infrastructure/
│   │   ├── IGrupoRepository.ts        # contrato do repo
│   │   └── GrupoRepositorioEmMemoria.ts  # impl em memória
│   └── presentation/
│       ├── server.ts            # API REST (Express)
│       └── public/index.html   # interface web
├── tests/
│   └── domain/
│       ├── Dinheiro.test.ts
│       ├── Despesa.test.ts
│       └── GrupoFinanceiro.test.ts
├── project-meta.json
└── README.md
```

## Conceitos DDD Aplicados

| Conceito | Onde está |
|----------|-----------|
| **Value Object** | `Dinheiro`, `NomeMembro` — imutáveis, sem identidade |
| **Entity** | `Membro`, `Despesa` — têm ID único |
| **Aggregate Root** | `GrupoFinanceiro` — controla tudo |
| **Repository** | `IGrupoRepository` + implementação em memória |
| **Service** | `GrupoFinanceiroService` — orquestra os casos de uso |

## Por que guardar dinheiro em centavos?

Porque `0.1 + 0.2 = 0.30000000000000004` em float. Usando inteiros (centavos) esse problema some!

## Algoritmo de Acertos

Usa o algoritmo "Greedy Clearing": ordena os maiores devedores e credores e vai compensando até zerar todos os saldos. Minimiza o número de transferências necessárias.

---
---

**Aluno:** Ivanildo Marques de Souza Filho
**Matrícula:** 1211539404
**Professor:** Amaury Nogueira
**Disciplina:** Projeto de Programação
**Ano:** 2026

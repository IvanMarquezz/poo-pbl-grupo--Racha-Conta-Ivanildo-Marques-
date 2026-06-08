// TESTES DO AGGREGATE ROOT GrupoFinanceiro
// esse demorou mais pra escrever mas eh o mais importante!
// cobre os casos de uso principais do sistema

import { GrupoFinanceiro } from "../../src/domain/aggregates/GrupoFinanceiro";
import { Despesa, CategoriaDespesa } from "../../src/domain/entities/Despesa";
import { NomeMembro } from "../../src/domain/value-objects/NomeMembro";
import { Dinheiro } from "../../src/domain/value-objects/Dinheiro";

// helper pra criar um grupo ja com membros (evita repeticao nos testes)
function criarGrupoComMembros() {
  const grupo = new GrupoFinanceiro("Republica das Meninas");
  const ana = grupo.adicionarMembro(new NomeMembro("Ana"));
  const bia = grupo.adicionarMembro(new NomeMembro("Bia"));
  const carol = grupo.adicionarMembro(new NomeMembro("Carol"));
  return { grupo, ana, bia, carol };
}

describe("GrupoFinanceiro - Aggregate Root", () => {

  describe("criacao do grupo", () => {
    test("deve criar grupo com nome valido", () => {
      const grupo = new GrupoFinanceiro("Republica das Meninas");
      expect(grupo.nome).toBe("Republica das Meninas");
      expect(grupo.quantidadeMembros).toBe(0);
    });

    test("deve gerar id unico para cada grupo", () => {
      const g1 = new GrupoFinanceiro("Grupo 1");
      const g2 = new GrupoFinanceiro("Grupo 2");
      expect(g1.id).not.toBe(g2.id);
    });

    test("deve rejeitar nome muito curto", () => {
      expect(() => new GrupoFinanceiro("AB")).toThrow();
    });
  });

  describe("gerenciamento de membros", () => {
    test("deve adicionar membro corretamente", () => {
      const grupo = new GrupoFinanceiro("Grupo teste");
      grupo.adicionarMembro(new NomeMembro("Ana"));
      expect(grupo.quantidadeMembros).toBe(1);
    });

    test("nao deve adicionar membro com nome duplicado", () => {
      const grupo = new GrupoFinanceiro("Grupo teste");
      grupo.adicionarMembro(new NomeMembro("Ana"));
      expect(() => grupo.adicionarMembro(new NomeMembro("Ana"))).toThrow();
    });

    test("deve remover membro sem despesas", () => {
      const grupo = new GrupoFinanceiro("Grupo teste");
      const membro = grupo.adicionarMembro(new NomeMembro("Ana"));
      grupo.removerMembro(membro.id);
      expect(grupo.quantidadeMembros).toBe(0);
    });

    test("nao deve remover membro com despesas", () => {
      const { grupo, ana, bia } = criarGrupoComMembros();
      const despesa = new Despesa({
        descricao: "Mercado",
        valor: Dinheiro.deReais(50),
        quemPagouId: ana.id,
        dividirComIds: [ana.id, bia.id]
      });
      grupo.registrarDespesa(despesa);
      expect(() => grupo.removerMembro(ana.id)).toThrow("despesas");
    });
  });

  describe("registro de despesas e calculo de saldos", () => {
    test("deve registrar despesa e atualizar saldos corretamente", () => {
      const { grupo, ana, bia } = criarGrupoComMembros();

      // Ana paga R$100 dividido com Bia (50/50)
      const despesa = new Despesa({
        descricao: "Mercado",
        valor: Dinheiro.deReais(100),
        quemPagouId: ana.id,
        dividirComIds: [ana.id, bia.id]
      });

      grupo.registrarDespesa(despesa);

      // Ana pagou 100, deve 50 (sua parte) -> saldo = +50
      expect(ana.saldoCentavos).toBe(5000); // credora

      // Bia deve 50 -> saldo = -50
      expect(bia.saldoCentavos).toBe(-5000); // devedora
    });

    test("deve calcular total gasto pelo grupo", () => {
      const { grupo, ana, bia, carol } = criarGrupoComMembros();
      
      grupo.registrarDespesa(new Despesa({
        descricao: "Luz",
        valor: Dinheiro.deReais(120),
        quemPagouId: ana.id,
        dividirComIds: [ana.id, bia.id, carol.id]
      }));

      grupo.registrarDespesa(new Despesa({
        descricao: "Internet",
        valor: Dinheiro.deReais(80),
        quemPagouId: bia.id,
        dividirComIds: [ana.id, bia.id, carol.id]
      }));

      expect(grupo.totalGasto.reais).toBe(200);
    });

    test("deve rejeitar despesa de membro que nao esta no grupo", () => {
      const { grupo, ana } = criarGrupoComMembros();
      const despesa = new Despesa({
        descricao: "Mercado",
        valor: Dinheiro.deReais(50),
        quemPagouId: "id-que-nao-existe",
        dividirComIds: [ana.id]
      });
      expect(() => grupo.registrarDespesa(despesa)).toThrow();
    });
  });

  describe("calculo de acertos (quem deve pra quem)", () => {
    test("cenario simples: Ana pagou tudo, Bia deve pra ela", () => {
      const { grupo, ana, bia } = criarGrupoComMembros();

      // Ana paga R$100 pra dividir so com Bia
      grupo.registrarDespesa(new Despesa({
        descricao: "Mercado",
        valor: Dinheiro.deReais(100),
        quemPagouId: ana.id,
        dividirComIds: [ana.id, bia.id]
      }));

      const acertos = grupo.calcularAcertos();
      expect(acertos).toHaveLength(1);
      expect(acertos[0].deMembroId).toBe(bia.id);
      expect(acertos[0].paraMembroId).toBe(ana.id);
      expect(acertos[0].valor.centavos).toBe(5000); // R$50
    });

    test("cenario com 3 pessoas e multiplas despesas", () => {
      const { grupo, ana, bia, carol } = criarGrupoComMembros();

      // Ana paga R$90 pra dividir com as 3
      grupo.registrarDespesa(new Despesa({
        descricao: "Mercado",
        valor: Dinheiro.deReais(90),
        quemPagouId: ana.id,
        dividirComIds: [ana.id, bia.id, carol.id]
      }));

      // cada uma deve R$30 pra Ana
      // ana: +90 -30 = +60
      // bia: -30
      // carol: -30
      const acertos = grupo.calcularAcertos();
      
      // bia e carol devem pra ana
      expect(acertos.length).toBeGreaterThan(0);
      
      const totalAcertos = acertos.reduce(
        (sum, a) => sum + a.valor.centavos, 0
      );
      // total dos acertos deve fechar os saldos
      expect(totalAcertos).toBe(6000); // R$60
    });

    test("sem dividas, lista de acertos deve ser vazia", () => {
      const { grupo } = criarGrupoComMembros();
      const acertos = grupo.calcularAcertos();
      expect(acertos).toHaveLength(0);
    });
  });
});

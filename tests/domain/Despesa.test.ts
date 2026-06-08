import { Despesa, CategoriaDespesa } from "../../src/domain/entities/Despesa";
import { Dinheiro } from "../../src/domain/value-objects/Dinheiro";

describe("Despesa - Entidade", () => {

  const params = {
    descricao: "Conta de luz",
    valor: Dinheiro.deReais(120),
    quemPagouId: "membro-1",
    dividirComIds: ["membro-1", "membro-2", "membro-3"]
  };

  test("deve criar despesa valida", () => {
    const d = new Despesa(params);
    expect(d.descricao).toBe("Conta de luz");
    expect(d.valor.reais).toBe(120);
  });

  test("deve ter id unico", () => {
    const d1 = new Despesa(params);
    const d2 = new Despesa(params);
    expect(d1.id).not.toBe(d2.id);
  });

  test("deve rejeitar descricao vazia", () => {
    expect(() => new Despesa({ ...params, descricao: "  " })).toThrow();
  });

  test("deve rejeitar valor zero", () => {
    expect(() => new Despesa({ ...params, valor: Dinheiro.zero() })).toThrow("zero");
  });

  test("deve rejeitar lista de divisao vazia", () => {
    expect(() => new Despesa({ ...params, dividirComIds: [] })).toThrow();
  });

  test("deve calcular parte de cada pessoa corretamente", () => {
    // R$90 entre 3 pessoas = R$30 cada
    const d = new Despesa({
      ...params,
      valor: Dinheiro.deReais(90),
      dividirComIds: ["m1", "m2", "m3"]
    });
    expect(d.valorPorPessoa.reais).toBe(30);
  });

  test("deve verificar quem participa da divisao", () => {
    const d = new Despesa(params);
    expect(d.participaDivisao("membro-1")).toBe(true);
    expect(d.participaDivisao("outro-id")).toBe(false);
  });

  test("deve ter categoria padrao OUTROS se nao informar", () => {
    const d = new Despesa(params);
    expect(d.categoria).toBe(CategoriaDespesa.OUTROS);
  });

  test("deve aceitar categoria especifica", () => {
    const d = new Despesa({ ...params, categoria: CategoriaDespesa.LUZ });
    expect(d.categoria).toBe(CategoriaDespesa.LUZ);
  });

  test("nao deve expor referencia interna da lista de membros", () => {
    const d = new Despesa(params);
    const lista = d.dividirComIds;
    lista.push("membro-hacker"); // tenta modificar
    expect(d.dividirComIds).toHaveLength(3); // nao mudou!
  });
});

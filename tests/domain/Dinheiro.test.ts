// TESTES DO VALUE OBJECT DINHEIRO
// fiz esses testes primeiro antes de implementar (TDD!)
// Red -> Green -> Refactor

import { Dinheiro } from "../../src/domain/value-objects/Dinheiro";

describe("Dinheiro - Value Object", () => {
  
  // cenarios de sucesso
  describe("criacao", () => {
    test("deve criar dinheiro com centavos validos", () => {
      const d = new Dinheiro(1050);
      expect(d.centavos).toBe(1050);
      expect(d.reais).toBe(10.5);
    });

    test("deve criar dinheiro zero", () => {
      const d = Dinheiro.zero();
      expect(d.centavos).toBe(0);
      expect(d.ehZero()).toBe(true);
    });

    test("deve criar dinheiro a partir de reais", () => {
      const d = Dinheiro.deReais(15.99);
      expect(d.centavos).toBe(1599);
    });

    test("deve formatar corretamente pra reais brasileiros", () => {
      const d = new Dinheiro(2350);
      expect(d.toString()).toBe("R$ 23,50");
    });
  });

  // cenarios de falha (regras de negocio)
  describe("validacoes - deve dar erro quando", () => {
    test("centavos for numero decimal (nao inteiro)", () => {
      expect(() => new Dinheiro(10.5)).toThrow("numero inteiro");
    });

    test("valor for negativo", () => {
      expect(() => new Dinheiro(-1)).toThrow("negativo");
    });
  });

  // operacoes
  describe("operacoes aritmeticas", () => {
    test("deve somar dois valores corretamente", () => {
      const a = new Dinheiro(1000);
      const b = new Dinheiro(500);
      const resultado = a.somar(b);
      expect(resultado.centavos).toBe(1500);
    });

    test("deve subtrair corretamente", () => {
      const a = new Dinheiro(1000);
      const b = new Dinheiro(300);
      expect(a.subtrair(b).centavos).toBe(700);
    });

    test("deve lancar erro ao subtrair valor maior", () => {
      const a = new Dinheiro(100);
      const b = new Dinheiro(200);
      expect(() => a.subtrair(b)).toThrow();
    });

    test("deve dividir e arredondar pra cima (nao perder centavo)", () => {
      // R$10 dividido por 3 = R$3,34 (arredondado pra cima) cada
      const d = new Dinheiro(1000);
      const parte = d.dividir(3);
      expect(parte.centavos).toBe(334); // 333.33 -> 334
    });

    test("deve multiplicar corretamente", () => {
      const d = new Dinheiro(1000);
      expect(d.multiplicar(1.5).centavos).toBe(1500);
    });

    test("nao deve dividir por zero", () => {
      const d = new Dinheiro(100);
      expect(() => d.dividir(0)).toThrow();
    });

    test("deve ser imutavel - operacoes retornam novo objeto", () => {
      const original = new Dinheiro(1000);
      const resultado = original.somar(new Dinheiro(500));
      expect(original.centavos).toBe(1000); // nao mudou
      expect(resultado.centavos).toBe(1500); // novo objeto
    });
  });

  describe("comparacoes", () => {
    test("deve identificar qual eh maior", () => {
      const a = new Dinheiro(500);
      const b = new Dinheiro(300);
      expect(a.ehMaiorQue(b)).toBe(true);
      expect(b.ehMaiorQue(a)).toBe(false);
    });

    test("deve comparar igualdade", () => {
      const a = new Dinheiro(500);
      const b = new Dinheiro(500);
      expect(a.ehIgual(b)).toBe(true);
    });
  });
});

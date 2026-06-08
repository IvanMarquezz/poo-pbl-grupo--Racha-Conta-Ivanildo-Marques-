// Value Object: Dinheiro
// aprendi que nao pode usar float pra dinheiro por causa de erro de arredondamento
// entao vou guardar como centavos (inteiro) e so mostrar formatado
// ex: R$10,50 fica guardado como 1050

export class Dinheiro {
  // privado! nao pode mudar de fora
  private readonly _centavos: number;

  constructor(centavos: number) {
    if (!Number.isInteger(centavos)) {
      throw new Error("Dinheiro precisa ser em centavos (numero inteiro)");
    }
    if (centavos < 0) {
      throw new Error("Dinheiro nao pode ser negativo");
    }
    this._centavos = centavos;
  }

  // factory method - mais facil de criar
  static deReais(reais: number): Dinheiro {
    const centavos = Math.round(reais * 100);
    return new Dinheiro(centavos);
  }

  static zero(): Dinheiro {
    return new Dinheiro(0);
  }

  get centavos(): number {
    return this._centavos;
  }

  get reais(): number {
    return this._centavos / 100;
  }

  // operacoes - sempre retornam novo objeto (imutavel!)
  somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this._centavos + outro._centavos);
  }

  subtrair(outro: Dinheiro): Dinheiro {
    if (outro._centavos > this._centavos) {
      throw new Error("Resultado seria negativo, nao pode");
    }
    return new Dinheiro(this._centavos - outro._centavos);
  }

  dividir(quantidade: number): Dinheiro {
    if (quantidade <= 0) {
      throw new Error("Nao da pra dividir por zero ou numero negativo");
    }
    // arredonda pra cima pra nao perder centavo (a pessoa que pagou fica com o restinho a menos)
    return new Dinheiro(Math.ceil(this._centavos / quantidade));
  }

  multiplicar(fator: number): Dinheiro {
    return new Dinheiro(Math.round(this._centavos * fator));
  }

  ehMaiorQue(outro: Dinheiro): boolean {
    return this._centavos > outro._centavos;
  }

  ehIgual(outro: Dinheiro): boolean {
    return this._centavos === outro._centavos;
  }

  ehZero(): boolean {
    return this._centavos === 0;
  }

  // formata bonito pra mostrar na tela
  toString(): string {
    return `R$ ${this.reais.toFixed(2).replace('.', ',')}`;
  }
}

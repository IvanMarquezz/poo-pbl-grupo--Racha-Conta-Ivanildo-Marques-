// Value Object pra identificar um membro
// nao tem identidade propria, so os dados

export class NomeMembro {
  private readonly _valor: string;

  constructor(nome: string) {
    const limpo = nome.trim();
    if (limpo.length < 2) {
      throw new Error("Nome muito curto, precisa ter pelo menos 2 letras");
    }
    if (limpo.length > 80) {
      throw new Error("Nome muito longo");
    }
    this._valor = limpo;
  }

  get valor(): string {
    return this._valor;
  }

  toString(): string {
    return this._valor;
  }

  ehIgual(outro: NomeMembro): boolean {
    return this._valor.toLowerCase() === outro._valor.toLowerCase();
  }
}

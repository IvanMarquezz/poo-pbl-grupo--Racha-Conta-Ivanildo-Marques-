import { v4 as uuidv4 } from "uuid";
import { NomeMembro } from "../value-objects/NomeMembro";
import { Dinheiro } from "../value-objects/Dinheiro";

// Entidade Membro - tem identidade propria (id unico)
// cada pessoa do grupo eh um membro

export class Membro {
  private readonly _id: string;
  private _nome: NomeMembro;
  // saldo pode ser negativo? pensei bastante... acho que pode
  // se for negativo significa que a pessoa deve pro grupo
  private _saldoCentavos: number;

  constructor(nome: NomeMembro, id?: string) {
    this._id = id ?? uuidv4();
    this._nome = nome;
    this._saldoCentavos = 0;
  }

  get id(): string {
    return this._id;
  }

  get nome(): NomeMembro {
    return this._nome;
  }

  // nao vou deixar acessar saldo como Dinheiro porque Dinheiro nao aceita negativo
  // entao vou expor como numero mesmo e converter na apresentacao
  get saldoCentavos(): number {
    return this._saldoCentavos;
  }

  get saldoFormatado(): string {
    const abs = Math.abs(this._saldoCentavos);
    const reais = (abs / 100).toFixed(2).replace('.', ',');
    if (this._saldoCentavos < 0) {
      return `- R$ ${reais}`;
    }
    return `R$ ${reais}`;
  }

  get ehDevedor(): boolean {
    return this._saldoCentavos < 0;
  }

  get ehCredor(): boolean {
    return this._saldoCentavos > 0;
  }

  // metodos que mudam o saldo - so o proprio dominio chama isso
  adicionarCredito(valor: Dinheiro): void {
    this._saldoCentavos += valor.centavos;
  }

  adicionarDebito(valor: Dinheiro): void {
    this._saldoCentavos -= valor.centavos;
  }

  // pra testes e comparacao
  toString(): string {
    return `${this._nome.valor} (${this.saldoFormatado})`;
  }
}

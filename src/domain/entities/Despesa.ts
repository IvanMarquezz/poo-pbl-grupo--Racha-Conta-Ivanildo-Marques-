import { v4 as uuidv4 } from "uuid";
import { Dinheiro } from "../value-objects/Dinheiro";

// tipo da despesa - usei enum porque aprendi em aula
export enum CategoriaDespesa {
  MERCADO = "MERCADO",
  AGUA = "AGUA",
  LUZ = "LUZ",
  INTERNET = "INTERNET",
  ALUGUEL = "ALUGUEL",
  OUTROS = "OUTROS"
}

// Entidade Despesa - representa um gasto do grupo
// quem pagou, quanto, pra quais membros dividir

export class Despesa {
  private readonly _id: string;
  private readonly _descricao: string;
  private readonly _valor: Dinheiro;
  private readonly _quemPagouId: string;
  private readonly _dividirComIds: string[]; // ids de quem vai pagar a parte
  private readonly _categoria: CategoriaDespesa;
  private readonly _data: Date;

  constructor(params: {
    descricao: string;
    valor: Dinheiro;
    quemPagouId: string;
    dividirComIds: string[];
    categoria?: CategoriaDespesa;
    id?: string;
  }) {
    if (params.descricao.trim().length === 0) {
      throw new Error("Despesa precisa ter descricao");
    }
    if (params.valor.ehZero()) {
      throw new Error("Valor da despesa nao pode ser zero");
    }
    if (params.dividirComIds.length === 0) {
      throw new Error("Precisa dividir com pelo menos uma pessoa");
    }
    // nao faz sentido dividir sem incluir quem pagou... ou faz? na duvida vou deixar
    // o usuario decidir (nao obrigar que quem pagou esteja na lista)

    this._id = params.id ?? uuidv4();
    this._descricao = params.descricao.trim();
    this._valor = params.valor;
    this._quemPagouId = params.quemPagouId;
    this._dividirComIds = [...params.dividirComIds]; // copia pra nao vazar referencia
    this._categoria = params.categoria ?? CategoriaDespesa.OUTROS;
    this._data = new Date();
  }

  get id(): string { return this._id; }
  get descricao(): string { return this._descricao; }
  get valor(): Dinheiro { return this._valor; }
  get quemPagouId(): string { return this._quemPagouId; }
  get dividirComIds(): string[] { return [...this._dividirComIds]; } // retorna copia
  get categoria(): CategoriaDespesa { return this._categoria; }
  get data(): Date { return this._data; }

  // calcula quanto cada pessoa deve da despesa
  get valorPorPessoa(): Dinheiro {
    return this._valor.dividir(this._dividirComIds.length);
  }

  participaDivisao(membroId: string): boolean {
    return this._dividirComIds.includes(membroId);
  }
}

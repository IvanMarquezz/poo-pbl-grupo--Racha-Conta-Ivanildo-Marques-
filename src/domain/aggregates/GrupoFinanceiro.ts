import { v4 as uuidv4 } from "uuid";
import { Membro } from "../entities/Membro";
import { Despesa } from "../entities/Despesa";
import { Dinheiro } from "../value-objects/Dinheiro";
import { NomeMembro } from "../value-objects/NomeMembro";

// resultado do calculo de quem deve pra quem
export interface Acerto {
  deMembroId: string;
  deMembroNome: string;
  paraMembroId: string;
  paraMembroNome: string;
  valor: Dinheiro;
}

// AGGREGATE ROOT - classe principal, ela controla tudo
// nao da pra mexer nos membros e despesas sem passar por aqui

export class GrupoFinanceiro {
  private readonly _id: string;
  private _nome: string;
  private _membros: Map<string, Membro>;
  private _despesas: Despesa[];

  constructor(nome: string, id?: string) {
    if (nome.trim().length < 3) {
      throw new Error("Nome do grupo precisa ter pelo menos 3 caracteres");
    }
    this._id = id ?? uuidv4();
    this._nome = nome.trim();
    this._membros = new Map();
    this._despesas = [];
  }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }

  get membros(): Membro[] {
    return Array.from(this._membros.values());
  }

  get despesas(): Despesa[] {
    return [...this._despesas];
  }

  // adiciona membro no grupo
  adicionarMembro(nomeMembro: NomeMembro): Membro {
    // verifica se ja tem alguem com esse nome no grupo
    const jaExiste = this.membros.some(m => m.nome.ehIgual(nomeMembro));
    if (jaExiste) {
      throw new Error(`Ja tem alguem chamado "${nomeMembro.valor}" no grupo`);
    }
    const novo = new Membro(nomeMembro);
    this._membros.set(novo.id, novo);
    return novo;
  }

  removerMembro(membroId: string): void {
    if (!this._membros.has(membroId)) {
      throw new Error("Membro nao encontrado no grupo");
    }
    // nao deixa remover se tiver despesas envolvendo ele
    // (isso ficaria muito complicado de recalcular)
    const temDespesa = this._despesas.some(
      d => d.quemPagouId === membroId || d.participaDivisao(membroId)
    );
    if (temDespesa) {
      throw new Error("Nao da pra remover membro que tem despesas. Quita as dividas primeiro!");
    }
    this._membros.delete(membroId);
  }

  // registra uma despesa e ja atualiza os saldos de todo mundo
  registrarDespesa(despesa: Despesa): void {
    // valida se os membros existem
    if (!this._membros.has(despesa.quemPagouId)) {
      throw new Error("Quem pagou nao esta no grupo");
    }
    for (const id of despesa.dividirComIds) {
      if (!this._membros.has(id)) {
        throw new Error(`Membro ${id} nao esta no grupo`);
      }
    }

    this._despesas.push(despesa);
    this._atualizarSaldos(despesa);
  }

  // aqui eh onde a magica acontece - atualiza os saldos
  private _atualizarSaldos(despesa: Despesa): void {
    const quemPagou = this._membros.get(despesa.quemPagouId)!;
    const partePorPessoa = despesa.valorPorPessoa;

    // quem pagou recebe credito pelo total
    quemPagou.adicionarCredito(despesa.valor);

    // cada pessoa que divide paga a sua parte
    for (const membroId of despesa.dividirComIds) {
      const membro = this._membros.get(membroId)!;
      membro.adicionarDebito(partePorPessoa);
    }
  }

  // calcula quem deve quanto pra quem - algoritmo de clearing
  // tentei fazer o mais simples possivel
  calcularAcertos(): Acerto[] {
    const acertos: Acerto[] = [];

    // separa devedores e credores
    const devedores = this.membros
      .filter(m => m.ehDevedor)
      .map(m => ({ id: m.id, nome: m.nome.valor, saldo: Math.abs(m.saldoCentavos) }))
      .sort((a, b) => b.saldo - a.saldo); // maior devedor primeiro

    const credores = this.membros
      .filter(m => m.ehCredor)
      .map(m => ({ id: m.id, nome: m.nome.valor, saldo: m.saldoCentavos }))
      .sort((a, b) => b.saldo - a.saldo); // maior credor primeiro

    let i = 0; // indice do devedor
    let j = 0; // indice do credor

    // copia pra nao baguncar os saldos originais
    const devedoresCopia = devedores.map(d => ({ ...d }));
    const credoresCopia = credores.map(c => ({ ...c }));

    while (i < devedoresCopia.length && j < credoresCopia.length) {
      const devedor = devedoresCopia[i];
      const credor = credoresCopia[j];

      const transferir = Math.min(devedor.saldo, credor.saldo);

      if (transferir > 0) {
        acertos.push({
          deMembroId: devedor.id,
          deMembroNome: devedor.nome,
          paraMembroId: credor.id,
          paraMembroNome: credor.nome,
          valor: new Dinheiro(transferir)
        });
      }

      devedor.saldo -= transferir;
      credor.saldo -= transferir;

      if (devedor.saldo === 0) i++;
      if (credor.saldo === 0) j++;
    }

    return acertos;
  }

  // total gasto pelo grupo
  get totalGasto(): Dinheiro {
    return this._despesas.reduce(
      (acc, d) => acc.somar(d.valor),
      Dinheiro.zero()
    );
  }

  get quantidadeMembros(): number {
    return this._membros.size;
  }

  get quantidadeDespesas(): number {
    return this._despesas.length;
  }
}

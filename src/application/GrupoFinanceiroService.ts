// Casos de uso da aplicacao
// aqui fica a logica de orquestracao (nao a regra de negocio em si)

import { GrupoFinanceiro } from "../domain/aggregates/GrupoFinanceiro";
import { Despesa, CategoriaDespesa } from "../domain/entities/Despesa";
import { NomeMembro } from "../domain/value-objects/NomeMembro";
import { Dinheiro } from "../domain/value-objects/Dinheiro";
import { IGrupoRepository } from "../infrastructure/IGrupoRepository";

// DTO pra entrada de dados (transferencia da camada de apresentacao)
export interface AdicionarMembroDTO {
  grupoId: string;
  nome: string;
}

export interface RegistrarDespesaDTO {
  grupoId: string;
  descricao: string;
  valorEmCentavos: number;
  quemPagouId: string;
  dividirComIds: string[];
  categoria?: string;
}

export class GrupoFinanceiroService {
  constructor(private readonly _repo: IGrupoRepository) {}

  criarGrupo(nome: string): GrupoFinanceiro {
    const grupo = new GrupoFinanceiro(nome);
    this._repo.salvar(grupo);
    return grupo;
  }

  adicionarMembro(dto: AdicionarMembroDTO): void {
    const grupo = this._repo.buscarPorId(dto.grupoId);
    if (!grupo) throw new Error("Grupo nao encontrado");
    grupo.adicionarMembro(new NomeMembro(dto.nome));
    this._repo.salvar(grupo);
  }

  registrarDespesa(dto: RegistrarDespesaDTO): void {
    const grupo = this._repo.buscarPorId(dto.grupoId);
    if (!grupo) throw new Error("Grupo nao encontrado");

    const categoria = dto.categoria
      ? (dto.categoria as CategoriaDespesa)
      : CategoriaDespesa.OUTROS;

    const despesa = new Despesa({
      descricao: dto.descricao,
      valor: new Dinheiro(dto.valorEmCentavos),
      quemPagouId: dto.quemPagouId,
      dividirComIds: dto.dividirComIds,
      categoria
    });

    grupo.registrarDespesa(despesa);
    this._repo.salvar(grupo);
  }

  buscarGrupo(id: string): GrupoFinanceiro | null {
    return this._repo.buscarPorId(id);
  }

  listarGrupos(): GrupoFinanceiro[] {
    return this._repo.listarTodos();
  }
}

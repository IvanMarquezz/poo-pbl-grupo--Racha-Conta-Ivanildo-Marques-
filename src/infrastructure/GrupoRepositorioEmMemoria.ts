import { GrupoFinanceiro } from "../domain/aggregates/GrupoFinanceiro";
import { IGrupoRepository } from "./IGrupoRepository";

// implementacao em memoria - dados somem quando reinicia o servidor
// pro plus poderia trocar isso por um banco de dados real
// mas por enquanto serve pra demonstrar

export class GrupoRepositorioEmMemoria implements IGrupoRepository {
  // usando Map porque eh mais rapido pra buscar por id
  private _grupos: Map<string, GrupoFinanceiro> = new Map();

  salvar(grupo: GrupoFinanceiro): void {
    this._grupos.set(grupo.id, grupo);
  }

  buscarPorId(id: string): GrupoFinanceiro | null {
    return this._grupos.get(id) ?? null;
  }

  listarTodos(): GrupoFinanceiro[] {
    return Array.from(this._grupos.values());
  }

  // limpar tudo (util nos testes)
  limpar(): void {
    this._grupos.clear();
  }
}

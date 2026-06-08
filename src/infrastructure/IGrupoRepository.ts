import { GrupoFinanceiro } from "../domain/aggregates/GrupoFinanceiro";

// interface do repositorio - separa o dominio da persistencia
export interface IGrupoRepository {
  salvar(grupo: GrupoFinanceiro): void;
  buscarPorId(id: string): GrupoFinanceiro | null;
  listarTodos(): GrupoFinanceiro[];
}

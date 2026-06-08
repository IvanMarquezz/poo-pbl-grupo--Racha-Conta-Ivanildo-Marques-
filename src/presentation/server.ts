// servidor web simples com express
// rota de apresentacao que conecta a interface grafica com o dominio

import express from "express";
import path from "path";
import { GrupoFinanceiroService } from "../application/GrupoFinanceiroService";
import { GrupoRepositorioEmMemoria } from "../infrastructure/GrupoRepositorioEmMemoria";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// instancia o servico com repositorio em memoria
const repo = new GrupoRepositorioEmMemoria();
const servico = new GrupoFinanceiroService(repo);

// GET / -> serve o HTML
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST /grupos -> cria novo grupo
app.post("/grupos", (req, res) => {
  try {
    const { nome } = req.body;
    const grupo = servico.criarGrupo(nome);
    res.status(201).json({ id: grupo.id, nome: grupo.nome });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

// GET /grupos -> lista todos os grupos
app.get("/grupos", (_req, res) => {
  const grupos = servico.listarGrupos();
  res.json(grupos.map(g => ({
    id: g.id,
    nome: g.nome,
    membros: g.quantidadeMembros,
    totalGasto: g.totalGasto.toString()
  })));
});

// GET /grupos/:id -> detalhes do grupo
app.get("/grupos/:id", (req, res) => {
  const grupo = servico.buscarGrupo(req.params.id);
  if (!grupo) return res.status(404).json({ erro: "Grupo nao encontrado" });

  res.json({
    id: grupo.id,
    nome: grupo.nome,
    totalGasto: grupo.totalGasto.toString(),
    membros: grupo.membros.map(m => ({
      id: m.id,
      nome: m.nome.valor,
      saldo: m.saldoFormatado,
      ehDevedor: m.ehDevedor
    })),
    despesas: grupo.despesas.map(d => ({
      id: d.id,
      descricao: d.descricao,
      valor: d.valor.toString(),
      categoria: d.categoria,
      valorPorPessoa: d.valorPorPessoa.toString()
    })),
    acertos: grupo.calcularAcertos().map(a => ({
      de: a.deMembroNome,
      para: a.paraMembroNome,
      valor: a.valor.toString()
    }))
  });
});

// POST /grupos/:id/membros -> adiciona membro
app.post("/grupos/:id/membros", (req, res) => {
  try {
    const { nome } = req.body;
    servico.adicionarMembro({ grupoId: req.params.id, nome });
    const grupo = servico.buscarGrupo(req.params.id)!;
    res.status(201).json({
      membros: grupo.membros.map(m => ({ id: m.id, nome: m.nome.valor }))
    });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

// POST /grupos/:id/despesas -> registra despesa
app.post("/grupos/:id/despesas", (req, res) => {
  try {
    const { descricao, valorEmCentavos, quemPagouId, dividirComIds, categoria } = req.body;
    servico.registrarDespesa({
      grupoId: req.params.id,
      descricao,
      valorEmCentavos,
      quemPagouId,
      dividirComIds,
      categoria
    });
    res.status(201).json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`   projeto: financas coletivas pra republicas`);
  console.log(`   feito com muito cafe ☕\n`);
});

export default app;

const express = require('express');
const app = express();

// Middleware global para aceitar JSON no corpo (body) das requisições
app.use(express.json());

// ==========================================
// 1. CAMADA: MODELO (src/models/tarefaModel.js)
// ==========================================
// Banco de dados simulado em memória
let tarefas = [
  { id: 1, titulo: "Estudar Node.js", concluida: false },
  { id: 2, titulo: "Criar uma API com Express", concluida: true }
];

const TarefaModel = {
  listarTodas: () => tarefas,
  
  buscarPorId: (id) => tarefas.find(t => t.id === id),
  
  criar: (titulo) => {
    const novaTarefa = { id: Date.now(), titulo, concluida: false };
    tarefas.push(novaTarefa);
    return novaTarefa;
  },
  
  atualizar: (id, dados) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return null;
    
    if (dados.titulo !== undefined) tarefa.titulo = dados.titulo;
    if (dados.concluida !== undefined) tarefa.concluida = dados.concluida;
    
    return tarefa;
  },
  
  deletar: (id) => {
    const indice = tarefas.findIndex(t => t.id === id);
    if (indice === -1) return false;
    tarefas.splice(indice, 1);
    return true;
  }
};


// ==========================================
// 2. CAMADA: MIDDLEWARES (src/middlewares/)
// ==========================================

// Middleware de Log de requisições
const loggerMiddleware = (req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${duracao}ms)`);
  });
  next();
};

// Middleware de Validação (Desafio Extra)
const validadorMiddleware = (req, res, next) => {
  const { titulo } = req.body;
  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ erro: "O campo 'titulo' é obrigatório." });
  }
  next();
};


// ==========================================
// 3. CAMADA: CONTROLADOR (src/controllers/tarefaController.js)
// ==========================================
const TarefaController = {
  getAll: (req, res) => {
    res.json(TarefaModel.listarTodas());
  },

  getById: (req, res) => {
    const id = Number(req.params.id);
    const tarefa = TarefaModel.buscarPorId(id);
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.json(tarefa);
  },

  create: (req, res) => {
    const { titulo } = req.body;
    const novaTarefa = TarefaModel.criar(titulo);
    res.status(201).json(novaTarefa);
  },

  update: (req, res) => {
    const id = Number(req.params.id);
    const tarefaAtualizada = TarefaModel.atualizar(id, req.body);
    if (!tarefaAtualizada) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.json(tarefaAtualizada);
  },

  delete: (req, res) => {
    const id = Number(req.params.id);
    const deletado = TarefaModel.deletar(id);
    if (!deletado) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.status(204).send();
  }
};


// ==========================================
// 4. CAMADA: ROTAS (src/routes/tarefaRoutes.js)
// ==========================================
const router = express.Router();

// Aplicação do Middleware de Log globalmente no app
app.use(loggerMiddleware);

// Vinculação dos endpoints aos métodos do Controlador
router.get('/', TarefaController.getAll);
router.get('/:id', TarefaController.getById);
router.post('/', validadorMiddleware, TarefaController.create); // Validador local aqui
router.put('/:id', TarefaController.update);
router.delete('/:id', TarefaController.delete);

// Define o prefixo '/tarefas' para todas as rotas criadas no router
app.use('/tarefas', router);


// ==========================================
// 5. TRATAMENTO DE ERRO GLOBAL (Desafio Extra)
// ==========================================
app.use((err, req, res, next) => {
  console.error("🚨 Erro detectado:", err.stack);
  res.status(500).json({ erro: "Algo deu errado no servidor interno!" });
});


// ==========================================
// 6. INICIALIZAÇÃO DO SERVIDOR (server.js)
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 SERVIDOR UNIFICADO ONLINE`);
  console.log(`📡 Endereço: http://localhost:${PORT}/tarefas`);
  console.log(`=========================================`);
});

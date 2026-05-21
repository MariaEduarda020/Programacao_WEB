const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;

require('dotenv').config();

const app = express();
app.use(express.json());

// =========================================================================
// 1. CONEXÃO COM O MONGODB ATLAS
// =========================================================================
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:21017/escola';
mongoose.connect(mongoUri)
  .then(() => console.log('🍃 Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('🚨 Erro ao conectar ao MongoDB:', err));


// =========================================================================
// 2. CAMADA: MODELOS (Models com Validações e Relacionamento)
// =========================================================================

const CursoSchema = new Schema({
  nome: { type: String, required: [true, 'O nome do curso é obrigatório'], unique: true },
  cargaHoraria: { type: Number, required: true }
});
const Curso = mongoose.model('Curso', CursoSchema);

const AlunoSchema = new Schema({
  nome: { 
    type: String, 
    required: [true, 'O nome do aluno é obrigatório'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'O e-mail é obrigatório'], 
    unique: true,
    lowercase: true
  },
  idade: { 
    type: Number, 
    min: [16, 'A idade mínima permitida é 16 anos'] 
  },
  
  curso: { 
    type: Schema.Types.ObjectId, 
    ref: 'Curso',
    required: [true, 'O ID do curso é obrigatório']
  }
}, { timestamps: true }); 

const Aluno = mongoose.model('Aluno', AlunoSchema);


// =========================================================================
// 3. CAMADA: CONTROLADORES & ROTAS (CRUD completo com try/catch)
// =========================================================================
const router = express.Router();


router.post('/cursos', async (req, res) => {
  try {
    const novoCurso = new Curso(req.body);
    await novoCurso.save();
    res.status(201).json(novoCurso);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.get('/cursos', async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post('/alunos', async (req, res) => {
  try {
    const novoAluno = new Aluno(req.body);
    await novoAluno.save();
    res.status(201).json(novoAluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.get('/alunos', async (req, res) => {
  try {
    const { idadeMin } = req.query;
    let filtro = {};

    if (idadeMin) {
      filtro.idade = { $gte: Number(idadeMin) };
    }

    const alunos = await Aluno.find(filtro).populate('curso');
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get('/alunos/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.id).populate('curso');
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (error) {
    res.status(400).json({ erro: 'ID inválido ou mal formatado' });
  }
});
router.put('/alunos/:id', async (req, res) => {
  try {
  
    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!alunoAtualizado) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(alunoAtualizado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.delete('/alunos/:id', async (req, res) => {
  try {
    const alunoDeletado = await Aluno.findByIdAndDelete(req.params.id);
    if (!alunoDeletado) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.status(204).send(); // Sucesso sem conteúdo de retorno
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

app.use('/api', router);


// =========================================================================
// 4. INICIALIZAÇÃO DO SERVIDOR
// =========================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 Servidor ativo na porta ${PORT}`);
  console.log(`🔗 Teste Cursos em: http://localhost:${PORT}/api/cursos`);
  console.log(`🔗 Teste Alunos em: http://localhost:${PORT}/api/alunos`);
});

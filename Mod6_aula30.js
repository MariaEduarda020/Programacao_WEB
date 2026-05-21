const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;

require('dotenv').config();

const app = express();
app.use(express.json());

// =========================================================================
// 1. CONEXÃO COM O BANCO DE DADOS
// =========================================================================
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/escola';
mongoose.connect(mongoUri)
  .then(() => console.log('🍃 Conectado ao MongoDB Atlas!'))
  .catch(err => console.error('🚨 Erro de conexão:', err));


// =========================================================================
// 2. CAMADA: MODELOS (Adicionado o modelo de Usuário com Pre-save)
// =========================================================================

const Curso = mongoose.model('Curso', new Schema({
  nome: { type: String, required: true, unique: true },
  cargaHoraria: { type: Number, required: true }
}));

const Aluno = mongoose.model('Aluno', new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  idade: { type: Number, min: 16 },
  curso: { type: Schema.Types.ObjectId, ref: 'Curso', required: true }
}));

const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);


// =========================================================================
// 3. CAMADA: MIDDLEWARES DE SEGURANÇA (Autenticação e Autorização)
// =========================================================================

const autenticarJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.usuarioLogado = decodificado; // Injeta os dados do usuário na requisição
    next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};

const permitirApenas = (...rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuarioLogado) {
      return res.status(500).json({ erro: 'Middleware de autorização usado sem autenticação prévia.' });
    }

    if (!rolesPermitidas.includes(req.usuarioLogado.role)) {
      return res.status(403).json({ erro: 'Proibido. Seu perfil não tem permissão para esta ação.' });
    }

    next();
  };
};


// =========================================================================
// 4. CAMADA: ROTAS DE AUTENTICAÇÃO (Registro e Login)
// =========================================================================
const authRouter = express.Router();

authRouter.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) return res.status(400).json({ erro: 'E-mail já cadastrado.' });

    const novoUsuario = new Usuario({ nome, email, senha, role });
    await novoUsuario.save();

    novoUsuario.senha = undefined;
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRACAO || '1d' }
    );

    res.json({ mensagem: 'Login realizado com sucesso!', token });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});


// =========================================================================
// 5. CAMADA: ROTAS PROTEGIDAS (Alunos e Cursos)
// =========================================================================
const apiRouter = express.Router();

apiRouter.get('/cursos', autenticarJWT, async (req, res) => {
  const cursos = await Curso.find();
  res.json(cursos);
});

apiRouter.post('/cursos', autenticarJWT, permitirApenas('admin'), async (req, res) => {
  try {
    const novoCurso = new Curso(req.body);
    await novoCurso.save();
    res.status(201).json(novoCurso);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

apiRouter.post('/alunos', autenticarJWT, permitirApenas('admin'), async (req, res) => {
  try {
    const novoAluno = new Aluno(req.body);
    await novoAluno.save();
    res.status(201).json(novoAluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

apiRouter.get('/alunos', autenticarJWT, async (req, res) => {

  const alunos = await Aluno.find().populate('curso');
  res.json(alunos);
});

apiRouter.delete('/alunos/:id', autenticarJWT, permitirApenas('admin'), async (req, res) => {

  const deletado = await Aluno.findByIdAndDelete(req.params.id);
  if (!deletado) return res.status(404).json({ erro: 'Aluno não encontrado' });
  res.status(204).send();
});


app.use('/auth', authRouter);
app.use('/api', apiRouter);

// =========================================================================
// 6. INICIALIZAÇÃO DO SERVIDOR
// =========================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🔒 BACK-END PROTEGIDO E AUTENTICADO ATIVO`);
  console.log(`🔐 Rotas de Autenticação disponíveis em /auth`);
  console.log(`🛡️ Rotas de Dados Protegidas disponíveis em /api`);
  console.log(`===================================================`);
});

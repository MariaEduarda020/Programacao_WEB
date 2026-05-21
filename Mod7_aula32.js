const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;

require('dotenv').config();

const app = express();
app.use(express.json());

// =========================================================================
// 1. CONEXÃO COM O MONGO DB ATLAS
// =========================================================================
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/loja_vendas';
mongoose.connect(mongoUri)
  .then(() => console.log('🍃 Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('🚨 Erro ao conectar ao MongoDB:', err));


// =========================================================================
// 2. CAMADA: MODELOS (Com Enum, Ref e Validações)
// =========================================================================

const CategoriaSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  setor: { type: String, required: true }
});
const Categoria = mongoose.model('Categoria', CategoriaSchema);

const ProdutoSchema = new Schema({
  nome: { 
    type: String, 
    required: [true, 'O nome do produto é obrigatório'],
    trim: true 
  },
  preco: { 
    type: Number, 
    required: [true, 'O preço é obrigatório'],
    min: [0, 'O preço não pode ser negativo']
  },
  
  status: { 
    type: String, 
    enum: {
      values: ['ativo', 'inativo', 'fora_de_estoque'],
      message: '{VALUE} não é um status válido'
    },
    default: 'ativo'
  },
  categoria: { 
    type: Schema.Types.ObjectId, 
    ref: 'Categoria',
    required: [true, 'A categoria do produto é obrigatória']
  }
}, { timestamps: true });

const Produto = mongoose.model('Produto', ProdutoSchema);


// =========================================================================
// 3. CAMADA: CONTROLADORES & ROTAS (Paginação, Filtros e Desafio Extra)
// =========================================================================
const router = express.Router();

router.post('/categorias', async (req, res, next) => {
  try {
    const novaCategoria = new Categoria(req.body);
    await novaCategoria.save();
    res.status(201).json(novaCategoria);
  } catch (error) { next(error); }
});


router.post('/produtos', async (req, res, next) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (error) { next(error); }
});

router.get('/produtos', async (req, res, next) => {
  try {
    const { status, busca, pagina = 1, limite = 10, ordenar } = req.query;

    const filtro = {};

    if (status) {
      filtro.status = status;
    }

    if (busca) {
      filtro.nome = { $regex: busca, $options: 'i' }; 
    }

    const numPagina = Math.max(1, parseInt(pagina));
    const numLimite = Math.max(1, parseInt(limite));
    const pular = (numPagina - 1) * numLimite;

    let objetoOrdenacao = { createdAt: -1 }; 

    if (ordenar) {
      objetoOrdenacao = {}; 
      const campos = ordenar.split(',');
      
      campos.forEach(campo => {
        const [chave, direcao] = campo.split(':'); 
        objetoOrdenacao[chave] = direcao === 'desc' ? -1 : 1;
      });
    }

    const produtos = await Produto.find(filtro)
      .populate('categoria')
      .sort(objetoOrdenacao)
      .skip(pular)
      .limit(numLimite);

    const totalItens = await Produto.countDocuments(filtro);

    res.json({
      dados: produtos,
      paginacao: {
        totalItens,
        paginaAtual: numPagina,
        totalPaginas: Math.ceil(totalItens / numLimite),
        limitePorPagina: numLimite
      }
    });

  } catch (error) { next(error); }
});

router.put('/produtos/:id', async (req, res, next) => {
  try {
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!produtoAtualizado) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(produtoAtualizado);
  } catch (error) { next(error); }
});

router.delete('/produtos/:id', async (req, res, next) => {
  try {
    const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
    if (!produtoDeletado) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.status(204).send();
  } catch (error) { next(error); }
});

app.use('/api', router);


// =========================================================================
// 4. TRATAMENTO DE ERROS GLOBAL (Centralizado)
// =========================================================================
app.use((err, req, res, next) => {
  console.error("🚨 Log do Erro no Servidor:", err.message);

  if (err.name === 'ValidationError') {
    const mensagens = Object.values(err.errors).map(el => el.message);
    return res.status(400).json({ erro: 'Erro de Validação', detalhes: mensagens });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ erro: 'ID enviado está em um formato inválido' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ erro: 'Erro de duplicidade', detalhes: 'Um registro com estes dados já existe.' });
  }

  res.status(500).json({ erro: 'Algo deu errado no servidor interno!' });
});


// =========================================================================
// 5. INICIALIZAÇÃO DO SERVIDOR
// =========================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 API RESTFUL COMPLETA COM MONGOOSE ATIVA`);
  console.log(`🔗 Endendpoint de Produtos: http://localhost:${PORT}/api/produtos`);
  console.log(`===================================================`);
});

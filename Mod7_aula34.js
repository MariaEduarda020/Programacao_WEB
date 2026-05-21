const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { Schema } = mongoose;

require('dotenv').config();

const app = express();
app.use(express.json());

// Conexão com o Banco (Apenas fallback para o teste)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/loja_docs';
mongoose.connect(mongoUri).catch(err => console.error(err));

// Modelo Mongoose Simples de Produto para referência na Doc
const Produto = mongoose.model('Produto', new Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' }
}));

// =========================================================================
// CONFIGURAÇÃO DO SWAGGER
// =========================================================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Produtos',
      version: '1.0.0',
      description: 'Documentação interativa da API de Gerenciamento de Produtos',
      contact: { name: 'Suporte Técnico', email: 'dev@loja.com' }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local de Desenvolvimento'
      }
    ],
    components: {
      schemas: {
        Produto: {
          type: 'object',
          required: ['nome', 'preco'],
          properties: {
            id: { type: 'string', description: 'ID autogerado pelo MongoDB' },
            nome: { type: 'string', example: 'Teclado Mecânico RGB' },
            preco: { type: 'number', example: 349.90 },
            status: { type: 'string', enum: ['ativo', 'inativo'], example: 'ativo' }
          }
        }
      }
    }
  },
  // Caminho onde o Swagger vai procurar pelas anotações (neste caso, o próprio arquivo server.js)
  apis: ['./server.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// =========================================================================
// ROTAS DA API ANOTADAS COM @SWAGGER
// =========================================================================

/**
 * @swagger
 * /api/produtos:
 * post:
 * summary: Cadastra um novo produto
 * tags: [Produtos]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Produto'
 * responses:
 * 201:
 * description: Produto criado com sucesso
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Produto'
 * 400:
 * description: Erro na validação dos dados enviados
 */
app.post('/api/produtos', async (req, res) => {
  try {
    const novo = new Produto(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

/**
 * @swagger
 * /api/produtos:
 * get:
 * summary: Retorna a lista de todos os produtos
 * tags: [Produtos]
 * responses:
 * 200:
 * description: Lista de produtos recuperada com sucesso
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Produto'
 */
app.get('/api/produtos', async (req, res) => {
  const lista = await Produto.find();
  res.json(lista);
});

/**
 * @swagger
 * /api/produtos/{id}:
 * delete:
 * summary: Remove um produto pelo ID
 * tags: [Produtos]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID do produto a ser deletado
 * responses:
 * 204:
 * description: Produto deletado com sucesso (Sem conteúdo de retorno)
 * 404:
 * description: Produto não encontrado
 */
app.delete('/api/produtos/:id', async (req, res) => {
  const deletado = await Produto.findByIdAndDelete(req.params.id);
  if (!deletado) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.status(204).send();
});

// Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando.`);
  console.log(`📄 Documentação Swagger interativa em: http://localhost:${PORT}/docs`);
});

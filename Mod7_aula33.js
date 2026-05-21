
const API_AUTH = '/auth/login';
const API_PRODUTOS = '/api/produtos';
const API_CATEGORIAS = '/api/cursos'; 

const telaLogin = document.getElementById('tela-login');
const telaDashboard = document.getElementById('tela-dashboard');

const formLogin = document.getElementById('form-login');
const formProduto = document.getElementById('form-produto');
const listaProdutosContainer = document.getElementById('lista-produtos');
const selectCategoriaForm = document.getElementById('prod-categoria');
const selectFiltroCategoria = document.getElementById('filtro-categoria');
const btnLogout = document.getElementById('btn-logout');

const token = localStorage.getItem('token');
if (token) {
  inicializarDashboard();
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  try {
    const res = await fetch(API_AUTH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await res.json();
    if (!res.ok) throw new Error(dados.erro || 'Falha no login');

    localStorage.setItem('token', dados.token);
    inicializarDashboard();
  } catch (error) {
    alert(error.message);
  }
});

btnLogout.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.reload(); 
});

function inicializarDashboard() {
  telaLogin.classList.add('escondido');
  telaDashboard.classList.remove('escondido');
  carregarCategorias();
  carregarProdutos();
}


async extinction function carregarCategorias() {
  try {
    const res = await fetch(API_CATEGORIAS, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const categorias = await res.json();

    const options = categorias.map(c => `<option value="${c._id}">${c.nome}</option>`).join('');
    selectCategoriaForm.innerHTML = options;
    selectFiltroCategoria.innerHTML = '<option value="">Todas as categorias</option>' + options;
  } catch (err) { console.error(err); }
}

async function carregarProdutos() {
  try {
    const res = await fetch(API_PRODUTOS, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const payload = await res.json();
    renderizarProdutos(payload.dados || payload);
  } catch (err) { console.error(err); }
}

function renderizarProdutos(produtos) {
  listaProdutosContainer.innerHTML = '';

  produtos.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = prod._id;
    card.dataset.categoriaId = prod.categoria?._id || '';

    card.innerHTML = `
      <div>
        <h4>${prod.nome}</h4>
        <p>Categoria: <strong>${prod.categoria?.nome || 'Sem Categoria'}</strong></p>
        <p>Preço: R$ <input type="number" step="0.01" class="input-preco-inline" value="${prod.preco}"></p>
      </div>
      <div style="display:flex; gap: 5px; margin-top: 10px;">
        <button class="btn-salvar-inline" style="background-color: #10b981; font-size:12px; padding:5px;">✓ Salvar</button>
        <button class="btn-excluir btn-perigo" style="font-size:12px; padding:5px;">Excluir</button>
      </div>
    `;
    card.querySelector('.btn-salvar-inline').addEventListener('click', async () => {
      const novoPreco = card.querySelector('.input-preco-inline').value;
      await atualizarPrecoProduto(prod._id, novoPreco);
    });

    card.querySelector('.btn-excluir').addEventListener('click', async () => {
      if(confirm(`Deseja mesmo excluir ${prod.nome}?`)) {
        await excluirProduto(prod._id, card);
      }
    });

    listaProdutosContainer.appendChild(card);
  });
}

formProduto.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('prod-nome').value;
  const preco = document.getElementById('prod-preco').value;
  const categoria = selectCategoriaForm.value;

  try {
    const res = await fetch(API_PRODUTOS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ nome, preco, categoria })
    });

    if (!res.ok) {
      const erro = await res.json();
      throw new Error(erro.erro || 'Erro ao criar produto');
    }

    formProduto.reset();
    carregarProdutos(); 
  } catch (error) { alert(error.message); }
});

async function atualizarPrecoProduto(id, novoPreco) {
  try {
    const res = await fetch(`${API_PRODUTOS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ preco: Number(novoPreco) })
    });
    if(res.ok) alert('Preço atualizado!');
    else alert('Erro ao atualizar preço.');
  } catch (err) { console.error(err); }
}

async function excluirProduto(id, elementoCard) {
  try {
    const res = await fetch(`${API_PRODUTOS}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      elementoCard.remove(); 
    } else {
      alert('Não autorizado ou item não encontrado.');
    }
  } catch (err) { console.error(err); }
}

selectFiltroCategoria.addEventListener('change', () => {
  const categoriaSelecionada = selectFiltroCategoria.value;
  const cards = document.querySelectorAll('.product-card');

  cards.forEach(card => {
    if (!categoriaSelecionada || card.dataset.categoriaId === categoriaSelecionada) {
      card.classList.remove('escondido');
    } else {
      card.classList.add('escondido');
    }
  });
});

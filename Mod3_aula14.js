// 1. Array inicial com 5 produtos
const produtos = [
  { nome: "Cafeteira Elétrica", preco: 189.90, categoria: "Eletrodomésticos" },
  { nome: "Smartphone X", preco: 2499.90, categoria: "Eletrônicos" },
  { nome: "Livro de JavaScript", preco: 89.90, categoria: "Livros" },
  { nome: "Fone de Ouvido Bluetooth", preco: 350.00, categoria: "Eletrônicos" },
  { nome: "Teclado Mecânico", preco: 420.00, categoria: "Eletrônicos" }
];
const container = document.getElementById("container");
const btnEletronicos = document.getElementById("btn-eletronicos");
const btnLimpar = document.getElementById("btn-limpar");
const inputNome = document.getElementById("add-nome");
const inputPreco = document.getElementById("add-preco");
const inputCategoria = document.getElementById("add-categoria");
const btnAdicionar = document.getElementById("btn-adicionar");

function renderizarProdutos(listaProdutos) {
  container.innerHTML = "";

  listaProdutos.forEach(produto => {
    
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.categoria = produto.categoria.toLowerCase();
    const precoFormatado = produto.preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    card.innerHTML = `
      <h3>${produto.nome}</h3>
      <p class="preco">${precoFormatado}</p>
      <p class="categoria">${produto.categoria}</p>
    `;
    container.appendChild(card);
  });
}

btnEletronicos.addEventListener("click", () => {
  const cards = document.querySelectorAll(".card");
  
  cards.forEach(card => {
    if (card.dataset.categoria !== "eletrônicos") {
      card.classList.toggle("escondido");
    }
  });
  const filtrado = document.querySelector(".card.escondido");
  btnEletronicos.textContent = filtrado ? "Mostrar Todos" : "Mostrar só eletrônicos";
});

btnLimpar.addEventListener("click", () => {
  produtos.length = 0; 
  container.innerHTML = "";
});

btnAdicionar.addEventListener("click", () => {
  const nome = inputNome.value.trim();
  const preco = parseFloat(inputPreco.value);
  const categoria = inputCategoria.value.trim();

  if (!nome || isNaN(preco) || !categoria) {
    alert("Por favor, preencha todos os campos corretamente!");
    return;
  }

  const novoProduto = { nome, preco, categoria };
  produtos.push(novoProduto);

  renderizarProdutos(produtos);

  inputNome.value = "";
  inputPreco.value = "";
  inputCategoria.value = "";
});

renderizarProdutos(produtos);

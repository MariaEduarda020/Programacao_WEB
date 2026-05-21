const produtos = require('./dados.json');

console.log("    SISTEMA DE PROCESSAMENTO DE DADOS    ");


console.log("\n📦 Todos os produtos importados:");
produtos.forEach(produto => {
  console.log(`- ID: ${produto.id} | ${produto.nome.padEnd(16)} | R$ ${produto.preco.toFixed(2)}`);
});

console.log("\n⚡ Filtrando apenas por 'Eletrônicos':");
const eletronicos = produtos.filter(p => p.categoria === "Eletrônicos");
eletronicos.forEach(p => console.log(`- ${p.nome}`));

const valorTotalEstoque = produtos.reduce((acumulador, p) => acumulador + p.preco, 0);

console.log(`💰 Valor Total do Estoque: R$ ${valorTotalEstoque.toFixed(2)}`);

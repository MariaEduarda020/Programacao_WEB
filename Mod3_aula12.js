
let nome = "Maria";
let precoProduto = 200;
let percentualDesconto = 15;

let valorDesconto = precoProduto * (percentualDesconto / 100);
let precoFinal = precoProduto - valorDesconto;
let precoMaiorQue100 = precoProduto > 100;

let descontoValido = percentualDesconto >= 0 && percentualDesconto <= 100;

console.log(`Olá, ${nome}! O produto custa R$ ${precoProduto}`);
console.log(`Desconto de ${percentualDesconto}%: R$ ${valorDesconto}`);
console.log(`Preço final: R$ ${precoFinal}`);
console.log(`Preço acima de R$ 100? ${precoMaiorQue100}`);
console.log(`Desconto válido? ${descontoValido}`);

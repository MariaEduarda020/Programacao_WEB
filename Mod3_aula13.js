const alunos = [
  { nome: "Maria Silva", nota1: 8.5, nota2: 7.0 },
  { nome: "Erica Costa", nota1: 5.0, nota2: 4.5 },
  { nome: "Julia Antunes", nota1: 9.0, nota2: 9.5 },
  { nome: "Giovannna Souza", nota1: 6.0, nota2: 5.5 },
  { nome: "Eduardo Oliveira", nota1: 7.5, nota2: 8.0 }
];
const calcularMedia = (n1, n2) => (n1 + n2) / 2;
const alunosComMedia = alunos.map(aluno => ({
  ...aluno,
  media: calcularMedia(aluno.nota1, aluno.nota2)
}));


const alunosOrdenados = [...alunosComMedia].sort((a, b) => b.media - a.media);
const aprovados = alunosOrdenados.filter(aluno => aluno.media >= 6);
const reprovados = alunosOrdenados.filter(aluno => aluno.media < 6);
const totalMedias = alunosComMedia.reduce((acc, aluno) => acc + aluno.media, 0);
const mediaGeralTurma = totalMedias / alunosComMedia.length;

console.log("       RELATÓRIO GERENCIAL DE ALUNOS     ");

console.log("\n Alunos Ordenados por Nota:");
alunosOrdenados.forEach(({ nome, media }) => {
  console.log(`- ${nome.padEnd(18)} | Média: ${media.toFixed(1)}`);
});

console.log("\n Alunos Aprovados (Média >= 6.0):");
aprovados.forEach(({ nome, media }) => {
  console.log(`- ${nome.padEnd(18)} | Média: ${media.toFixed(1)}`);
});

console.log("\n Alunos Reprovados (Média < 6.0):");
reprovados.forEach(({ nome, media }) => {
  console.log(`- ${nome.padEnd(18)} | Média: ${media.toFixed(1)}`);
});

console.log(` Média Geral da Turma: ${mediaGeralTurma.toFixed(2)}`);

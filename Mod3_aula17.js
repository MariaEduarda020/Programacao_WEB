
const bancoPerguntas = {
  tecnologia: {
    facil: [
      { q: "O que significa HTML?", a: ["HyperText Markup Language", "HighText Machine Language", "HyperLink Management"], c: 0 },
      { q: "Qual empresa criou o iPhone?", a: ["Microsoft", "Apple", "Google"], c: 1 }
    ],
    dificil: [
      { q: "Qual o fechamento (closure) padrão no motor V8?", a: ["Lexical scope allocation", "EBR tree", "JIT Scope chain"], c: 0 }
    ]
  },
  ciencia: {
    facil: [
      { q: "Qual o planeta mais próximo do Sol?", a: ["Terra", "Marte", "Mercúrio"], c: 2 }
    ]
  }
};

let perguntasAtuais = [];
let indicePerguntaAtual = 0;
let pontuacao = 0;
let tempoRestante = 15;
let cronometro = null;
let tempoMaximoPorDificuldade = 15;

const telaConfig = document.getElementById("tela-config");
const telaJogo = document.getElementById("tela-jogo");
const txtPergunta = document.getElementById("texto-pergunta");
const containerAlternativas = document.getElementById("container-alternativas");
const barraProgresso = document.getElementById("barra-progresso");
const txtTimer = document.getElementById("timer");
const btnProxima = document.getElementById("btn-proxima");
const caixaPergunta = document.getElementById("caixa-pergunta");
const txtRecorde = document.getElementById("high-score");

let recordeSalvo = localStorage.getItem("quiz_recorde") || 0;
txtRecorde.textContent = recordeSalvo;

document.getElementById("btn-tema").addEventListener("click", () => {
  const html = document.documentElement;
  const novoTema = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", novoTema);
});

document.getElementById("btn-iniciar").addEventListener("click", () => {
  const cat = document.getElementById("select-categoria").value;
  const dif = document.getElementById("select-dificuldade").value;

  if (dif === "medio") tempoMaximoPorDificuldade = 10;
  else if (dif === "dificil") tempoMaximoPorDificuldade = 5;
  else tempoMaximoPorDificuldade = 15;

  perguntasAtuais = (bancoPerguntas[cat] && bancoPerguntas[cat][dif]) || bancoPerguntas.tecnologia.facil;
  
  indicePerguntaAtual = 0;
  pontuacao = 0;

  telaConfig.classList.add("escondido");
  telaJogo.classList.remove("escondido");
  
  mostrarPergunta();
});

function mostrarPergunta() {
  btnProxima.classList.add("escondido");
  clearInterval(cronometro);
  
  const dadosPergunta = perguntasAtuais[indicePerguntaAtual];

  const porcentagem = ((indicePerguntaAtual) / perguntasAtuais.length) * 180; 
  barraProgresso.style.width = `${(indicePerguntaAtual / perguntasAtuais.length) * 100}%`;

  caixaPergunta.classList.remove("fade-out");

  txtPergunta.textContent = dadosPergunta.q;
  containerAlternativas.innerHTML = "";

  dadosPergunta.a.forEach((alternativa, idx) => {
    const botao = document.createElement("button");
    botao.classList.add("alternativa");
    botao.textContent = alternativa;
    botao.addEventListener("click", () => verificarResposta(idx));
    containerAlternativas.appendChild(botao);
  });

  initTimer();
}

function initTimer() {
  tempoRestante = tempoMaximoPorDificuldade;
  txtTimer.textContent = tempoRestante;

  cronometro = setInterval(() => {
    tempoRestante--;
    txtTimer.textContent = tempoRestante;

    if (tempoRestante <= 0) {
      clearInterval(cronometro);
      verificarResposta(-1); 
    }
  }, 1000);
}
function verificarResposta(indiceSelecionado) {
  clearInterval(cronometro);
  const corretaIdx = perguntasAtuais[indicePerguntaAtual].c;
  const botoes = containerAlternativas.querySelectorAll(".alternativa");

  botoes.forEach((botao, idx) => {
    botao.disabled = true; 
    if (idx === corretaIdx) {
      botao.classList.add("correta"); 
    } else if (idx === indiceSelecionado) {
      botao.classList.add("errada"); 
    }
  });

  if (indiceSelecionado === corretaIdx) pontuacao++;

  btnProxima.classList.remove("escondido");
}

btnProxima.addEventListener("click", () => {
  caixaPergunta.classList.add("fade-out");

  setTimeout(() => {
    indicePerguntaAtual++;
    if (indicePerguntaAtual < perguntasAtuais.length) {
      mostrarPergunta();
    } else {
      finalizarQuiz();
    }
  }, 250);
});

function finalizarQuiz() {
  telaJogo.classList.add("escondido");
  telaConfig.classList.remove("escondido");
  barraProgresso.style.width = "100%";

  alert(`Fim de jogo! Você acertou ${pontuacao} de ${perguntasAtuais.length}.`);

  if (pontuacao > recordeSalvo) {
    recordeSalvo = pontuacao;
    localStorage.setItem("quiz_recorde", recordeSalvo);
    txtRecorde.textContent = recordeSalvo;
    alert("🎉 Novo Recorde Gravado!");
  }
}

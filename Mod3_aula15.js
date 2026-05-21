
const form = document.getElementById("form-tarefa");
const inputNovaTarefa = document.getElementById("nova-tarefa");
const listaUl = document.getElementById("lista-tarefas");
const inputBusca = document.getElementById("busca");
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

function salvarNoLocalStorage() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function renderizarTarefas() {
  listaUl.innerHTML = ""; 

  tarefas.forEach(tarefa => {
    const li = document.createElement("li");
    li.dataset.id = tarefa.id; 
    li.textContent = tarefa.texto;
    if (tarefa.concluida) {
      li.classList.add("concluida");
    }

    const botaoDeletar = document.createElement("button");
    botaoDeletar.textContent = "X";
    botaoDeletar.classList.add("btn-deletar");

    li.appendChild(botaoDeletar);
    listaUl.appendChild(li);
  });
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault(); 

  const textoTarefa = inputNovaTarefa.value.trim();
  if (!textoTarefa) return;
  const novaTarefa = {
    id: Date.now(), 
    texto: textoTarefa,
    concluida: false
  };

  tarefas.push(novaTarefa);
  salvarNoLocalStorage();
  renderizarTarefas();

  inputNovaTarefa.value = ""; 
  inputNovaTarefa.focus();
});
listaUl.addEventListener("click", (evento) => {
  const elementoClicado = evento.target;
  const liPai = elementoClicado.closest("li"); 
  
  if (!liPai) return;
  const idTarefa = Number(liPai.dataset.id);

  if (elementoClicado.classList.contains("btn-deletar")) {
    tarefas = tarefas.filter(tarefa => tarefa.id !== idTarefa);
    salvarNoLocalStorage();
    renderizarTarefas();
    return; 
  }

  const tarefaEncontrada = tarefas.find(tarefa => tarefa.id === idTarefa);
  if (tarefaEncontrada) {
    tarefaEncontrada.concluida = !tarefaEncontrada.concluida; 
    liPai.classList.toggle("concluida"); 
    salvarNoLocalStorage();
  }
});

inputBusca.addEventListener("input", () => {
  const termoBusca = inputBusca.value.toLowerCase().trim();
  const todosOsCardsLi = listaUl.querySelectorAll("li");

  todosOsCardsLi.forEach(li => {
    const textoTarefa = li.firstChild.textContent.toLowerCase();

    if (textoTarefa.includes(termoBusca)) {
      li.classList.remove("escondido");
    } else {
      li.classList.add("escondido");
    }
  });
});
renderizarTarefas();

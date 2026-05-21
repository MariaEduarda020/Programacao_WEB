
const coresTipos = {
  fire: '#ff9c54', water: '#4d90e2', grass: '#63bb5b', electric: '#f3d23b',
  ice: '#74cec0', fighting: '#ce4069', poison: '#ab6ac8', ground: '#d97746',
  flying: '#8fa8dd', psychic: '#f97176', bug: '#90c12c', rock: '#c7b78b',
  ghost: '#5269ac', dragon: '#0a6dc4', dark: '#5a5366', steel: '#5a8ea1',
  fairy: '#ec8fe6', normal: '#9099a1'
};

let idPokemonAtual = null;

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');
const conteudoTela = document.getElementById('conteudo-tela');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');

async function buscarPokemon(parametro) {
  if (!parametro) return;

  conteudoTela.innerHTML = `<p class="status-msg">Carregando Pokémon...</p>`;
  desativarBotoesNav();

  try {
    const busca formatada = String(parametro).toLowerCase().trim();
    
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${buscaformatada}`);
    if (!resposta.ok) {
      throw new Error('Pokémon não encontrado 😢');
    }

    const pokemonDados = await resposta.json();
    idPokemonAtual = pokemonDados.id;

    renderizarCard(pokemonDados);
    atualizarBotoesNav();

  } catch (erro) {
    idPokemonAtual = null;
    conteudoTela.innerHTML = `<p class="status-msg erro">${erro.message}</p>`;
    desativarBotoesNav();
  }
}

function renderizarCard(poke) {
 
  const tipoPrincipal = poke.types[0].type.name;
  const corDeFundo = coresTipos[tipoPrincipal] || coresTipos.normal;
  const htmlTipos = poke.types.map(info => {
    const corBadge = coresTipos[info.type.name] || coresTipos.normal;
    return `<span class="badge-tipo" style="background-color: ${corBadge}">${info.type.name}</span>`;
  }).join('');
  const htmlStats = poke.stats.map(estatistica => `
    <div class="stat-linha">
      <span class="stat-nome">${estatistica.stat.name.replace('-', ' ')}</span>
      <span class="stat-valor">${estatistica.base_stat}</span>
    </div>
  `).join('');

  const imagemUrl = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default;
  conteudoTela.innerHTML = `
    <div class="card" style="background: linear-gradient(180deg, ${corDeFundo}44 0%, #ffffff 65%)">
      <img src="${imagemUrl}" alt="${poke.name}" class="poke-img">
      <div class="poke-id">#${String(poke.id).padStart(3, '0')}</div>
      <h2 class="poke-nome">${poke.name}</h2>
      
      <div class="tipos-container">
        ${htmlTipos}
      </div>

      <div class="stats-container">
        ${htmlStats}
      </div>
    </div>
  `;
}


function atualizarBotoesNav() {

  btnAnterior.disabled = idPokemonAtual <= 1;
  btnProximo.disabled = false;
}

function desativarBotoesNav() {
  btnAnterior.disabled = true;
  btnProximo.disabled = true;
}

btnBuscar.addEventListener('click', () => {
  buscarPokemon(inputBusca.value);
});

inputBusca.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') buscarPokemon(inputBusca.value);
});
btnAnterior.addEventListener('click', () => {
  if (idPokemonAtual > 1) {
    buscarPokemon(idPokemonAtual - 1);
  }
});

btnProximo.addEventListener('click', () => {
  if (idPokemonAtual) {
    buscarPokemon(idPokemonAtual + 1);
  }
});

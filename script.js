const input = document.getElementById("inputCep");
const btn = document.getElementById("btnBuscar");

const resultado = document.getElementById("resultado");
const pokemonResult = document.getElementById("pokemonResult");

const history = document.getElementById("history");
const shinies = document.getElementById("shinies");

// limita listas
let historyList = [];
let shinyList = [];

// -------------------------
// FUNÇÃO: hash do CEP → Pokémon fixo
// -------------------------
function getPokemonId(cep) {
  let sum = 0;
  for (let c of cep) {
    sum += parseInt(c);
  }
  return (sum % 151) + 1; // pokémon da 1ª geração
}

// -------------------------
// FUNÇÃO: contar primos no CEP
// -------------------------
function countPrimes(cep) {
  const primes = new Set(["2", "3", "5", "7"]);
  let count = 0;

  for (let c of cep) {
    if (primes.has(c)) count++;
  }

  return count;
}

// -------------------------
// BUSCAR CEP(regex) 
// -------------------------
async function buscar() {
  const cep = input.value.trim().replace(/\D/g, "");

  if (cep.length !== 8) {
    resultado.innerHTML = "CEP inválido";
    return;
  }

  resultado.innerHTML = "Buscando...";

  // ViaCEP
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await res.json();

  if (data.erro) {
    resultado.innerHTML = "CEP não encontrado";
    return;
  }

  const pokemonId = getPokemonId(cep);
  const shiny = countPrimes(cep) >= 3;

  const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const poke = await pokeRes.json();

  const sprite = shiny
    ? poke.sprites.front_shiny
    : poke.sprites.front_default;

  const name = poke.name;

  const locationText = `${data.localidade} - ${data.uf}`;

  // resultado principal
  pokemonResult.innerHTML = `
    <img src="${sprite}">
    <h3>${name.toUpperCase()}</h3>
    <p>${locationText}</p>
  `;

  // item histórico
  const item = document.createElement("div");
  item.classList.add("item");
  item.innerHTML = `
    <img src="${sprite}">
    <span>${name} (${cep})</span>
  `;

  historyList.unshift(item);
  historyList = historyList.slice(0, 10);
  render(history, historyList);

  // shiny
  if (shiny) {
    const sItem = document.createElement("div");
    sItem.classList.add("item");
    sItem.innerHTML = `
      <img src="${poke.sprites.front_shiny}">
      <span>${name} ✨</span>
    `;

    shinyList.unshift(sItem);
    shinyList = shinyList.slice(0, 10);
    render(shinies, shinyList);
  }
}

// -------------------------
// render helper
// -------------------------
function render(container, list) {
  container.innerHTML = "";
  list.forEach(el => container.appendChild(el));
}

// -------------------------
// EVENTOS
// -------------------------
btn.addEventListener("click", buscar);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") buscar();
});
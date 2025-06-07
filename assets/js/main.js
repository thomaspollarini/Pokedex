function getScreenPokemonLimit() {
  const bodyWidth = document.body.clientWidth;
  if (bodyWidth < 380) {
    return 5;
  } else if (bodyWidth < 576) {
    return 10;
  } else if (bodyWidth < 992) {
    return 15;
  } else {
    return 20;
  }
}

function convertPokemonToLi(pokemon) {
  return `<li class="pokemon ${pokemon.type}" onclick="showPokemonDetail(${
    pokemon.number
  })">
            <span class="pokemon__number">#${pokemon.number
              .toString()
              .padStart(3, "0")}</span>
            <span class="pokemon__name">${pokemon.name}</span>
            <div class="pokemon__detail">
                    <ol class="pokemon__types">
                            ${pokemon.types
                              .map(
                                (type) =>
                                  `<li class="pokemon__type">${type}</li>`
                              )
                              .join("")}
                    </ol>
                    <img src="${pokemon.image}" alt="${pokemon.name}">
            </div>
    </li>
`;
}

function convertPokemonToDetail(pokemon) {
  return `<div class="${pokemon.type}">
        <div class="details__header">
            <button onclick="returnToPokedex()"><i class="fas fa-arrow-left"></i></button>
            <button><i class="far fa-heart"></i></button>
        </div>
        <div class="pokemon__detail">
          <span class="pokemon__name">${pokemon.name}</span>
          <span class="pokemon__number">#${pokemon.number
            .toString()
            .padStart(3, "0")}</span>
          <ol class="pokemon__types">
            ${pokemon.types
              .map((type) => `<li class="pokemon__type">${type}</li>`)
              .join("")}
          </ol>
          <img
            src="${pokemon.image}" alt="${pokemon.name}"
          />
        </div>
        <div class="pokemon__info-Container">
          <ul class="info__tabs">
            <li>
              <button class="info-Button selected">About</button>
            </li>
            <li ><button class="info-Button">Base Stats</button></li>
            <li><button class="info-Button">Evolution</button></li>
            <li><button class="info-Button">Moves</button></li>
          </ul>
          <div class="info selected">
            <table class="info__table">
              <tr>
                <th scope="row">Species</th>
                <td>${pokemon.species}</td>
              </tr>
              <tr>
                <th scope="row">Height</th>
                <td>${pokemon.height} m</td>
              </tr>
              <tr>
                <th scope="row">Weight</th>
                <td>${pokemon.weight} kg</td>
              </tr>
              <tr>
                <th scope="row">Abilities</th>
                <td colspan="2">${pokemon.abilities.join(", ")}</td>
              </tr>

              <th class="info__title">
                Breeding
              </th>
              <tr>
                <th scope="row">Gender</th>
                ${calculatePokemonGenderRate(pokemon.gender)}
              </tr>
              <tr>
                <th scope="row">Egg Groups</th>
                <td colspan="2">${pokemon.eggGroups.join(", ")}</td>
              </tr>
              <tr>
                <th scope="row">Egg Cycle</th>
                <td colspan="2">${pokemon.eggCycle} cycles</td>
              </tr>
            </table>
          </div>
        </div>
      </div>`;
}

function calculatePokemonGenderRate(genderRate) {
  return genderRate === -1
    ? `<td colspan="2"> Gender Unknown </td>`
    : `<td><i class="fas fa-mars" style="color: blue;"></i> ${(1 - genderRate/8)*100}%</td>
    <td><i class="fas fa-venus" style="color: pink;"></i> ${(genderRate/8)*100}%</td>`;
}

function loadPokemonItems(offset, limit) {
  pokeApi
    .getPokemons(offset, limit)
    .then(
      (pokemonList = []) =>
        (pokedexList.innerHTML += pokemonList.map(convertPokemonToLi).join(""))
    );
}

function showPokemonDetail(pokemonNumber) {
  const content = document.querySelector(".content");
  const contentDetails = document.querySelector(".content__details");

  pokeApi.getCompletePokemon(pokemonNumber).then((pokemon = []) => {
    contentDetails.innerHTML = convertPokemonToDetail(pokemon);
    content.classList.remove("selected");
    contentDetails.classList.add("selected");
  });
}

function returnToPokedex() {
  const content = document.querySelector(".content");
  const contentDetails = document.querySelector(".content__details");

  contentDetails.classList.remove("selected");
  content.classList.add("selected");
}

const pokedexList = document.querySelector(".pokemons");
const loadMoreButton = document.querySelector(".load-more");
const limit = getScreenPokemonLimit();
let offset = 0;

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  loadPokemonItems(offset, limit);
});

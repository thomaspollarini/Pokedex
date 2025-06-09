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
          <div class="info">
            <table class="info__table">
                <tr>
                    <th scope="row">HP</th>
                    <td>${pokemon.hp}</td>
                </tr>
                <tr>
                    <th scope="row">Attack</th>
                    <td>${pokemon.attack}</td>
                </tr>
                <tr>
                    <th scope="row">Defense</th>
                    <td>${pokemon.defense}</td>
                    
                </tr>
                <tr>
                    <th scope="row">Sp. Atk</th>
                    <td>${pokemon.specialAttack}</td>
                </tr>
                <tr>
                    <th scope="row">Sp. Def</th>
                    <td>${pokemon.specialDefense}</td>
                </tr>
                <tr>
                    <th scope="row">Speed</th>
                    <td>${pokemon.speed}</td>
                </tr>
                <tr>
                    <th scope="row">Total</th>
                    <td>${calculatePokemonTotalStats(pokemon)}</td>
                </tr>
            </table>
          </div>
          <div class="info">
            <span class="evolution__title">Evolution Chain</span>
            <div class="evolution__table">
              ${convertEvolutionChainToTable(pokemon.evolutionChain)}
            </div>
            ${convertMegaEvolutionToTable(pokemon)}
          </div>
        </div>
      </div>`;
}

function convertEvolutionChainToTable(evolutionChain) {
  if (!evolutionChain) {
    return `<tr><td colspan="3">No evolutions available</td></tr>`;
  } else {
    return evolutionChain
      .slice(0, -1)
      .map(
        (evolution, i) => `
                <div class="evolution__img-name">
                    <img src="${evolution.image}" alt="${
          evolution.name
        }" title="${evolution.name}" />
                    <span>${evolution.name}</span>
                </div>
                <div class="evolution__condition">
                    <i class="fas fa-arrow-right"></i>
                    <span>${evolutionChain[i + 1].condition}
                </div>
                <div class="evolution__img-name">
                    <img src="${evolutionChain[i + 1].image}" alt="${
          evolutionChain[i + 1].name
        }" title="${evolutionChain[i + 1].name}" />
                    <span>${evolutionChain[i + 1].name}</span>
                </div>`
      )
      .join("");
  }
}

function convertMegaEvolutionToTable(pokemon) {
  if (!pokemon.megaEvolution) {
    return "";
  } else {
    return (
      `<span class="evolution__title">Mega Evolution</span>
        <div class="evolution__table">` +
      pokemon.megaEvolution
        .map(
          (megaEvolution) => `
            <div class="evolution__img-name">
                <img src="${pokemon.image}" alt="${pokemon.name}" title="${pokemon.name}" />
                <span>${pokemon.name}</span>
            </div>
             <div class="evolution__condition">
                    <i class="fas fa-arrow-right"></i>
                    <span>Mega Stone</span>
                </div>
            <div class="evolution__img-name">
                <img src="${megaEvolution.image}" alt="${megaEvolution.name}" title="${megaEvolution.name}" />
                <span>${megaEvolution.name}</span>
            </div>
            `
        )
        .join("") +
      `</div>`
    );
  }
}

function convertMovesToHtml(moves) {
  return `<div class="info">
                <table class="moves__table">
                    <thead>
                        <tr>
                           <th scope="column">Name</th>
                           <th scope="column">Type</th>
                           <th scope="column">Power</th>
                           <th scope="column">PP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${convertMovesToTable(moves)}
                    </tbody>
                </table>
            </div>`;
}

function convertMovesToTable(moves) {
  return moves
    .map(
      (move) => `
        <tr>
            <td>${move.name}</td>
            <td><div class="${move.type}">${move.type}</td>
            <td>${move.power}</td>
            <td>${move.pp}</td>
        </tr>`
    )
    .join("");
}

function calculatePokemonGenderRate(genderRate) {
  return genderRate === -1
    ? `<td colspan="2"> Gender Unknown </td>`
    : `<td><i class="fas fa-mars" style="color: blue;"></i> ${
        (1 - genderRate / 8) * 100
      }%</td>
    <td><i class="fas fa-venus" style="color: pink;"></i> ${
      (genderRate / 8) * 100
    }%</td>`;
}

function calculatePokemonTotalStats(pokemon) {
  return (
    pokemon.hp +
    pokemon.attack +
    pokemon.defense +
    pokemon.specialAttack +
    pokemon.specialDefense +
    pokemon.speed
  );
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

  pokeApi
    .getCompletePokemon(pokemonNumber)
    .then(async (pokemon = []) => {
      contentDetails.innerHTML = convertPokemonToDetail(pokemon);
      content.classList.remove("selected");
      contentDetails.classList.add("selected");

      pokemon.moves = await Promise.all(
        pokemon.moves.map(async (move) => await pokeApi.getMoveDetail(move.url))
      );

      const infoContainer = document.querySelector(".pokemon__info-Container");
      infoContainer.innerHTML += convertMovesToHtml(pokemon.moves);
      addInfoButtonListeners(); // Adiciona listeners após atualizar o HTML

      return true;
    })
    .catch((error) => alert("Pokémon not found!"));
}

function returnToPokedex() {
  const content = document.querySelector(".content");
  const contentDetails = document.querySelector(".content__details");

  contentDetails.classList.remove("selected");
  content.classList.add("selected");
}

function addInfoButtonListeners() {
  const infoButtons = document.querySelectorAll(".info-Button");
  const infoSections = document.querySelectorAll(".info");

  infoButtons.forEach((button, index) =>
    button.addEventListener("click", () => {
      if (!button.classList.contains("selected")) {
        const infoButtonSelected = document.querySelector(
          ".info-Button.selected"
        );
        if (infoButtonSelected) {
          infoButtonSelected.classList.remove("selected");
        }
        button.classList.add("selected");
        const infoSectionSelected = document.querySelector(".info.selected");
        if (infoSectionSelected) {
          infoSectionSelected.classList.remove("selected");
        }
        infoSections[index].classList.add("selected");
      }
    })
  );
}

const pokedexList = document.querySelector(".pokemons");
const loadMoreButton = document.querySelector(".load-more");
const limit = getScreenPokemonLimit();
const searchButton = document.querySelector(".search__button");
let offset = 0;

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  loadPokemonItems(offset, limit);
});

searchButton.addEventListener("click", () => {
  const searchInput = document.querySelector(".search__input");
  debugger;
  showPokemonDetail(searchInput.value);
});

function convertPokemonToLi(pokemon) {
  return `<li class="pokemon">
        <span class="pokemon__number">#001</span>
        <span class="pokemon__name">${pokemon.name}</span>
        <div class="pokemon__detail">
            <ol class="pokemon__types">
                <li class="pokemon__type">Grass</li>
                <li class="pokemon__type">Poison</li>
            </ol>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" alt="${pokemon.name}">
        </div>
    </li>
  `;
}

const pokedexList = document.querySelector(".pokemons");

pokeApi
  .getPokemons()
  .then(
    (pokemonList = []) =>
      (pokedexList.innerHTML = pokemonList.map(convertPokemonToLi).join(""))
  );

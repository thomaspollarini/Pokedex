
function getScreenPokemonLimit(){
    const bodyWidth = document.body.clientWidth;
    if (bodyWidth < 380){
        return 5;
    } else if (bodyWidth < 576){
        return 10;
    } else if (bodyWidth < 992){
        return 15;
    } else{
        return 20;
    }
}

function convertPokemonToLi(pokemon) {
return `<li class="pokemon">
            <span class="pokemon__number">#${pokemon.number.toString().padStart(3, '0')}</span>
            <span class="pokemon__name">${pokemon.name}</span>
            <div class="pokemon__detail">
                    <ol class="pokemon__types">
                            ${pokemon.types.map((type) => `<li class="pokemon__type">${type}</li>`).join("")}
                    </ol>
                    <img src="${pokemon.image}" alt="${pokemon.name}">
            </div>
    </li>
`;
}

const pokedexList = document.querySelector(".pokemons");



pokeApi
  .getPokemons(0, getScreenPokemonLimit())
  .then(
    (pokemonList = []) =>
      (pokedexList.innerHTML = pokemonList.map(convertPokemonToLi).join(""))
  );

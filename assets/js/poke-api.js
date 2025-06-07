const pokeApi = {};

function convertPokeApiDetailToPokemon(pokemonDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokemonDetail.id;
  pokemon.name = pokemonDetail.name;
  pokemon.types = pokemonDetail.types.map((typeSlot) => typeSlot.type.name);
  pokemon.type = pokemon.types[0];
  pokemon.image = pokemonDetail.sprites.other["official-artwork"].front_default;
  pokemon.abilities = pokemonDetail.abilities.map(
    (abilitySlot) => abilitySlot.ability.name
  );
  pokemon.height = pokemonDetail.height / 10; // Convert to meters
  pokemon.weight = pokemonDetail.weight / 10; // Convert to kilograms

  return pokemon;
}

pokeApi.getSpeciesDetail = (pokemon) => {
  return fetch(pokemon.species.url)
    .then((response) => response.json())
    .then((speciesDetail) => {
      return {
        species:
          speciesDetail.genera
            .find((g) => g.language.name === "en")
            ?.genus.replace(" Pokémon", "") || "",
        gender: speciesDetail.gender_rate,
        eggCycle: speciesDetail.hatch_counter,
        eggGroups: speciesDetail.egg_groups.map((eggGroup) => eggGroup.name),
      };
    });
};

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemons = (offset = 0, limit = 10) => {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequests) => Promise.all(detailRequests))
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error; // Re-throw the error for further handling if needed
    });
};

pokeApi.getCompletePokemon = async (pokemonNumber) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`;
  const response = await fetch(url);
  const pokemon = await response.json();
  const pokemonDetail = convertPokeApiDetailToPokemon(pokemon);
  const speciesDetail = await pokeApi.getSpeciesDetail(pokemon);
  Object.assign(pokemonDetail, speciesDetail);

  return pokemonDetail;
};

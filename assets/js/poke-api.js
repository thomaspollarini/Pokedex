const pokeApi = {};

function convertPokeApiDetailToPokemon(pokemonDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokemonDetail.id;
  pokemon.name = pokemonDetail.name;
  pokemon.types = pokemonDetail.types.map((typeSlot) => typeSlot.type.name);
  pokemon.type = pokemon.types[0];
  pokemon.image = pokemonDetail.sprites.other["official-artwork"].front_default;

  return pokemon;
}

function convertPokeApiStatsDetails(pokemonDetail) {
  return {
    height: pokemonDetail.height / 10, // Convert decimetres to metres
    weight: pokemonDetail.weight / 10, // Convert hectograms to kilograms
    abilities: pokemonDetail.abilities.map(
      (abilitySlot) => abilitySlot.ability.name
    ),
    hp: pokemonDetail.stats.find((stat) => stat.stat.name === "hp").base_stat,
    attack: pokemonDetail.stats.find((stat) => stat.stat.name === "attack")
      .base_stat,
    defense: pokemonDetail.stats.find((stat) => stat.stat.name === "defense")
      .base_stat,
    specialAttack: pokemonDetail.stats.find(
      (stat) => stat.stat.name === "special-attack"
    ).base_stat,
    specialDefense: pokemonDetail.stats.find(
      (stat) => stat.stat.name === "special-defense"
    ).base_stat,
    speed: pokemonDetail.stats.find((stat) => stat.stat.name === "speed")
      .base_stat,
    moves: pokemonDetail.moves.map((moveSlot) => {
      return {
        url: moveSlot.move.url,
      };
    }),
  };
}

function getMegaEvolutions(varieties) {
  const megaEvolutions = varieties
    .filter((variety) => variety.pokemon.name.includes("mega"))
    .map((variety) => {
      const id = variety.pokemon.url.match(/\/(\d+)\//)[1];
      return {
        name: variety.pokemon.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      };
    });

  return megaEvolutions.length ? megaEvolutions : null;
}

function resolveEvolutionChain(chain, pokemonNumber) {
  if (!chain.evolves_to.length) {
    return {
      name: chain.species.name,
      condition: returnEvolutionCondition(chain.evolution_details[0]),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonNumber}.png`,
    };
  } else {
    // Recursively build a flat array of evolution stages
    const currentStage = {
      name: chain.species.name,
      condition: !chain.evolution_details.length
        ? "first-stage"
        : returnEvolutionCondition(chain.evolution_details[0]),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonNumber}.png`,
    };

    // If there are multiple evolutions, map each one and flatten the result
    const nextStages = chain.evolves_to.flatMap((nextChain) =>
      resolveEvolutionChain(
        nextChain,
        parseInt(nextChain.species.url.match(/\/(\d+)\//)[1])
      )
    );

    return [currentStage, ...nextStages];
  }
}

function returnEvolutionCondition(evolutionDetails) {
  let evolutionCondition = "Unknown trigger"; // Usaremos para armazenar o valor final
  // Verifique se evolutionDetails existe para evitar erros
  if (evolutionDetails) {
    const triggerName = evolutionDetails.trigger.name;

    switch (triggerName) {
      case "level-up":
        // Evolução por nível
        if (evolutionDetails.min_level) {
          evolutionCondition = `Level ${evolutionDetails.min_level}`;
        } else if (evolutionDetails.min_happiness) {
          evolutionCondition = `High Friendship (min. ${evolutionDetails.min_happiness} happiness)`;
        } else if (evolutionDetails.min_beauty) {
          evolutionCondition = `High Beauty (min. ${evolutionDetails.min_beauty} beauty)`;
        } else if (evolutionDetails.gender) {
          evolutionCondition = `Level-up (Gender: ${
            evolutionDetails.gender === 1 ? "Female" : "Male"
          })`;
        } else if (evolutionDetails.time_of_day) {
          evolutionCondition = `Level-up during the ${evolutionDetails.time_of_day}`;
        } else if (evolutionDetails.known_move) {
          evolutionCondition = `Level-up knowing ${evolutionDetails.known_move.name.replace(
            /-/g,
            " "
          )}`;
        } else if (evolutionDetails.location) {
          evolutionCondition = `Level-up at ${evolutionDetails.location.name.replace(
            /-/g,
            " "
          )}`;
        } else if (evolutionDetails.min_affection) {
          evolutionCondition = `High Affection (min. ${evolutionDetails.min_affection} affection)`;
        } else if (evolutionDetails.relative_physical_stats) {
          if (evolutionDetails.relative_physical_stats === 1) {
            evolutionCondition = `Level-up (Attack > Defense)`;
          } else if (evolutionDetails.relative_physical_stats === 0) {
            evolutionCondition = `Level-up (Attack = Defense)`;
          } else if (evolutionDetails.relative_physical_stats === -1) {
            evolutionCondition = `Level-up (Attack < Defense)`;
          }
        } else {
          evolutionCondition =
            "Level-up (specific conditions apply, check details)";
        }
        break;

      case "trade":
        // Evolução por troca
        if (evolutionDetails.held_item) {
          evolutionCondition = `Trade while holding ${evolutionDetails.held_item.name.replace(
            /-/g,
            " "
          )}`;
        } else {
          evolutionCondition = "Trade";
        }
        break;

      case "use-item":
        // Evolução por uso de item (pedra de evolução)
        if (evolutionDetails.item) {
          evolutionCondition = `Use ${evolutionDetails.item.name.replace(
            /-/g,
            " "
          )}`;
        }
        break;

      case "shed":
        // Este trigger é específico para Nincada -> Ninjask e Shedinja
        evolutionCondition =
          "Have an empty slot in party and a Poké Ball when Nincada evolves";
        break;

      // --- Outros triggers menos comuns, mas possíveis ---
      case "take-damage":
        // Ex: Galarian Yamask
        evolutionCondition = `Take ${evolutionDetails.min_damage_taken} HP damage without fainting`;
        break;

      case "walk-with-party":
        // Ex: Pawmo, Bramblin (introduzido em Scarlet/Violet)
        evolutionCondition = `Walk ${
          evolutionDetails.known_move_type
            ? evolutionDetails.known_move_type.name
            : ""
        } for ${
          evolutionDetails.min_walked_distance
        } steps outside of Poké Ball`;
        break;

      case "spin":
        // Ex: Inkay
        evolutionCondition = "Spin the console upside down";
        break;

      case "battle-and-level-up":
        // Ex: Primeape para Annihilape (usar Rage Fist 20 vezes)
        if (evolutionDetails.known_move && evolutionDetails.min_moves_used) {
          evolutionCondition = `Use ${evolutionDetails.known_move.name.replace(
            /-/g,
            " "
          )} ${evolutionDetails.min_moves_used} times and level-up`;
        } else {
          evolutionCondition = "Battle-specific condition and level-up";
        }
        break;

      case "other":
        // Para triggers que não se encaixam nas categorias acima, como os de Bisharp, Gimmighoul.
        // Você precisaria de lógica mais específica aqui se quisesse detalhar cada um.
        evolutionCondition =
          "Specific condition not covered by common triggers";
        break;

      default:
        evolutionCondition = "Unknown trigger";
        break;
    }
  }

  return evolutionCondition;
}

pokeApi.getSpeciesDetail = (pokemonId) => {
  const url = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;

  return fetch(url)
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
        evolutionUrl: speciesDetail.evolution_chain.url,
        megaEvolution: getMegaEvolutions(speciesDetail.varieties),
      };
    })
    .catch((error) => {
      console.error("Error fetching species detail:", error);
    });
};

pokeApi.getEvolutionChain = (url) => {
  return fetch(url)
    .then((response) => response.json())
    .then((evolutionDetail) => {
      if (!evolutionDetail.chain.evolves_to.length) {
        return { evolutionChain: null };
      } else {
        return {
          evolutionChain: resolveEvolutionChain(
            evolutionDetail.chain,
            parseInt(
              parseInt(evolutionDetail.chain.species.url.match(/\/(\d+)\//)[1])
            )
          ),
        };
      }
    })
    .catch((error) => {
      console.error("Error fetching evolution chain:", error);
      return { evolutionChain: null }; // Return null or an empty array if there's an error
    });
};

pokeApi.getMoveDetail = (moveUrl) => {
  return fetch(moveUrl)
    .then((response) => response.json())
    .then((moveDetail) => {
      return {
        name: moveDetail.name,
        type: moveDetail.type.name,
        power: moveDetail.power || "-", // Some moves may not have power
        pp: moveDetail.pp,
      };
    })
    .catch((error) => {
      console.error("Error fetching move detail:", error);
      return null; // Return null or an empty object if there's an error
    });
};

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemon = (pokemonId) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;

  return fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching Pokemon data:", error);
      return null;
    });
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

pokeApi.getCompletePokemon = async (pokemonId) => {
  const pokemon = await pokeApi.getPokemon(pokemonId);
  if (!pokemon) {
    return null; // Return null if the Pokemon is not found
  }

  const pokemonDetail = convertPokeApiDetailToPokemon(pokemon);

  Object.assign(pokemonDetail, convertPokeApiStatsDetails(pokemon));
  Object.assign(pokemonDetail, await pokeApi.getSpeciesDetail(pokemonId));
  Object.assign(
    pokemonDetail,
    await pokeApi.getEvolutionChain(pokemonDetail.evolutionUrl, pokemonId)
  );

  return pokemonDetail;
};


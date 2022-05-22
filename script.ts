async function getData(page: number) {
  const response = await fetch(`Insert request url here for page index`);
  return response.json();
}

function parseResults(data: any) {
  return data.results[0].hits;
}

function filterData(items: any[]) {
  return items.map((data) => {
    return {
      name: data.name,
      coords: {
        latitude: data._geoloc.lat,
        longitude: data._geoloc.lng,
      },
      number_of_stars: parseStar(data.michelin_award),
      cuisines: data.cuisines.map((c: any) => c.label),
      city: data.city.name,
      country: data.country.name,
    };
  });
}

function parseStar(starEnum: string) {
  switch (starEnum) {
    case "ONE_STAR":
      return 1;
    case "TWO_STARS":
      return 2;
    case "THREE_STARS":
      return 3;
    default:
      throw new Error("unknown star enum " + starEnum);
  }
}

async function process(restaurants: any[]) {
  await Deno.writeTextFile("./data.json", JSON.stringify(restaurants, null, 4));
}

async function execute(page: number) {
  const data = await getData(page);
  const cleanedData = filterData(parseResults(data));
  return cleanedData;
}

async function go() {
  let results = [];
  for (var i = 0; i < 100; i++) {
    results.push(i);
  }
  results = results.map((index) => execute(index));
  const all = await Promise.all(results);
  const finalResults = all.flat();
  console.log("Generated " + finalResults.length + " restaurants");
  return finalResults;
}

go().then(process);

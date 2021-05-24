async function getClientGeolocation() {
	if (!navigator.geolocation) {
		return null;
	}
	return new Promise(success => {
		navigator.geolocation.getCurrentPosition(
			position => { console.log(position); return success(position.coords); },
			() => success(null)
		);
	})
}

async function initLocationSearch() {
  const button = document.querySelector('.search-btn');
  button.classList.add('is-loading');
	const coordinates = await getClientGeolocation();
	if (!coordinates) {
    button.classList.remove('is-loading');
		return;
	}
	button.remove();
  button.classList.remove('is-loading');
	const locations = getSortedAsList(coordinates, window.locationData).slice(0,10);
	renderNarrativeWithResult(coordinates, locations[0]);
  renderTableWithResults(coordinates, locations);
  document.querySelector('.results').classList.remove('is-hidden');
  document.querySelector('.results-btn').classList.remove('is-hidden');
  const map = renderMap(coordinates);
  document.querySelector('.results').scrollIntoView({
    behavior: 'smooth'
  });
	setTimeout(() => {
		renderCenterAndMarkers(map, coordinates, locations);
	}, 1500);
}


function renderMap(coordinates) {
	const homeCoordinates = [coordinates.latitude, coordinates.longitude];
	const map = L.map('mapid', {
		zoomControl: false,
		dragging: false,
      boxZoom: false,
		scrollWheelZoom: false

	}).setView(homeCoordinates, 18);
	L.marker(homeCoordinates).addTo(map).bindPopup('Your location').openPopup();
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	return map;
}

function renderNarrativeWithResult(centercoords, location) {
 document.querySelector('#result-name').textContent = location.name;
 document.querySelector('#result-distance').textContent = formattedDistanceInMiles(centercoords, location.coords) + ' away';
 document.querySelector('#result-stars').textContent = `${location.number_of_stars} Michelin star${location.number_of_stars > 1 ? 's' : ''}`;
 window.twttr(document, 'script', 'twitter-wjs');
 initFacebookButton(document, 'script', 'facebook-jssdk');
}

function renderTableWithResults(centercoords, locations) {
	let tableRowHtml = '';
	locations.forEach((location) => {
		tableRowHtml += createTableRowForRestaurant(centercoords, location);
	});
	document.querySelector('.table-body').innerHTML = tableRowHtml;
}

function renderCenterAndMarkers(map, centercoords, locations) {
	// Convert all to markers
	const locationMarkers = locations.map(location => {
		const marker = L.marker([location.coords.latitude, location.coords.longitude]);
		marker.bindPopup(`<strong>${location.name}</strong>`);
		return marker;
	});
	locationMarkers.forEach((marker, index) => {
			marker.addTo(map);
	});
	locationMarkers.push(L.marker([centercoords.latitude, centercoords.longitude]));
	const group = new L.featureGroup(locationMarkers);
	map.on('zoomend', () => {
		locationMarkers[0].openPopup();
	});
	map.flyToBounds(
		group.getBounds(),
		{
			padding: L.point(36, 36),
			animate: true,
		}
	);
}

function getSortedAsList(coordinates, locations) {
	return locations.sort((location1, location2) => {
		const distance1 = distance(coordinates, location1.coords);
		const distance2 = distance(coordinates, location2.coords);
		if (distance1 === distance2) {
			return 0;
		}
		return distance1 < distance2 ? -1 : 1;
	});
}

function distance(location1, location2) {
    return haversineDistanceIn(
    	location1.latitude,
			location1.longitude,
			location2.latitude,
			location2.longitude
		);
}

function createTableRowForRestaurant(centercoords, location) {
	const d = formattedDistanceInMiles(centercoords, location.coords);
	return `
		<tr>
			<td>${d}</td>
			<td>${'⭐'.repeat(location.number_of_stars)}</td>
			<td>${location.name}</td>
			<td>${(location.cuisines || []).join( ' | ')}</td>
			<td>${location.city}</td>
		</tr>`;
}

window.locationData =
	[
  {
    "name": "Shin Sushi",
    "coords": {
      "latitude": 34.15784,
      "longitude": -118.49415
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Encino"
  },
  {
    "name": "Rustic Canyon",
    "coords": {
      "latitude": 34.024952,
      "longitude": -118.49118
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "Santa Monica"
  },
  {
    "name": "Kato",
    "coords": {
      "latitude": 34.0419067,
      "longitude": -118.4610935
    },
    "number_of_stars": 1,
    "cuisines": [
      "Asian",
      "Taiwanese"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Shunji",
    "coords": {
      "latitude": 34.028496,
      "longitude": -118.45195
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Mori Sushi",
    "coords": {
      "latitude": 34.033398,
      "longitude": -118.44229
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "CUT",
    "coords": {
      "latitude": 34.067036,
      "longitude": -118.401024
    },
    "number_of_stars": 1,
    "cuisines": [
      "Steakhouse",
      "American"
    ],
    "city": "Beverly Hills"
  },
  {
    "name": "Nozawa Bar",
    "coords": {
      "latitude": 34.0683345,
      "longitude": -118.398404
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Beverly Hills"
  },
  {
    "name": "Maude",
    "coords": {
      "latitude": 34.064346,
      "longitude": -118.39904
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "European Contemporary"
    ],
    "city": "Beverly Hills"
  },
  {
    "name": "n/naka",
    "coords": {
      "latitude": 34.02526,
      "longitude": -118.41206
    },
    "number_of_stars": 2,
    "cuisines": [
      "Japanese",
      "Contemporary"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Sushi Ginza Onodera",
    "coords": {
      "latitude": 34.082251,
      "longitude": -118.3766888
    },
    "number_of_stars": 2,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "West Hollywood"
  },
  {
    "name": "Vespertine",
    "coords": {
      "latitude": 34.024204,
      "longitude": -118.38166
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Culver City"
  },
  {
    "name": "Osteria Mozza",
    "coords": {
      "latitude": 34.0833096,
      "longitude": -118.3387565
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Providence",
    "coords": {
      "latitude": 34.083576,
      "longitude": -118.3301829
    },
    "number_of_stars": 2,
    "cuisines": [
      "Seafood"
    ],
    "city": "Hollywood"
  },
  {
    "name": "Kali",
    "coords": {
      "latitude": 34.0833542,
      "longitude": -118.3244985
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "Hollywood"
  },
  {
    "name": "Le Comptoir",
    "coords": {
      "latitude": 34.0634658,
      "longitude": -118.300451
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian",
      "Vegetarian"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Q Sushi",
    "coords": {
      "latitude": 34.046883,
      "longitude": -118.255844
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Shibumi",
    "coords": {
      "latitude": 34.044155,
      "longitude": -118.256134
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Asian and Western"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Orsa & Winston",
    "coords": {
      "latitude": 34.0484698,
      "longitude": -118.2479493
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Asian"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Hayato",
    "coords": {
      "latitude": 34.0338072,
      "longitude": -118.2418788
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Seafood"
    ],
    "city": "Los Angeles"
  },
  {
    "name": "Bistro Na’s",
    "coords": {
      "latitude": 34.1048803,
      "longitude": -118.0712093
    },
    "number_of_stars": 1,
    "cuisines": [
      "Chinese",
      "Beijing Cuisine"
    ],
    "city": "Temple City"
  },
  {
    "name": "Taco María",
    "coords": {
      "latitude": 33.6949591,
      "longitude": -117.9257477
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mexican",
      "Contemporary"
    ],
    "city": "Costa Mesa"
  },
  {
    "name": "Hana re",
    "coords": {
      "latitude": 33.6778676,
      "longitude": -117.8854377
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Costa Mesa"
  },
  {
    "name": "Addison",
    "coords": {
      "latitude": 32.9412972,
      "longitude": -117.1988908
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "French"
    ],
    "city": "San Diego"
  },
  {
    "name": "Aubergine",
    "coords": {
      "latitude": 36.55406,
      "longitude": -121.924355
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "Carmel-by-the-Sea"
  },
  {
    "name": "Manresa",
    "coords": {
      "latitude": 37.22761,
      "longitude": -121.98071
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "Los Gatos"
  },
  {
    "name": "Plumed Horse",
    "coords": {
      "latitude": 37.2563623,
      "longitude": -122.0352659
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Saratoga"
  },
  {
    "name": "Chez TJ",
    "coords": {
      "latitude": 37.39468,
      "longitude": -122.08044
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "Mountain View"
  },
  {
    "name": "Protégé",
    "coords": {
      "latitude": 37.427853,
      "longitude": -122.14362
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "Palo Alto"
  },
  {
    "name": "Baumé",
    "coords": {
      "latitude": 37.4282482,
      "longitude": -122.1430759
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "French"
    ],
    "city": "Palo Alto"
  },
  {
    "name": "Madera",
    "coords": {
      "latitude": 37.42014,
      "longitude": -122.21151
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "Menlo Park"
  },
  {
    "name": "The Village Pub",
    "coords": {
      "latitude": 37.42897,
      "longitude": -122.25178
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Woodside"
  },
  {
    "name": "Wakuriya",
    "coords": {
      "latitude": 37.52114,
      "longitude": -122.3366
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Contemporary"
    ],
    "city": "San Mateo"
  },
  {
    "name": "Sushi Yoshizumi",
    "coords": {
      "latitude": 37.565075,
      "longitude": -122.3211
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "San Mateo"
  },
  {
    "name": "Rasa",
    "coords": {
      "latitude": 37.5775393,
      "longitude": -122.3459541
    },
    "number_of_stars": 1,
    "cuisines": [
      "Indian",
      "Contemporary"
    ],
    "city": "Burlingame"
  },
  {
    "name": "Commis",
    "coords": {
      "latitude": 37.8246825,
      "longitude": -122.254846
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Oakland"
  },
  {
    "name": "Al's Place",
    "coords": {
      "latitude": 37.748924,
      "longitude": -122.42013
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Lazy Bear",
    "coords": {
      "latitude": 37.760204,
      "longitude": -122.41969
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "Modern Cuisine"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Saison",
    "coords": {
      "latitude": 37.76327,
      "longitude": -122.41543
    },
    "number_of_stars": 2,
    "cuisines": [
      "Californian",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Omakase",
    "coords": {
      "latitude": 37.77077,
      "longitude": -122.40298
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Californios",
    "coords": {
      "latitude": 37.7712406,
      "longitude": -122.4131414
    },
    "number_of_stars": 2,
    "cuisines": [
      "Mexican",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Luce",
    "coords": {
      "latitude": 37.7818638,
      "longitude": -122.404765
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Benu",
    "coords": {
      "latitude": 37.78521,
      "longitude": -122.39876
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "Asian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Birdsong",
    "coords": {
      "latitude": 37.779495,
      "longitude": -122.41048
    },
    "number_of_stars": 1,
    "cuisines": [
      "American",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "In Situ",
    "coords": {
      "latitude": 37.785633,
      "longitude": -122.40113
    },
    "number_of_stars": 1,
    "cuisines": [
      "International",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Mourad",
    "coords": {
      "latitude": 37.78695,
      "longitude": -122.39987
    },
    "number_of_stars": 1,
    "cuisines": [
      "Moroccan",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Hashiri",
    "coords": {
      "latitude": 37.783062,
      "longitude": -122.40754
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Rich Table",
    "coords": {
      "latitude": 37.7749011,
      "longitude": -122.4227597
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Angler SF",
    "coords": {
      "latitude": 37.793167,
      "longitude": -122.39213
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Seafood"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Kin Khao",
    "coords": {
      "latitude": 37.785267,
      "longitude": -122.40951
    },
    "number_of_stars": 1,
    "cuisines": [
      "Thai",
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Campton Place",
    "coords": {
      "latitude": 37.78923,
      "longitude": -122.40665
    },
    "number_of_stars": 2,
    "cuisines": [
      "Indian",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Michael Mina",
    "coords": {
      "latitude": 37.7932858,
      "longitude": -122.3994148
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Middle Eastern"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Sons & Daughters",
    "coords": {
      "latitude": 37.7902661,
      "longitude": -122.4091443
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Mister Jiu’s",
    "coords": {
      "latitude": 37.79371,
      "longitude": -122.406654
    },
    "number_of_stars": 1,
    "cuisines": [
      "Chinese",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "jū-ni",
    "coords": {
      "latitude": 37.77672,
      "longitude": -122.43886
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Quince",
    "coords": {
      "latitude": 37.79762,
      "longitude": -122.40337
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Coi",
    "coords": {
      "latitude": 37.7981895,
      "longitude": -122.4033677
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Keiko à Nob Hill",
    "coords": {
      "latitude": 37.7931221,
      "longitude": -122.4143298
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "French"
    ],
    "city": "San Francisco"
  },
  {
    "name": "The Progress",
    "coords": {
      "latitude": 37.78371,
      "longitude": -122.43282
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "State Bird Provisions",
    "coords": {
      "latitude": 37.783737,
      "longitude": -122.43283
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Octavia",
    "coords": {
      "latitude": 37.7880138,
      "longitude": -122.4270235
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Acquerello",
    "coords": {
      "latitude": 37.79167,
      "longitude": -122.42131
    },
    "number_of_stars": 2,
    "cuisines": [
      "Italian",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "SPQR",
    "coords": {
      "latitude": 37.7873703,
      "longitude": -122.4336712
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Lord Stanley",
    "coords": {
      "latitude": 37.79592,
      "longitude": -122.42208
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Sorrel",
    "coords": {
      "latitude": 37.788334,
      "longitude": -122.44614
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian",
      "Italian"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Spruce",
    "coords": {
      "latitude": 37.78772,
      "longitude": -122.45264
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian",
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Wako",
    "coords": {
      "latitude": 37.7830681,
      "longitude": -122.4615303
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Gary Danko",
    "coords": {
      "latitude": 37.8058115,
      "longitude": -122.4206863
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Atelier Crenn",
    "coords": {
      "latitude": 37.79835,
      "longitude": -122.43586
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "French"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Bar Crenn",
    "coords": {
      "latitude": 37.798435,
      "longitude": -122.43581
    },
    "number_of_stars": 1,
    "cuisines": [
      "French",
      "Classic French"
    ],
    "city": "San Francisco"
  },
  {
    "name": "Madcap",
    "coords": {
      "latitude": 37.974712,
      "longitude": -122.56168
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Japanese Contemporary"
    ],
    "city": "San Anselmo"
  },
  {
    "name": "The Kitchen",
    "coords": {
      "latitude": 38.5890509,
      "longitude": -121.414234
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "Sacramento"
  },
  {
    "name": "Kenzo",
    "coords": {
      "latitude": 38.29924,
      "longitude": -122.28928
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese"
    ],
    "city": "Napa"
  },
  {
    "name": "La Toque",
    "coords": {
      "latitude": 38.30351,
      "longitude": -122.28349
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Napa"
  },
  {
    "name": "Bouchon",
    "coords": {
      "latitude": 38.40258,
      "longitude": -122.3619
    },
    "number_of_stars": 1,
    "cuisines": [
      "French"
    ],
    "city": "Yountville"
  },
  {
    "name": "The French Laundry",
    "coords": {
      "latitude": 38.40443,
      "longitude": -122.36474
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "French"
    ],
    "city": "Yountville"
  },
  {
    "name": "Auberge du Soleil",
    "coords": {
      "latitude": 38.49199,
      "longitude": -122.40534
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "Rutherford"
  },
  {
    "name": "Farmhouse Inn & Restaurant",
    "coords": {
      "latitude": 38.49039,
      "longitude": -122.8835
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian"
    ],
    "city": "Forestville"
  },
  {
    "name": "SingleThread",
    "coords": {
      "latitude": 38.6122599,
      "longitude": -122.8697229
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "Californian"
    ],
    "city": "Healdsburg"
  },
  {
    "name": "Madrona Manor",
    "coords": {
      "latitude": 38.60428,
      "longitude": -122.88647
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Healdsburg"
  },
  {
    "name": "Harbor House",
    "coords": {
      "latitude": 39.135876,
      "longitude": -123.719444
    },
    "number_of_stars": 1,
    "cuisines": [
      "Californian",
      "Creative"
    ],
    "city": "Elk"
  },
  {
    "name": "Parachute",
    "coords": {
      "latitude": 41.94483,
      "longitude": -87.70638
    },
    "number_of_stars": 1,
    "cuisines": [
      "Korean",
      "Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "EL Ideas",
    "coords": {
      "latitude": 41.863,
      "longitude": -87.68686
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Creative"
    ],
    "city": "Chicago"
  },
  {
    "name": "Goosefoot",
    "coords": {
      "latitude": 41.9687073,
      "longitude": -87.6959706
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "French Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Elizabeth",
    "coords": {
      "latitude": 41.969555,
      "longitude": -87.688736
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Porto",
    "coords": {
      "latitude": 41.896121,
      "longitude": -87.6674488
    },
    "number_of_stars": 1,
    "cuisines": [
      "Portuguese",
      "Seafood"
    ],
    "city": "Chicago"
  },
  {
    "name": "Temporis",
    "coords": {
      "latitude": 41.898907,
      "longitude": -87.66725
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Modern Cuisine"
    ],
    "city": "Chicago"
  },
  {
    "name": "Schwa",
    "coords": {
      "latitude": 41.9087844,
      "longitude": -87.667733
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Innovative"
    ],
    "city": "Chicago"
  },
  {
    "name": "Ever",
    "coords": {
      "latitude": 41.8866988,
      "longitude": -87.6613997
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "Modern Cuisine"
    ],
    "city": "Chicago"
  },
  {
    "name": "Elske",
    "coords": {
      "latitude": 41.8843534,
      "longitude": -87.6608602
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Smyth",
    "coords": {
      "latitude": 41.8850391,
      "longitude": -87.6609432
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "Modern Cuisine"
    ],
    "city": "Chicago"
  },
  {
    "name": "Next",
    "coords": {
      "latitude": 41.8866924,
      "longitude": -87.6518812
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Innovative"
    ],
    "city": "Chicago"
  },
  {
    "name": "Mako",
    "coords": {
      "latitude": 41.8857746,
      "longitude": -87.6468966
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Chicago"
  },
  {
    "name": "Oriole",
    "coords": {
      "latitude": 41.886196,
      "longitude": -87.64513
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Omakase Yume",
    "coords": {
      "latitude": 41.8832751,
      "longitude": -87.6446106
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Chicago"
  },
  {
    "name": "Boka",
    "coords": {
      "latitude": 41.9135974,
      "longitude": -87.6482441
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Mediterranean Cuisine"
    ],
    "city": "Chicago"
  },
  {
    "name": "Alinea",
    "coords": {
      "latitude": 41.9132737,
      "longitude": -87.648174
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "Creative"
    ],
    "city": "Chicago"
  },
  {
    "name": "Sepia",
    "coords": {
      "latitude": 41.88394,
      "longitude": -87.64247
    },
    "number_of_stars": 1,
    "cuisines": [
      "American",
      "American Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Entente",
    "coords": {
      "latitude": 41.8952479,
      "longitude": -87.6386755
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Moody Tongue",
    "coords": {
      "latitude": 41.8469648,
      "longitude": -87.6252282
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Topolobampo",
    "coords": {
      "latitude": 41.8907039,
      "longitude": -87.6309689
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mexican",
      "Regional Cuisine"
    ],
    "city": "Chicago"
  },
  {
    "name": "North Pond",
    "coords": {
      "latitude": 41.9301645,
      "longitude": -87.6362118
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "Chicago"
  },
  {
    "name": "Acadia",
    "coords": {
      "latitude": 41.8590796,
      "longitude": -87.6252463
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "Chicago"
  },
  {
    "name": "Spiaggia",
    "coords": {
      "latitude": 41.9007995,
      "longitude": -87.6242897
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Modern Cuisine"
    ],
    "city": "Chicago"
  },
  {
    "name": "The Inn at Little Washington",
    "coords": {
      "latitude": 38.7134767,
      "longitude": -78.1595348
    },
    "number_of_stars": 3,
    "cuisines": [
      "American",
      "French"
    ],
    "city": "Washington"
  },
  {
    "name": "Xiquet",
    "coords": {
      "latitude": 38.9215871,
      "longitude": -77.0723834
    },
    "number_of_stars": 1,
    "cuisines": [
      "Spanish"
    ],
    "city": "Washington"
  },
  {
    "name": "Tail Up Goat",
    "coords": {
      "latitude": 38.9231748,
      "longitude": -77.0427557
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Komi",
    "coords": {
      "latitude": 38.910107,
      "longitude": -77.03836
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mediterranean Cuisine"
    ],
    "city": "Washington"
  },
  {
    "name": "Sushi Taro",
    "coords": {
      "latitude": 38.909992,
      "longitude": -77.03834
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Seasonal Cuisine"
    ],
    "city": "Washington"
  },
  {
    "name": "Plume",
    "coords": {
      "latitude": 38.9058775,
      "longitude": -77.0367714
    },
    "number_of_stars": 1,
    "cuisines": [
      "European",
      "French"
    ],
    "city": "Washington"
  },
  {
    "name": "Rooster & Owl",
    "coords": {
      "latitude": 38.9214669,
      "longitude": -77.0321599
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Fusion"
    ],
    "city": "Washington"
  },
  {
    "name": "Jônt",
    "coords": {
      "latitude": 38.9158847,
      "longitude": -77.0321498
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Bresca",
    "coords": {
      "latitude": 38.91584,
      "longitude": -77.0321
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "Washington"
  },
  {
    "name": "Maydān",
    "coords": {
      "latitude": 38.92013,
      "longitude": -77.03105
    },
    "number_of_stars": 1,
    "cuisines": [
      "Middle Eastern",
      "Grills"
    ],
    "city": "Washington"
  },
  {
    "name": "Sushi Nakazawa",
    "coords": {
      "latitude": 38.89466,
      "longitude": -77.02701
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "Washington"
  },
  {
    "name": "The Dabney",
    "coords": {
      "latitude": 38.9062921,
      "longitude": -77.0245936
    },
    "number_of_stars": 1,
    "cuisines": [
      "American"
    ],
    "city": "Washington"
  },
  {
    "name": "Cranes",
    "coords": {
      "latitude": 38.8991984,
      "longitude": -77.0244107
    },
    "number_of_stars": 1,
    "cuisines": [
      "Spanish",
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "minibar",
    "coords": {
      "latitude": 38.896294,
      "longitude": -77.02386
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Métier",
    "coords": {
      "latitude": 38.903503,
      "longitude": -77.0218
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Modern French"
    ],
    "city": "Washington"
  },
  {
    "name": "Kinship",
    "coords": {
      "latitude": 38.903282,
      "longitude": -77.0218
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "French Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Fiola",
    "coords": {
      "latitude": 38.89283,
      "longitude": -77.01991
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Elcielo D.C.",
    "coords": {
      "latitude": 38.9090145,
      "longitude": -76.9994792
    },
    "number_of_stars": 1,
    "cuisines": [
      "Colombian",
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Masseria",
    "coords": {
      "latitude": 38.909504,
      "longitude": -76.99908
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Regional Cuisine"
    ],
    "city": "Washington"
  },
  {
    "name": "Pineapple and Pearls",
    "coords": {
      "latitude": 38.880707,
      "longitude": -76.99514
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Rose’s Luxury",
    "coords": {
      "latitude": 38.8806478,
      "longitude": -76.9950588
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Little Pearl",
    "coords": {
      "latitude": 38.8833557,
      "longitude": -76.9936368
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "Washington"
  },
  {
    "name": "Gravitas",
    "coords": {
      "latitude": 38.9146396,
      "longitude": -76.9845997
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "Washington"
  },
  {
    "name": "L’Appart",
    "coords": {
      "latitude": 40.7121897,
      "longitude": -74.0155187
    },
    "number_of_stars": 1,
    "cuisines": [
      "French",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "L'Atelier de Joël Robuchon",
    "coords": {
      "latitude": 40.7428946,
      "longitude": -74.0077138
    },
    "number_of_stars": 2,
    "cuisines": [
      "French"
    ],
    "city": "New York"
  },
  {
    "name": "Wallsé",
    "coords": {
      "latitude": 40.7354574,
      "longitude": -74.0081949
    },
    "number_of_stars": 1,
    "cuisines": [
      "Austrian",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Jungsik",
    "coords": {
      "latitude": 40.718685,
      "longitude": -74.00911
    },
    "number_of_stars": 2,
    "cuisines": [
      "Korean",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Jeju Noodle Bar",
    "coords": {
      "latitude": 40.732952,
      "longitude": -74.00744
    },
    "number_of_stars": 1,
    "cuisines": [
      "Korean"
    ],
    "city": "New York"
  },
  {
    "name": "Crown Shy",
    "coords": {
      "latitude": 40.7067068,
      "longitude": -74.0087206
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "New York"
  },
  {
    "name": "Vestry",
    "coords": {
      "latitude": 40.7256137,
      "longitude": -74.0055581
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Modern Cuisine"
    ],
    "city": "New York"
  },
  {
    "name": "Sushi Nakazawa",
    "coords": {
      "latitude": 40.731716,
      "longitude": -74.00451
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Bâtard",
    "coords": {
      "latitude": 40.719616,
      "longitude": -74.00589
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Atera",
    "coords": {
      "latitude": 40.7168498,
      "longitude": -74.0055912
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Don Angie",
    "coords": {
      "latitude": 40.7377741,
      "longitude": -74.0019745
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "American"
    ],
    "city": "New York"
  },
  {
    "name": "Hirohisa",
    "coords": {
      "latitude": 40.72452,
      "longitude": -74.003006
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Classic Cuisine"
    ],
    "city": "New York"
  },
  {
    "name": "Kosaka",
    "coords": {
      "latitude": 40.738316,
      "longitude": -74.00137
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "ZZ’s Clam Bar",
    "coords": {
      "latitude": 40.727646,
      "longitude": -74.00046
    },
    "number_of_stars": 1,
    "cuisines": [
      "Seafood"
    ],
    "city": "New York"
  },
  {
    "name": "Carbone",
    "coords": {
      "latitude": 40.727966,
      "longitude": -74.00017
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Italian-American"
    ],
    "city": "New York"
  },
  {
    "name": "Blue Hill",
    "coords": {
      "latitude": 40.7319711,
      "longitude": -73.9996385
    },
    "number_of_stars": 1,
    "cuisines": [
      "American"
    ],
    "city": "New York"
  },
  {
    "name": "Chef's Table at Brooklyn Fare",
    "coords": {
      "latitude": 40.7560823,
      "longitude": -73.9964997
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Le Coucou",
    "coords": {
      "latitude": 40.719162,
      "longitude": -74.00001
    },
    "number_of_stars": 1,
    "cuisines": [
      "French",
      "Classic French"
    ],
    "city": "New York"
  },
  {
    "name": "Kochi",
    "coords": {
      "latitude": 40.7620076,
      "longitude": -73.993568
    },
    "number_of_stars": 1,
    "cuisines": [
      "Korean",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "odo",
    "coords": {
      "latitude": 40.7407048,
      "longitude": -73.9929904
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Estela",
    "coords": {
      "latitude": 40.72471,
      "longitude": -73.9948
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "New York"
  },
  {
    "name": "The Musket Room",
    "coords": {
      "latitude": 40.723915,
      "longitude": -73.99375
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Cote",
    "coords": {
      "latitude": 40.7414233,
      "longitude": -73.9914627
    },
    "number_of_stars": 1,
    "cuisines": [
      "Korean",
      "Steakhouse"
    ],
    "city": "New York"
  },
  {
    "name": "The River Café",
    "coords": {
      "latitude": 40.7034279,
      "longitude": -73.9942984
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Ko",
    "coords": {
      "latitude": 40.7246476,
      "longitude": -73.9916056
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Rezdôra",
    "coords": {
      "latitude": 40.7390046,
      "longitude": -73.9890088
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Emilian"
    ],
    "city": "New York"
  },
  {
    "name": "Gramercy Tavern",
    "coords": {
      "latitude": 40.7387578,
      "longitude": -73.988991
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American"
    ],
    "city": "New York"
  },
  {
    "name": "Noda",
    "coords": {
      "latitude": 40.74497,
      "longitude": -73.988075
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Ichimura at Uchū",
    "coords": {
      "latitude": 40.721832,
      "longitude": -73.99012
    },
    "number_of_stars": 2,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Benno",
    "coords": {
      "latitude": 40.7439284,
      "longitude": -73.9872554
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian",
      "Regional Cuisine"
    ],
    "city": "New York"
  },
  {
    "name": "The Clocktower",
    "coords": {
      "latitude": 40.7413666,
      "longitude": -73.9875324
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "English"
    ],
    "city": "New York"
  },
  {
    "name": "Jua",
    "coords": {
      "latitude": 40.740014,
      "longitude": -73.9874479
    },
    "number_of_stars": 1,
    "cuisines": [
      "Korean",
      "Korean Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Eleven Madison Park",
    "coords": {
      "latitude": 40.7415543,
      "longitude": -73.9872414
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "Innovative"
    ],
    "city": "New York"
  },
  {
    "name": "Contra",
    "coords": {
      "latitude": 40.719917,
      "longitude": -73.98922
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Casa Mono",
    "coords": {
      "latitude": 40.735895,
      "longitude": -73.9873421
    },
    "number_of_stars": 1,
    "cuisines": [
      "Spanish",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Per Se",
    "coords": {
      "latitude": 40.7680545,
      "longitude": -73.9825882
    },
    "number_of_stars": 3,
    "cuisines": [
      "Contemporary",
      "French"
    ],
    "city": "New York"
  },
  {
    "name": "Masa",
    "coords": {
      "latitude": 40.76819,
      "longitude": -73.98234
    },
    "number_of_stars": 3,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Kanoyama",
    "coords": {
      "latitude": 40.7306576,
      "longitude": -73.9864662
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Jean-Georges",
    "coords": {
      "latitude": 40.76907,
      "longitude": -73.98155
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "French Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Le Bernardin",
    "coords": {
      "latitude": 40.76177,
      "longitude": -73.98223
    },
    "number_of_stars": 3,
    "cuisines": [
      "Seafood"
    ],
    "city": "New York"
  },
  {
    "name": "Ai Fiori",
    "coords": {
      "latitude": 40.75013,
      "longitude": -73.98357
    },
    "number_of_stars": 1,
    "cuisines": [
      "Italian"
    ],
    "city": "New York"
  },
  {
    "name": "Marea",
    "coords": {
      "latitude": 40.767619,
      "longitude": -73.9810681
    },
    "number_of_stars": 1,
    "cuisines": [
      "Seafood",
      "Italian"
    ],
    "city": "New York"
  },
  {
    "name": "Tsukimi",
    "coords": {
      "latitude": 40.7290162,
      "longitude": -73.9852509
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Seasonal Cuisine"
    ],
    "city": "New York"
  },
  {
    "name": "Gabriel Kreuther",
    "coords": {
      "latitude": 40.75397,
      "longitude": -73.982025
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary",
      "Alsatian"
    ],
    "city": "New York"
  },
  {
    "name": "Atomix",
    "coords": {
      "latitude": 40.7443058,
      "longitude": -73.9826751
    },
    "number_of_stars": 2,
    "cuisines": [
      "Korean",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Sushi Ginza Onodera",
    "coords": {
      "latitude": 40.752396,
      "longitude": -73.981575
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Tuome",
    "coords": {
      "latitude": 40.724194,
      "longitude": -73.9828
    },
    "number_of_stars": 1,
    "cuisines": [
      "Fusion"
    ],
    "city": "New York"
  },
  {
    "name": "Kajitsu",
    "coords": {
      "latitude": 40.7499602,
      "longitude": -73.9781131
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Vegan"
    ],
    "city": "New York"
  },
  {
    "name": "Claro",
    "coords": {
      "latitude": 40.677395,
      "longitude": -73.98615
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mexican"
    ],
    "city": "New York"
  },
  {
    "name": "The Modern",
    "coords": {
      "latitude": 40.76106,
      "longitude": -73.97628
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Caviar Russe",
    "coords": {
      "latitude": 40.760685,
      "longitude": -73.97355
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Seafood"
    ],
    "city": "New York"
  },
  {
    "name": "Tempura Matsui",
    "coords": {
      "latitude": 40.7483542,
      "longitude": -73.9748599
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Tempura"
    ],
    "city": "New York"
  },
  {
    "name": "Sushi Yasuda",
    "coords": {
      "latitude": 40.75108,
      "longitude": -73.97364
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Aquavit",
    "coords": {
      "latitude": 40.76078,
      "longitude": -73.97214
    },
    "number_of_stars": 2,
    "cuisines": [
      "Scandinavian",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Le Jardinier",
    "coords": {
      "latitude": 40.7579445,
      "longitude": -73.9714729
    },
    "number_of_stars": 1,
    "cuisines": [
      "French",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Sushi Amane",
    "coords": {
      "latitude": 40.7514424,
      "longitude": -73.9717128
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Daniel",
    "coords": {
      "latitude": 40.7667521,
      "longitude": -73.9675039
    },
    "number_of_stars": 2,
    "cuisines": [
      "French"
    ],
    "city": "New York"
  },
  {
    "name": "Aska",
    "coords": {
      "latitude": 40.7125069,
      "longitude": -73.9669769
    },
    "number_of_stars": 2,
    "cuisines": [
      "Scandinavian",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Sushi Noz",
    "coords": {
      "latitude": 40.77384,
      "longitude": -73.958275
    },
    "number_of_stars": 1,
    "cuisines": [
      "Japanese",
      "Sushi"
    ],
    "city": "New York"
  },
  {
    "name": "Francie",
    "coords": {
      "latitude": 40.7103459,
      "longitude": -73.9637588
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "Italian"
    ],
    "city": "New York"
  },
  {
    "name": "Meadowsweet",
    "coords": {
      "latitude": 40.710354,
      "longitude": -73.96317
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mediterranean Cuisine",
      "American Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Peter Luger",
    "coords": {
      "latitude": 40.709889,
      "longitude": -73.9625494
    },
    "number_of_stars": 1,
    "cuisines": [
      "Steakhouse",
      "American"
    ],
    "city": "New York"
  },
  {
    "name": "Oxalis",
    "coords": {
      "latitude": 40.6729122,
      "longitude": -73.9627166
    },
    "number_of_stars": 1,
    "cuisines": [
      "Contemporary",
      "American Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Casa Enrique",
    "coords": {
      "latitude": 40.7434588,
      "longitude": -73.9542808
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mexican",
      "Regional Cuisine"
    ],
    "city": "New York"
  },
  {
    "name": "Oxomoco",
    "coords": {
      "latitude": 40.7300224,
      "longitude": -73.9555039
    },
    "number_of_stars": 1,
    "cuisines": [
      "Mexican",
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "The Four Horsemen",
    "coords": {
      "latitude": 40.7129264,
      "longitude": -73.9574999
    },
    "number_of_stars": 1,
    "cuisines": [
      "American",
      "Californian"
    ],
    "city": "New York"
  },
  {
    "name": "Blanca",
    "coords": {
      "latitude": 40.7049906,
      "longitude": -73.9336873
    },
    "number_of_stars": 2,
    "cuisines": [
      "Contemporary"
    ],
    "city": "New York"
  },
  {
    "name": "Blue Hill at Stone Barns",
    "coords": {
      "latitude": 41.1007146,
      "longitude": -73.8292966
    },
    "number_of_stars": 2,
    "cuisines": [
      "American",
      "Contemporary"
    ],
    "city": "Tarrytown"
  }
];

window.onload = () => {
    document.querySelector('.search-btn').addEventListener('click', initLocationSearch);
}

function formattedDistanceInMiles(coord1, coord2) {
    return distance(coord1, coord2).toFixed(2) + ' miles';
}

function haversineDistanceIn(lat1, lon1, lat2, lon2) {
	const R = 6371e3; // metres
	const φ1 = lat1 * Math.PI/180; // φ, λ in radians
	const φ2 = lat2 * Math.PI/180;
	const Δφ = (lat2-lat1) * Math.PI/180;
	const Δλ = (lon2-lon1) * Math.PI/180;
	const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ/2) * Math.sin(Δλ/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	const d = R * c; // in metres
	return d / 1609.34;
}

window.twttr = function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
};

function initFacebookButton(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
  fjs.parentNode.insertBefore(js, fjs);
};

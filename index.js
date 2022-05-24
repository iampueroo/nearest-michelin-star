let leafletMap;
let homeMarker;
let layerGroup;

async function getClientGeolocation() {
    if (!navigator.geolocation) {
        return null;
    }
    return new Promise((success, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => {
                return success(position.coords);
            },
            (error) => {
                return reject(error)
            }
        );
    });
};

function updateViewWithLocation(coordinates) {
    console.log('updating view');
    const locations = getSortedAsList(coordinates, window.locationData).slice(0, 10);
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

async function initLocationSearch() {
    const errorMsg = document.querySelector('.location-error');
    const button = document.querySelector('.search-btn');
    button.classList.add('is-loading');
    let coordinates;
    try {
        errorMsg.classList.add('is-hidden');
        coordinates = await getClientGeolocation();
    } catch (e) {
        let msg;
        switch (e?.code) {
            case 1:
                msg = 'Please allow location access to use this app!';
                break;
            case 2:
                msg = 'Something went wrong fetching your position. Please try again later.';
                break;
            default:
                msg = 'Something went wrong fetching your position. Please try again later.';
                break;
        }
        errorMsg.querySelector('.msg').textContent = msg;
        errorMsg.classList.remove('is-hidden');
        return
    }
    if (!coordinates) {
        button.classList.remove('is-loading');
        return;
    }
    button.remove();
    button.classList.remove('is-loading');
    updateViewWithLocation(coordinates);
}

function buildMap() {

}


function renderMap(coordinates) {
    const homeCoordinates = [coordinates.latitude, coordinates.longitude];
    if (!leafletMap) {
        leafletMap = L.map('mapid', {
            boxZoom: false,

        }).setView(homeCoordinates, 18);
        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        ).addTo(leafletMap);
        layerGroup = L.layerGroup().addTo(leafletMap);
        homeMarker = L.marker(homeCoordinates);
        homeMarker.addTo(layerGroup).bindPopup('Your location').openPopup();
        leafletMap.on('click', function(e) {
            const coords = {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
            }
            updateViewWithLocation(coords);
        });
    } else {
        layerGroup.clearLayers();
        homeMarker = L.marker(homeCoordinates);
        homeMarker.addTo(layerGroup).bindPopup('Your location').openPopup();
    }
    return leafletMap;
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
        marker.addTo(layerGroup);
    });
    locationMarkers.push(L.marker([centercoords.latitude, centercoords.longitude]));
    const group = new L.featureGroup(locationMarkers);
    map.on('zoomend', () => {
        locationMarkers[0].openPopup();
    });
    map.flyToBounds(
        group.getBounds(), {
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

window.onload = () => {
    document.querySelector('.search-btn').addEventListener('click', initLocationSearch);
}

function formattedDistanceInMiles(coord1, coord2) {
    const locale = navigator?.language;
    const distanceInMiles = distance(coord1, coord2);
    if (!locale || locale === 'en-US') {
        return distanceInMiles.toFixed(2) + ' miles';
    }
    return (distanceInMiles * 1.609).toFixed(2) + ' km';
}

function haversineDistanceIn(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
    fjs.parentNode.insertBefore(js, fjs);
};
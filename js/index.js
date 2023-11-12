const getRoutes = async () => {
  currentFuelInCar = document.getElementById('current-gas-input').value;
  mpgOfCar = document.getElementById('mpg-input').value;
  maximumCapacityOfCar = document.getElementById('fuel-capacity-input').value;

  const response = await fetch(`http://127.0.0.1:5000/routes?currentFuelInCar=${currentFuelInCar}&mpgOfCar=${mpgOfCar}&maximumCapacityOfCar=${maximumCapacityOfCar}`);
  const data = await response.json();
  console.log(data);
  return data;
}

async function initMap() {

  let routesData = await getRoutes();

  // // Hardcoded data
  // const routesData = [
  //   { "coordinates": [-122.4518675, 37.7458093], "distance": 0.5, "gallonsConsumed": 4.0, "route": "37871140", "totalCost": 51.24495 },
  //   { "coordinates": [-122.4354246, 37.7629642], "distance": 0.5, "gallonsConsumed": 4.0, "route": "37871143", "totalCost": 52.249950000000005 },
  //   { "coordinates": [-122.464514, 37.765748], "distance": 0.5, "gallonsConsumed": 4.0, "route": "37871142", "totalCost": 52.85295000000001 }
  // ];

  // Assume a common start and end point for all routes
  const start = { lat: 37.7241, lng: -122.4799 }; // San Francisco city center
  const end = { lat: 37.8086, lng: -122.4125 }; // Oakland city center

  // Initialize the map using the first stop's coordinates
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: start
  });

  createMarker(map, start, 'S');
  createMarker(map, start, routesData);

  // Create and display routes and markers for each gas station
  routesData.forEach((routeData, index) => {
    const stop = { lat: routeData.coordinates[1], lng: routeData.coordinates[0] };

    const label = `G${index + 1}`; // Labels: G1, G2, G3
    const color = ['green', 'orange', 'blue'][index % 3]; // Alternate colors for each route

    displayRouteAndMarkers(map, start, stop, end, routeData.totalCost, routeData.gallonsConsumed, label, color);
  });
}

function createMarker(map, position, label) {
  new google.maps.Marker({
    position,
    map,
    label,
    title: label // Adding a title for hover text can be helpful for debugging
  });
}

function displayRouteAndMarkers(map, start, stop, end, totalCost, gallonsConsumed, label, color) {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 6
    },
    suppressMarkers: true // Hide default A and B markers
  });

  directionsRenderer.setMap(map);

  directionsService.route({
    origin: start,
    destination: end,
    waypoints: [{ location: stop }],
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
      const midpoint = getRouteMidpoint(response.routes[0].overview_path);

      // Display info windows
      displayInfoWindow(map, midpoint, `<div style="color: purple;">Expense: $${totalCost.toFixed(2)}</div>`);
      displayInfoWindow(map, stop, `<div style="color: red;">CO2 Emissions: ${calculateCO2Emissions(gallonsConsumed).toFixed(2)} kg</div>`);

      // Add custom markers
      createMarker(map, start, 'S');
      createMarker(map, stop, label);
      createMarker(map, end, 'D');
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

// Helper functions


function calculateCO2Emissions(gallons) {
  const CO2PerGallon = 8.887; // CO2 emissions in kilograms per gallon of gasoline
  return gallons * CO2PerGallon;
}

function getRouteMidpoint(path) {
  const middleIdx = Math.floor(path.length / 2);
  return path[middleIdx];
}
function displayInfoWindow(map, position, content) {
  const infoWindow = new google.maps.InfoWindow({
    content: content,
    position: position
  });
  infoWindow.open(map);
}

window.onload = initMap;
// Initialize the map with custom options
const map = L.map('map', {
  attributionControl: false // Disable default attribution control
}).setView([0, 0], 13);

// Add OpenStreetMap tiles without attribution
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '' // Set empty attribution
}).addTo(map);

// Create a marker with a popup
const marker = L.marker([0, 0]).addTo(map)
  .bindPopup('Locating...')
  .openPopup();

// Function to update the map and marker position
function updatePosition(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  // Fetch the city and locality name using reverse geocoding
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then(response => response.json())
    .then(data => {
      const city = data.address.city || data.address.town || data.address.village || 'Unknown';
      const locality = data.address.neighbourhood || data.address.suburb || data.address.village || 'Unknown';
      marker.setLatLng([lat, lng])
        .setPopupContent(`You are in ${city}`)
        .openPopup();
      map.setView([lat, lng], 13);
      
      // Update popup content based on zoom level
      map.on('zoomend', () => {
        const zoomLevel = map.getZoom();
        if (zoomLevel >= 15) {
          marker.setPopupContent(`You are in ${locality}`)
            .openPopup();
        } else {
          marker.setPopupContent(`You are in ${city}`)
            .openPopup();
        }
      });
    })
    .catch(error => console.error('Error fetching location name:', error));
}

// Error handling
function handleError(error) {
  console.error('Geolocation error:', error);
}

// Options for geolocation
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// Watch the user's position
if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(updatePosition, handleError, options);
} else {
  alert('Geolocation is not supported by your browser.');
}

// Event listener for marker click to zoom into current location
marker.on('click', () => {
  map.setView(marker.getLatLng(), 18); // Zoom level 18 for a closer view
});

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define a function to create custom icons based on weather condition
const createCustomIcon = (iconUrl) => {
  return new L.Icon({
    iconUrl,
    iconSize: [40, 40], // Size of the icon
    iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
  });
};

const MapView = ({ routeCoordinates, weatherData }) => {
  useEffect(() => {
    console.log('Route Coordinates:', routeCoordinates);
    console.log('Weather Data:', weatherData);
  }, [routeCoordinates, weatherData]);

  // Set the initial center of the map to the first coordinate of the route
  const initialPosition = routeCoordinates.length ? [routeCoordinates[0][1], routeCoordinates[0][0]] : [32.7266, 74.8794];

  return (
    <MapContainer center={initialPosition} zoom={7} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates.map(coord => [coord[1], coord[0]])} color="blue" />
      )}
      {weatherData.map((point, index) => {
        // Define the icon URL based on weather condition or use OpenWeatherMap icons
        const iconUrl = `https://openweathermap.org/img/wn/${point.icon}.png`;
        const customIcon = createCustomIcon(iconUrl);

        return (
          <Marker key={index} position={[point.lat, point.lon]} icon={customIcon}>
            <Popup>
              <strong>{point.location}</strong><br />
              {point.description}, {point.temperature}°C<br />
              Humidity: {point.humidity}%<br />
              Wind Speed: {point.windSpeed} m/s
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;

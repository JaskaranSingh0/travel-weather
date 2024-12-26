import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import pinIcon from '../aasets/pin.png';



// Custom icon definition
const customIcon = L.icon({
  iconUrl: pinIcon, // Path to the custom icon in the public directory
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon corresponding to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41], // Optional: size of the shadow
  shadowAnchor: [12, 41] // Optional: point of the shadow corresponding to marker's location
});

const MapView = ({ routeCoordinates, weatherData }) => {
  const initialPosition = routeCoordinates.length
    ? [routeCoordinates[0][1], routeCoordinates[0][0]]
    : [32.7266, 74.8794]; // Default center position

  return (
    <MapContainer center={initialPosition} zoom={10} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates.map(coord => [coord[1], coord[0]])} color="blue" />
      )}
      {weatherData &&
        weatherData.map((point, index) => (
          <Marker key={index} position={[point.lat, point.lon]} icon={customIcon}>
            <Popup>
              <strong>{point.location}</strong>
              <br />
              {point.description}, {point.temperature}°C
              <br />
              Humidity: {point.humidity}%
              <br />
              Wind Speed: {point.windSpeed} m/s
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapView;

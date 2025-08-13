import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import pinIcon from '../assets/pin.png';

// Fix for default markers in React-Leaflet
try {
  delete L.Icon.Default.prototype._getIconUrl; // guard in case already deleted
} catch (e) {}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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
  const validRouteCoords = Array.isArray(routeCoordinates) ? routeCoordinates.filter(c => Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1])) : [];
  const initialPosition = validRouteCoords.length
    ? [validRouteCoords[0][1], validRouteCoords[0][0]]
    : [32.7266, 74.8794]; // Default center position

  // Create a unique key for the map to force re-render when route changes
  const mapKey = validRouteCoords.length > 0 
    ? `${validRouteCoords[0][0]}-${validRouteCoords[0][1]}-${validRouteCoords[validRouteCoords.length-1][0]}-${validRouteCoords[validRouteCoords.length-1][1]}-${validRouteCoords.length}`
    : 'default';

  return (
    <MapContainer 
      key={mapKey}
      center={initialPosition} 
      zoom={10} 
      style={{ height: 'calc(100vh - 150px)', width: '100%' }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validRouteCoords.length > 0 && (
        <Polyline positions={validRouteCoords.map(coord => [coord[1], coord[0]])} color="blue" />
      )}
      {Array.isArray(weatherData) && weatherData.map((point, index) => {
        if (isNaN(point.lat) || isNaN(point.lon)) return null;
        return (
          <Marker key={`${point.lat}-${point.lon}-${index}`} position={[point.lat, point.lon]} icon={customIcon}>
            <Popup>
              <strong>{point.location}</strong>
              <br />
              {point.description}, {Math.round(point.temperature)}°C
              <br />
              Humidity: {point.humidity}%
              <br />
              Wind Speed: {point.windSpeed} m/s
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;

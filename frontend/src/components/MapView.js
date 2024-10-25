import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ routeCoordinates, weatherData }) => {
  const initialPosition = routeCoordinates.length ? [routeCoordinates[0][1], routeCoordinates[0][0]] : [32.7266, 74.8794];

  return (
    <MapContainer center={initialPosition} zoom={10} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates.map(coord => [coord[1], coord[0]])} color="blue" />
      )}
      {weatherData.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lon]}>
          <Popup>
            <strong>{point.location}</strong><br />
            {point.description}, {point.temperature}°C<br />
            Humidity: {point.humidity}%<br />
            Wind Speed: {point.windSpeed} m/s
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;

import React, { useState } from 'react';
import axios from 'axios';
import RouteForm from './components/RouteForm';
import WeatherInfo from './components/WeatherInfo';
import MapView from './components/MapView';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const fetchWeatherData = async (startLocation, endLocation) => {
    try {
      // Fetch coordinates for the start location
      const startResponse = await axios.get(`http://localhost:5000/geocode`, {
        params: { location: startLocation }
      });

      const startCoords = `${startResponse.data.lon},${startResponse.data.lat}`;

      // Fetch coordinates for the end location
      const endResponse = await axios.get(`http://localhost:5000/geocode`, {
        params: { location: endLocation }
      });

      const endCoords = `${endResponse.data.lon},${endResponse.data.lat}`;

      // Fetch weather data, route coordinates, and other details using the coordinates
      const response = await axios.get(`http://localhost:5000/route-weather`, {
        params: { start: startCoords, end: endCoords }
      });

      setWeatherData(response.data.weatherData);
      setDistance(response.data.distance);
      setDuration(response.data.duration);
      setTraffic(response.data.traffic);
      setRouteCoordinates(response.data.routeCoordinates); // Set the route coordinates
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
      setDistance(null);
      setDuration(null);
      setTraffic(null);
      setRouteCoordinates([]);
    }
  };

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Travel Weather</h1>
      <div className="card p-4 mb-4 shadow-sm">
        <RouteForm onSearch={fetchWeatherData} />
      </div>
      {distance && (
        <div className="alert alert-info">
          <h2>Total Distance: {distance} km</h2>
          <h2>Estimated Travel Time (Approx.): {duration} hours</h2>
          <h2>Traffic Conditions: {traffic}</h2>
        </div>
      )}
      <div className="card p-4 mb-4 shadow-sm">
        <WeatherInfo weatherData={weatherData} />
      </div>
      {routeCoordinates.length > 0 && (
        <div className="card p-4 shadow-sm">
          <MapView routeCoordinates={routeCoordinates} weatherData={weatherData} />
        </div>
      )}
    </div>
  );
};

export default App;
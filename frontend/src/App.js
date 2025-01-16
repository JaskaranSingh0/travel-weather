import React, { useState } from 'react';
import axios from 'axios';
import RouteForm from './components/RouteForm';
import WeatherInfo from './components/WeatherInfo';
import MapView from './components/MapView';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [traffic, setTraffic] = useState(null);

  const fetchWeatherData = async (startLocation, endLocation) => {
    try {
      // Convert the start location into coordinates
      const startResponse = await axios.get(`http://localhost:5000/geocode`, {
        params: { location: startLocation },
      });
      const startCoords = `${startResponse.data.lon},${startResponse.data.lat}`;

      // Convert the end location into coordinates
      const endResponse = await axios.get(`http://localhost:5000/geocode`, {
        params: { location: endLocation },
      });
      const endCoords = `${endResponse.data.lon},${endResponse.data.lat}`;

      // Fetch route, weather, and other data using the coordinates
      const response = await axios.get(`http://localhost:5000/route-weather`, {
        params: { start: startCoords, end: endCoords },
      });

      setRouteCoordinates(response.data.routeCoordinates);
      setWeatherData(response.data.weatherData);
      setDistance(response.data.distance);
      setDuration(response.data.duration);
      setTraffic(response.data.traffic);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className='wrapper' >
    <div className="container my-4">
      <h1 className="text-center mb-4 text-white">Travel Weather</h1>
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
      {weatherData && (
        <div className="card p-4 mb-4 shadow-sm ">
          <WeatherInfo weatherData={weatherData} />
        </div>
      )}
      {routeCoordinates.length > 0 && (
        <div className="card p-4 shadow-sm">
          <MapView routeCoordinates={routeCoordinates} weatherData={weatherData} />
        </div>
      )}
    </div>
    </div>
  );
};

export default App;

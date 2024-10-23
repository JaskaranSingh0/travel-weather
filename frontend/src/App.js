import React, { useState } from 'react';
import axios from 'axios';
import RouteForm from './components/RouteForm';
import WeatherInfo from './components/WeatherInfo';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [traffic, setTraffic] = useState(null);

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

      // Fetch weather data and distance using the coordinates
      const response = await axios.get(`http://localhost:5000/route-weather`, {
        params: { start: startCoords, end: endCoords }
      });

      setWeatherData(response.data.weatherData);
      setDistance(response.data.distance);
      setDuration(response.data.duration);
      setTraffic(response.data.traffic);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
      setDistance(null);
      setDuration(null);
      setTraffic(null);
    }
  };

  return (
    <div>
      <h1>Travel Weather</h1>
      <RouteForm onSearch={fetchWeatherData} />
      {distance && <h2>Total Distance: {distance} km</h2>}
      {duration && <h2>Estimated Travel Time: {duration} hours</h2>}
      {traffic && <h2>Traffic Conditions: {traffic}</h2>}
      <WeatherInfo weatherData={weatherData} />
    </div>
  );
};

export default App;

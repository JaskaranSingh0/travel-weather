import React, { useState } from 'react';
import axios from 'axios';
import RouteForm from './components/RouteForm';
import WeatherInfo from './components/WeatherInfo';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);

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

      // Fetch weather data using the coordinates
      const response = await axios.get(`http://localhost:5000/route-weather`, {
        params: { start: startCoords, end: endCoords }
      });

      setWeatherData(response.data.weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    }
  };

  return (
    <div>
      <h1>Travel Weather</h1>
      <RouteForm onSearch={fetchWeatherData} />
      <WeatherInfo weatherData={weatherData} />
    </div>
  );
};

export default App;

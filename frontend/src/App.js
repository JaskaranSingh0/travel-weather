import React, { useState } from 'react';
import axios from 'axios';
import RouteForm from './components/RouteForm';
import WeatherInfo from './components/WeatherInfo';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeatherData = async (start, end) => {
    try {
      const response = await axios.get(`http://localhost:5000/route-weather`, {
        params: { start, end }
      });
      
      console.log('Response Data:', response.data); // Log the response data
  
      setWeatherData(response.data.weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
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

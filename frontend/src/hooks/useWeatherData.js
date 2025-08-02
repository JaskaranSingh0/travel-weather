import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const useWeatherData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (startLocation, endLocation) => {
    setLoading(true);
    setError(null);
    try {
      // Convert the start location into coordinates
      const startResponse = await axios.get(`${API_BASE_URL}/geocode`, {
        params: { location: startLocation },
      });
      const startCoords = `${startResponse.data.lon},${startResponse.data.lat}`;

      // Convert the end location into coordinates
      const endResponse = await axios.get(`${API_BASE_URL}/geocode`, {
        params: { location: endLocation },
      });
      const endCoords = `${endResponse.data.lon},${endResponse.data.lat}`;

      // Fetch route, weather, and other data using the coordinates
      const response = await axios.get(`${API_BASE_URL}/route-weather`, {
        params: { start: startCoords, end: endCoords },
      });
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchWeatherData };
};

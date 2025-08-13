import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api';

export const useWeatherData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (startLocation, endLocation) => {
    setLoading(true);
    setError(null);
    setData(null); // clear previous results while loading
    try {
      // Convert the start location into coordinates
      const startResponse = await axios.get(`${API_BASE_URL}/geocode`, {
        params: { location: startLocation },
      });
      if (!startResponse.data || typeof startResponse.data.lat === 'undefined' || typeof startResponse.data.lon === 'undefined') {
        throw new Error('Failed to geocode start location');
      }
      const startCoords = `${startResponse.data.lon},${startResponse.data.lat}`;

      // Convert the end location into coordinates
      const endResponse = await axios.get(`${API_BASE_URL}/geocode`, {
        params: { location: endLocation },
      });
      if (!endResponse.data || typeof endResponse.data.lat === 'undefined' || typeof endResponse.data.lon === 'undefined') {
        throw new Error('Failed to geocode destination');
      }
      const endCoords = `${endResponse.data.lon},${endResponse.data.lat}`;

      // Fetch route, weather, and other data using the coordinates
      const response = await axios.get(`${API_BASE_URL}/route-weather`, {
        params: { start: startCoords, end: endCoords },
      });
      setData(response.data);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch weather data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchWeatherData };
};

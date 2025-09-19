import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api';

export const useWeatherData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (payload) => {
    setLoading(true);
    setError(null);
    setData(null); // clear previous results while loading
    try {
      const { startLocation, endLocation, startCoords: startCoordsOverride, departureTimestamp } = payload || {};
      if (!startLocation || !endLocation) {
        throw new Error('Start and end locations are required');
      }

      // Resolve start coordinates: use override (current location) or geocode
      let startCoords;
      if (startCoordsOverride && typeof startCoordsOverride.lat === 'number' && typeof startCoordsOverride.lon === 'number') {
        startCoords = `${startCoordsOverride.lon},${startCoordsOverride.lat}`;
      } else {
        const startResponse = await axios.get(`${API_BASE_URL}/geocode`, {
          params: { location: startLocation },
        });
        if (!startResponse.data || typeof startResponse.data.lat === 'undefined' || typeof startResponse.data.lon === 'undefined') {
          throw new Error('Failed to geocode start location');
        }
        startCoords = `${startResponse.data.lon},${startResponse.data.lat}`;
      }

      // Geocode end location
      const endResponse = await axios.get(`${API_BASE_URL}/geocode`, {
        params: { location: endLocation },
      });
      if (!endResponse.data || typeof endResponse.data.lat === 'undefined' || typeof endResponse.data.lon === 'undefined') {
        throw new Error('Failed to geocode destination');
      }
      const endCoords = `${endResponse.data.lon},${endResponse.data.lat}`;

      // Fetch route, weather, and other data using the coordinates
      const response = await axios.get(`${API_BASE_URL}/route-weather`, {
        params: { start: startCoords, end: endCoords, departure: departureTimestamp },
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

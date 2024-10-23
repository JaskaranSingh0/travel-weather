const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());





// Basic route to check if the server is running
app.get('/route-weather', async (req, res) => {
  const { start, end } = req.query;

  try {
    // Fetch route data from OpenRouteService
    const routeResponse = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
      params: {
        api_key: process.env.OPENROUTESERVICE_API_KEY,
        start,
        end
      }
    });

    const routeData = routeResponse.data;
    const coordinates = routeData.features[0].geometry.coordinates;

    // Array to store weather data for each point
    const weatherData = [];

    // Fetch weather and location name for key points along the route
    for (let i = 0; i < coordinates.length; i += Math.floor(coordinates.length / 10)) {
      const [lon, lat] = coordinates[i];
      
      // Fetch weather data for each point using OpenWeatherMap
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHERMAP_API_KEY,
          units: 'metric' // Change to 'imperial' for Fahrenheit
        }
      });

      const weather = weatherResponse.data;

      // Fetch location name using reverse geocoding from OpenRouteService
      const locationResponse = await axios.get(`https://api.openrouteservice.org/geocode/reverse`, {
        params: {
          api_key: process.env.OPENROUTESERVICE_API_KEY,
          'point.lat': lat, // Separate parameters for latitude
          'point.lon': lon, // Separate parameters for longitude
          size: 1, // Limit results to one
          layers: 'locality,county,region' // Use multiple layers for better coverage
        }
      });

      const locationData = locationResponse.data.features;
      // Try to get a locality name, otherwise fall back to county or region
      const location = locationData.length > 0
        ? locationData[0].properties.name
        : `(${lat}, ${lon})`;

      weatherData.push({
        location,
        weather: `${weather.weather[0].description}, ${weather.main.temp}°C`
      });
    }

    res.json({ weatherData });
  } catch (error) {
    console.error('Error fetching route or weather data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});




// Geocoding endpoint
app.get('/geocode', async (req, res) => {
  const { location } = req.query;

  try {
    // Fetch coordinates from OpenRouteService's geocoding API
    const geocodeResponse = await axios.get(`https://api.openrouteservice.org/geocode/search`, {
      params: {
        api_key: process.env.OPENROUTESERVICE_API_KEY,
        text: location,
        size: 1 // Limit results to one
      }
    });

    const geocodeData = geocodeResponse.data.features;

    if (geocodeData.length > 0) {
      const { geometry } = geocodeData[0];
      const [lon, lat] = geometry.coordinates;
      res.json({ lat, lon });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error fetching geocode data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch geocode data' });
  }
});




  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

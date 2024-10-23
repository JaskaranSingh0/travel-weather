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
        end,
        instructions: false,
        maneuvers: false
      }
    });

    const routeData = routeResponse.data;
    const coordinates = routeData.features[0].geometry.coordinates;
    const distance = routeData.features[0].properties.segments[0].distance;
    const duration = routeData.features[0].properties.segments[0].duration;

    // Convert distance to kilometers and duration to hours
    const distanceInKm = (distance / 1000).toFixed(2);
    const durationInHours = (duration / 3600).toFixed(2);

    // Estimate traffic condition based on duration and distance
    let trafficCondition;
    const avgSpeed = (distanceInKm / durationInHours).toFixed(2);
    if (avgSpeed > 80) {
      trafficCondition = "Light Traffic";
    } else if (avgSpeed > 40) {
      trafficCondition = "Moderate Traffic";
    } else {
      trafficCondition = "Heavy Traffic";
    }

    // Array to store weather data for each point
    const weatherData = [];
    let previousLocation = '';

    // Fetch weather and location name for key points along the route
    for (let i = 0; i < coordinates.length; i += Math.floor(coordinates.length / 10)) {
      const [lon, lat] = coordinates[i];
      
      // Fetch weather data for each point using OpenWeatherMap
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHERMAP_API_KEY,
          units: 'metric'
        }
      });

      const weather = weatherResponse.data;
      const weatherDetails = {
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
        temperature: weather.main.temp,
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        lat,
        lon
      };

      // Fetch location name using reverse geocoding from OpenRouteService
      const locationResponse = await axios.get(`https://api.openrouteservice.org/geocode/reverse`, {
        params: {
          api_key: process.env.OPENROUTESERVICE_API_KEY,
          'point.lat': lat,
          'point.lon': lon,
          size: 1,
          layers: 'locality,county,region'
        }
      });

      const locationData = locationResponse.data.features;
      const location = locationData.length > 0
        ? locationData[0].properties.name
        : `(${lat}, ${lon})`;

      // Only add the location if it is different from the previous one
      if (location !== previousLocation) {
        weatherData.push({
          location,
          ...weatherDetails
        });
        previousLocation = location;
      }
    }

    // Return the weather data, route coordinates, total distance, estimated time, and traffic conditions
    res.json({
      weatherData,
      distance: distanceInKm,
      duration: durationInHours,
      traffic: trafficCondition,
      routeCoordinates: coordinates
    });
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

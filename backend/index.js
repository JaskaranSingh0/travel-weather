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
    const totalDistance = routeData.features[0].properties.segments[0].distance;
    const totalDuration = routeData.features[0].properties.segments[0].duration;

    // Convert distance to kilometers and duration to hours
    const distanceInKm = (totalDistance / 1000).toFixed(2);
    const durationInHours = (totalDuration / 3600).toFixed(2);

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

    // Array to store weather data for each point along with arrival time
    const weatherData = [];
    let previousLocation = '';
    const departureTime = new Date(); // assuming the search is made when the user is leaving

    // Fetch forecasted weather for each key point along the route
    for (let i = 0; i < coordinates.length; i += Math.floor(coordinates.length / 10)) {
      const [lon, lat] = coordinates[i];

      // Calculate the estimated arrival time for this point
      const pointDistance = (totalDistance * i) / coordinates.length; // approximate distance to this point
      const estimatedHoursToPoint = (pointDistance / 1000) / (totalDistance / 1000 / durationInHours); // hours to reach point
      const estimatedArrivalTime = new Date(departureTime.getTime() + estimatedHoursToPoint * 3600 * 1000);

      // Fetch forecast data for the estimated arrival time at this point
      const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHERMAP_API_KEY,
          units: 'metric'
        }
      });

      const forecastData = forecastResponse.data.list;

      // Find the forecast closest to the estimated arrival time
      let closestForecast = forecastData[0];
      forecastData.forEach(forecast => {
        const forecastTime = new Date(forecast.dt * 1000);
        if (Math.abs(forecastTime - estimatedArrivalTime) < Math.abs(new Date(closestForecast.dt * 1000) - estimatedArrivalTime)) {
          closestForecast = forecast;
        }
      });

      // Prepare the weather information
      const weatherDetails = {
        description: closestForecast.weather[0].description,
        icon: closestForecast.weather[0].icon,
        temperature: closestForecast.main.temp,
        humidity: closestForecast.main.humidity,
        windSpeed: closestForecast.wind.speed,
        lat,
        lon
      };

      // Format estimated arrival time for each location in "HH:MM" format
      const arrivalTimeFormatted = estimatedArrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
          ...weatherDetails,
          estimatedArrivalTime: arrivalTimeFormatted // Add estimated arrival time for this location
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


// Endpoint for location autocomplete
app.get('/autocomplete', async (req, res) => {
  const { query } = req.query;

  try {
    // Fetch location suggestions from OpenRouteService's geocoding API
    const response = await axios.get(`https://api.openrouteservice.org/geocode/autocomplete`, {
      params: {
        api_key: process.env.OPENROUTESERVICE_API_KEY,
        text: query,
        size: 5 // Limit to 5 suggestions
      }
    });

    const suggestions = response.data.features.map(feature => ({
      name: feature.properties.label,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0]
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch autocomplete suggestions' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

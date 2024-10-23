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
  
      // Fetch weather for key points along the route
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
        weatherData.push({
          location: `(${lat}, ${lon})`,
          weather: `${weather.weather[0].description}, ${weather.main.temp}°C`
        });
      }
  
      // Log the weatherData array to verify its structure
      console.log('Weather Data:', weatherData);
  
      // Send the response back to the frontend
      res.json({ weatherData });
    } catch (error) {
      console.error('Error fetching route or weather data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

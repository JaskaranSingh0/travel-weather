const express = require('express');
const { query: vquery, validationResult } = require('express-validator');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

// Configure axios to handle SSL certificate issues in development
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.SSL_VERIFY !== 'false' // Allow disabling SSL verification
});

// Create axios instance with SSL configuration
const axiosInstance = axios.create({
  httpsAgent: httpsAgent,
  timeout: 10000 // 10 second timeout
});

// Validate required environment variables
if (!process.env.OPENROUTESERVICE_API_KEY || !process.env.OPENWEATHERMAP_API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Helper to detect placeholder keys from multiple possible template variants
const placeholderVariants = [
  'your_openrouteservice_api_key',
  'your_openrouteservice_api_key_here',
  'your_openweathermap_api_key',
  'your_openweathermap_api_key_here'
];
function isPlaceholder(val) {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  return placeholderVariants.includes(normalized);
}

if (isPlaceholder(process.env.OPENROUTESERVICE_API_KEY) || isPlaceholder(process.env.OPENWEATHERMAP_API_KEY)) {
  console.error('Please replace placeholder API keys with actual values in your .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Log SSL configuration for debugging
console.log(`SSL Verification: ${process.env.SSL_VERIFY !== 'false' ? 'Enabled' : 'Disabled'}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

app.use(cors());
app.use(express.json());

// Test endpoint to check API connectivity
app.get('/test', async (req, res) => {
  try {
    // Test OpenWeatherMap API
    const weatherTest = await axiosInstance.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        lat: 40.7128,
        lon: -74.0060,
        appid: process.env.OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });
    
    // Test OpenRouteService API
    const routeTest = await axiosInstance.get(`https://api.openrouteservice.org/geocode/search`, {
      params: {
        api_key: process.env.OPENROUTESERVICE_API_KEY,
        text: 'New York',
        size: 1
      }
    });
    
    res.json({ 
      status: 'APIs working',
      weather: !!weatherTest.data,
      route: !!routeTest.data
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'API test failed',
      details: error.message,
      code: error.code
    });
  }
});

// Basic route to check if the server is running
app.get(
  '/route-weather',
  [
    vquery('start').notEmpty().withMessage('Start coordinates are required'),
    vquery('end').notEmpty().withMessage('End coordinates are required')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { start, end } = req.query;
    console.log(`Route-weather request: start=${start}, end=${end}`);
    try {
      // Fetch route data from OpenRouteService
      const routeResponse = await axiosInstance.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
        params: {
          api_key: process.env.OPENROUTESERVICE_API_KEY,
          start,
          end,
          instructions: false,
          maneuvers: false
        }
      });
      const routeData = routeResponse.data;
    
    // Validate API response structure
    if (!routeData.features || !Array.isArray(routeData.features) || routeData.features.length === 0) {
      console.error('Invalid features array in route response');
      return res.status(500).json({ error: 'Invalid route data received from API - no features' });
    }
    
    if (!routeData.features[0].geometry || !routeData.features[0].geometry.coordinates) {
      console.error('Invalid geometry in route response');
      return res.status(500).json({ error: 'Invalid route data received from API - no coordinates' });
    }
    
    if (!routeData.features[0].properties || !routeData.features[0].properties.segments || 
        !Array.isArray(routeData.features[0].properties.segments) || 
        routeData.features[0].properties.segments.length === 0) {
      console.error('Invalid segments in route response');
      return res.status(500).json({ error: 'Invalid route data received from API - no segments' });
    }
    
    const coordinates = routeData.features[0].geometry.coordinates;
    const totalDistance = routeData.features[0].properties.segments[0].distance;
    const totalDuration = routeData.features[0].properties.segments[0].duration;

    console.log(`Route has ${coordinates.length} coordinates, distance: ${totalDistance}m, duration: ${totalDuration}s`);

    // Keep numeric values separate, derive formatted strings for response/UI
    const distanceKm = totalDistance / 1000;
    const durationHours = totalDuration / 3600;
    const distanceInKm = distanceKm.toFixed(2);
    const durationInHours = durationHours.toFixed(2);

    // Estimate traffic condition based on duration and distance (use numeric values to avoid implicit coercion)
    let trafficCondition;
    const avgSpeed = (durationHours > 0 && distanceKm > 0) ? (distanceKm / durationHours) : 0;
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

    // Calculate cumulative distances for proper distribution along route
    console.log(`Calculating route distances for ${coordinates.length} coordinates`);
    const cumulativeDistances = [0]; // Start with 0 distance
    let totalRouteDistance = 0;
    
    // Calculate distance between each consecutive coordinate pair
    for (let i = 1; i < coordinates.length; i++) {
      const [prevLon, prevLat] = coordinates[i - 1];
      const [currLon, currLat] = coordinates[i];
      
      // Haversine formula to calculate distance between two lat/lon points
      const R = 6371; // Earth's radius in kilometers
      const dLat = (currLat - prevLat) * Math.PI / 180;
      const dLon = (currLon - prevLon) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(prevLat * Math.PI / 180) * Math.cos(currLat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const segmentDistance = R * c; // Distance in km
      
      totalRouteDistance += segmentDistance;
      cumulativeDistances.push(totalRouteDistance);
    }
    
    console.log(`Total calculated route distance: ${totalRouteDistance.toFixed(2)} km`);

    // Create evenly distributed points based on distance, not coordinate index
    const targetLocations = 15; // Target number of locations
    const distanceInterval = totalRouteDistance / (targetLocations - 1); // Distance between points
    const indicesToProcess = [];
    
    console.log(`Creating ${targetLocations} evenly distributed points every ${distanceInterval.toFixed(2)} km`);
    
    // Always include start point
    indicesToProcess.push(0);
    
    // Minimum index gap to reduce clustering (at least 1, proportional to coords / target locations)
    const minIndexGap = Math.max(1, Math.floor(coordinates.length / targetLocations));
    
    // Find coordinates at regular distance intervals
    for (let locationNum = 1; locationNum < targetLocations - 1; locationNum++) {
      const targetDistance = locationNum * distanceInterval;
      
      // Find the coordinate index closest to this target distance
      let closestIndex = 0;
      let minDistanceDiff = Math.abs(cumulativeDistances[0] - targetDistance);
      
      for (let i = 1; i < cumulativeDistances.length; i++) {
        const distanceDiff = Math.abs(cumulativeDistances[i] - targetDistance);
        if (distanceDiff < minDistanceDiff) {
          minDistanceDiff = distanceDiff;
          closestIndex = i;
        }
      }
      
      // Only add if it's not too close to an already selected point
      const tooClose = indicesToProcess.some(existingIndex => Math.abs(closestIndex - existingIndex) < minIndexGap);
      
      if (!tooClose) {
        indicesToProcess.push(closestIndex);
        console.log(`Added point ${locationNum} at index ${closestIndex} (${cumulativeDistances[closestIndex].toFixed(2)} km)`);
      }
    }
    
    // Always include destination
    const lastIndex = coordinates.length - 1;
    if (!indicesToProcess.includes(lastIndex)) {
      indicesToProcess.push(lastIndex);
    }
    
    // Sort indices to process them in order
    indicesToProcess.sort((a, b) => a - b);
    console.log(`Will process ${indicesToProcess.length} evenly distributed points:`, 
                indicesToProcess.map(i => `${i}(${cumulativeDistances[i].toFixed(1)}km)`));
    
    for (const i of indicesToProcess) {
      const [lon, lat] = coordinates[i];
      const currentDistance = cumulativeDistances[i];
      const distanceProgress = totalRouteDistance > 0 ? (currentDistance / totalRouteDistance) : 0;
      
      console.log(`Processing point ${i}: lat=${lat}, lon=${lon} at ${currentDistance.toFixed(2)}km (${(distanceProgress * 100).toFixed(1)}% of route)`);

      // Calculate the estimated arrival time based on distance progress, not coordinate index
      const estimatedHoursToPoint = durationHours * distanceProgress; // use numeric hours
      const estimatedArrivalTime = new Date(departureTime.getTime() + estimatedHoursToPoint * 3600 * 1000);

      try {
        console.log(`Fetching weather for lat=${lat}, lon=${lon}`);
        // Fetch forecast data for the estimated arrival time at this point
        const forecastResponse = await axiosInstance.get(`https://api.openweathermap.org/data/2.5/forecast`, {
          params: {
            lat,
            lon,
            appid: process.env.OPENWEATHERMAP_API_KEY,
            units: 'metric'
          }
        });

        console.log(`Weather API response status: ${forecastResponse.status}`);
        
        // Check if we're getting HTML (firewall/proxy redirect) instead of JSON
        if (typeof forecastResponse.data === 'string' && forecastResponse.data.includes('<html>')) {
            console.log('WARNING: Received HTML response instead of JSON - likely firewall/proxy blocking API access');
            console.log('Response indicates network filtering/authentication required');
            console.log('First 200 characters:', forecastResponse.data.substring(0, 200));
            continue; // Skip this point and try the next one
        }
        
        // Ensure we have a valid JSON response
        if (typeof forecastResponse.data !== 'object' || forecastResponse.data === null) {
            console.log('Invalid API response format - expected JSON object, got:', typeof forecastResponse.data);
            continue; // Skip this point
        }
        
        // The API might return data directly as an array or with a 'list' property
        const forecastData = forecastResponse.data.list || forecastResponse.data;
        
        // Debug: Check if forecast data exists
        if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
          console.error('Invalid forecast data for coordinates:', lat, lon);
          console.log('Response structure:', Object.keys(forecastResponse.data));
          continue; // Skip this point and continue with the next
        }

        console.log(`Received ${forecastData.length} forecast items`);

        // Find the forecast closest to the estimated arrival time
        let closestForecast = forecastData[0];
        forecastData.forEach(forecast => {
          if (!forecast.dt || !forecast.weather || !forecast.weather[0] || !forecast.main) {
            console.warn('Invalid forecast item structure, skipping');
            return;
          }
          const forecastTime = new Date(forecast.dt * 1000);
          if (Math.abs(forecastTime - estimatedArrivalTime) < Math.abs(new Date(closestForecast.dt * 1000) - estimatedArrivalTime)) {
            closestForecast = forecast;
          }
        });

        // Validate the selected forecast
        if (!closestForecast || !closestForecast.weather || !closestForecast.weather[0] || !closestForecast.main) {
          console.error('No valid forecast found for coordinates:', lat, lon);
          continue; // Skip this point
        }

        // Prepare the weather information
        const weatherDetails = {
          description: closestForecast.weather[0].description,
          icon: closestForecast.weather[0].icon,
          temperature: closestForecast.main.temp,
          humidity: closestForecast.main.humidity,
          windSpeed: closestForecast.wind ? closestForecast.wind.speed : 0, // Handle missing wind data
          lat,
          lon
        };

        // Format estimated arrival time for each location in "HH:MM" format
        const arrivalTimeFormatted = estimatedArrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Fetch location name using reverse geocoding from OpenRouteService
        try {
          const locationResponse = await axiosInstance.get(`https://api.openrouteservice.org/geocode/reverse`, {
            params: {
              api_key: process.env.OPENROUTESERVICE_API_KEY,
              'point.lat': lat,
              'point.lon': lon,
              size: 1,
              layers: 'locality,county,region' // Get city/town names preferentially
            }
          });

          const locationData = locationResponse.data.features;
          let location = locationData && locationData.length > 0
            ? locationData[0].properties.name
            : `(${lat.toFixed(4)}, ${lon.toFixed(4)})`;

          // Special handling for destination and start - always include them
          const isDestination = i === lastIndex;
          const isStart = i === 0;
          const currentDistance = cumulativeDistances[i];
          const distanceProgress = totalRouteDistance > 0 ? (currentDistance / totalRouteDistance) : 0;
          
          // More intelligent location filtering for evenly distributed coverage
          let shouldInclude = false;
          
          if (isDestination || isStart) {
            // Always include start and destination
            shouldInclude = true;
            if (isDestination && location === previousLocation) {
              location = `${location} (Destination)`;
            } else if (isStart && location === previousLocation) {
              location = `${location} (Start)`;
            }
          } else {
            // For intermediate points, prioritize different locations but ensure even distribution
            if (location !== previousLocation) {
              shouldInclude = true;
            } else if (weatherData.length < 3) {
              // Always include first few points even if same name
              location = `${location} (${currentDistance.toFixed(0)}km)`;
              shouldInclude = true;
            } else {
              // For duplicate names, include if we're maintaining good distance distribution
              const lastAddedDistance = weatherData.length > 0 ? 
                cumulativeDistances[indicesToProcess[weatherData.length - 1]] || 0 : 0;
              const distanceFromLast = currentDistance - lastAddedDistance;
              
              if (distanceFromLast > distanceInterval * 0.7) { // If we've traveled enough distance
                location = `${location} (${currentDistance.toFixed(0)}km mark)`;
                shouldInclude = true;
              }
            }
          }

          if (shouldInclude) {
            weatherData.push({
              location,
              ...weatherDetails,
              estimatedArrivalTime: arrivalTimeFormatted,
              routeProgress: Math.round(distanceProgress * 100), // Distance-based progress
              distanceFromStart: currentDistance.toFixed(1) // Add actual distance
            });
            previousLocation = locationData && locationData.length > 0 ? locationData[0].properties.name : location;
            console.log(`Added weather data for: ${location}${isDestination ? ' (DESTINATION)' : ''}${isStart ? ' (START)' : ''} - ${currentDistance.toFixed(1)}km (${(distanceProgress * 100).toFixed(1)}% of route)`);
          } else {
            console.log(`Skipped duplicate location: ${location} at ${currentDistance.toFixed(1)}km`);
          }
        } catch (locationError) {
          console.warn('Failed to get location name for coordinates:', lat, lon, locationError.message);
          // Use coordinates as fallback with distance-based labeling
          const currentDistance = cumulativeDistances[i];
          const distanceProgress = totalRouteDistance > 0 ? (currentDistance / totalRouteDistance) : 0;
          let location = `(${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          
          // Special handling for destination and start with coordinate fallback
          const isDestination = i === lastIndex;
          const isStart = i === 0;
          
          if (isDestination) {
            location = `${location} (Destination)`;
          } else if (isStart) {
            location = `${location} (Start)`;
          } else {
            // Add distance marker for intermediate coordinate points
            location = `${location} (${currentDistance.toFixed(0)}km mark)`;
          }
          
          // Always include coordinate fallbacks since they're already unique
          weatherData.push({
            location,
            ...weatherDetails,
            estimatedArrivalTime: arrivalTimeFormatted,
            routeProgress: Math.round(distanceProgress * 100),
            distanceFromStart: currentDistance.toFixed(1)
          });
          previousLocation = location;
          console.log(`Added weather data for coordinates: ${location}${isDestination ? ' (DESTINATION)' : ''}${isStart ? ' (START)' : ''} at ${currentDistance.toFixed(1)}km`);
        }
      } catch (weatherError) {
        console.error('Error fetching weather for coordinates:', lat, lon, weatherError.message);
        continue; // Skip this point and continue with the next
      }
    }

    // Ensure we have at least some weather data
    if (weatherData.length === 0) {
      console.warn('No weather data collected - likely due to network restrictions/firewall');
      console.log('Providing enhanced mock weather data with evenly distributed locations for demonstration purposes');
      
      // Generate more diverse sample weather data
      const sampleWeatherTypes = [
        { description: 'partly cloudy', icon: '02d', temp: 22, humidity: 65 },
        { description: 'clear sky', icon: '01d', temp: 25, humidity: 45 },
        { description: 'light rain', icon: '10d', temp: 18, humidity: 80 },
        { description: 'few clouds', icon: '02d', temp: 24, humidity: 55 },
        { description: 'overcast clouds', icon: '04d', temp: 20, humidity: 70 },
        { description: 'scattered clouds', icon: '03d', temp: 23, humidity: 60 },
        { description: 'moderate rain', icon: '10d', temp: 16, humidity: 85 },
        { description: 'sunny', icon: '01d', temp: 27, humidity: 40 }
      ];
      
      // Create evenly distributed mock locations using the same distance calculation
      const mockLocationCount = 8;
      const mockDistanceInterval = (totalRouteDistance || (totalDistance / 1000)) / (mockLocationCount - 1);
      
      console.log(`Creating ${mockLocationCount} mock locations every ${mockDistanceInterval.toFixed(2)}km`);
      
      for (let pointNum = 0; pointNum < mockLocationCount; pointNum++) {
        const targetDistance = pointNum * mockDistanceInterval;
        
        // Find coordinate index closest to target distance
        let targetIndex;
        if (cumulativeDistances.length > 0) {
          targetIndex = 0;
          let minDiff = Math.abs(cumulativeDistances[0] - targetDistance);
          for (let i = 1; i < cumulativeDistances.length; i++) {
            const diff = Math.abs(cumulativeDistances[i] - targetDistance);
            if (diff < minDiff) {
              minDiff = diff;
              targetIndex = i;
            }
          }
        } else {
          // Fallback to percentage-based if distance calculation failed
          targetIndex = Math.floor((pointNum / (mockLocationCount - 1)) * (coordinates.length - 1));
        }
        
        const [lon, lat] = coordinates[targetIndex];
        const weather = sampleWeatherTypes[pointNum % sampleWeatherTypes.length];
        const distanceProgress = (totalRouteDistance || (totalDistance / 1000)) > 0 ? 
          targetDistance / (totalRouteDistance || (totalDistance / 1000)) : pointNum / (mockLocationCount - 1);
        
        let locationLabel;
        if (pointNum === 0) {
          locationLabel = 'Starting Point';
        } else if (pointNum === mockLocationCount - 1) {
          locationLabel = 'Destination';
        } else {
          locationLabel = `Location at ${targetDistance.toFixed(0)}km`;
        }
        
        const departureTime = new Date();
        const estimatedHoursToPoint = durationInHours * distanceProgress;
        const estimatedArrivalTime = new Date(departureTime.getTime() + estimatedHoursToPoint * 3600 * 1000);
        
        weatherData.push({
          location: locationLabel,
          description: weather.description,
          icon: weather.icon,
          temperature: weather.temp + (Math.random() * 6 - 3), // Add some variation
          humidity: weather.humidity + (Math.random() * 20 - 10),
          windSpeed: Math.random() * 10 + 2,
          lat,
          lon,
          estimatedArrivalTime: estimatedArrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          routeProgress: Math.round(distanceProgress * 100),
          distanceFromStart: targetDistance.toFixed(1),
          isMockData: true // Flag to indicate this is mock data
        });
      }
      
      console.log(`Generated ${weatherData.length} evenly distributed mock weather data points`);
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
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch data';
    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      errorMessage = 'SSL certificate error. Please check your network connection.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your configuration.';
    } else if (error.response?.status === 429) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Geocoding endpoint
app.get('/geocode', async (req, res) => {
  const { location } = req.query;

  if (!location || location.trim() === '') {
    return res.status(400).json({ error: 'Location parameter is required' });
  }

  try {
    // Fetch coordinates from OpenRouteService's geocoding API
    const geocodeResponse = await axiosInstance.get(`https://api.openrouteservice.org/geocode/search`, {
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
    
    let errorMessage = 'Failed to fetch geocode data';
    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      errorMessage = 'SSL certificate error. Please check your network connection.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid API key for geocoding service.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});


// Endpoint for location autocomplete
app.get('/autocomplete', async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '' || query.length < 2) {
    return res.json([]); // Return empty array for short queries
  }

  try {
    // Fetch location suggestions from OpenRouteService's geocoding API
    const response = await axiosInstance.get(`https://api.openrouteservice.org/geocode/autocomplete`, {
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
    
    let errorMessage = 'Failed to fetch autocomplete suggestions';
    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      errorMessage = 'SSL certificate error. Please check your network connection.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});



// Start the server

// Centralized error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

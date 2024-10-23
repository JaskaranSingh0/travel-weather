import React from 'react';

const WeatherInfo = ({ weatherData }) => {
  // If weatherData is not available or is not an array, show a message
  if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
    return <div>No weather data available.</div>;
  }

  return (
    <div>
      <h2>Weather Information Along the Route</h2>
      <ul>
        {weatherData.map((point, index) => (
          <li key={index}>
            <strong>Location {index + 1} {point.location}</strong>: {point.weather}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherInfo;

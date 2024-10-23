import React from 'react';

const WeatherInfo = ({ weatherData }) => {
  if (!weatherData) {
    return <div>No weather data available.</div>;
  }

  return (
    <div>
      <h2>Weather Information Along the Route</h2>
      <ul>
        {weatherData.map((point, index) => (
          <li key={index}>
            <strong>{point.location}</strong>: {point.description}, {point.temperature}°C
            <img
              src={`https://openweathermap.org/img/wn/${point.icon}.png`}
              alt={point.description}
            />
            <ul>
              <li>Humidity: {point.humidity}%</li>
              <li>Wind Speed: {point.windSpeed} m/s</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherInfo;

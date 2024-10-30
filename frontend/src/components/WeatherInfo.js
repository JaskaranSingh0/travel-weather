import React from 'react';

const WeatherInfo = ({ weatherData }) => {
  if (!weatherData) {
    return <div>No weather data available.</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Weather Information Along the Route</h2>
      <ul className="list-group">
        {weatherData.map((point, index) => (
          <li key={index} className="list-group-item d-flex align-items-center">
            <div className="me-3">
              <img
                src={`https://openweathermap.org/img/wn/${point.icon}.png`}
                alt={point.description}
              />
            </div>
            <div>
              <h5 className="mb-2">
                <strong>{point.location}</strong> (Arrival: {point.estimatedArrivalTime}): {point.description}, {point.temperature}°C
              </h5>
              <ul className="list-unstyled mb-0">
                <li>Humidity: {point.humidity}%</li>
                <li>Wind Speed: {point.windSpeed} m/s</li>
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherInfo;

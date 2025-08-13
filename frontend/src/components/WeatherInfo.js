import React from 'react';

const WeatherInfo = ({ weatherData }) => {
  console.log('WeatherInfo received data:', weatherData);
  
  if (!weatherData) {
    return (
      <div className="text-center p-5">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌤️</div>
        <h4 style={{ color: '#718096' }}>No weather data available</h4>
      </div>
    );
  }

  if (!Array.isArray(weatherData)) {
    return (
      <div className="alert alert-warning">Unexpected weather data format.</div>
    );
  }

  if (weatherData.length === 0) {
    return (
      <div className="text-center p-5">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌤️</div>
        <h4 style={{ color: '#718096' }}>No weather information found for this route</h4>
        <p style={{ color: '#a0aec0' }}>Please try a different route or check back later.</p>
      </div>
    );
  }

  const getWeatherEmoji = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    return '🌤️';
  };

  const getTemperatureColor = (temp) => {
    if (temp > 30) return '#ff6b6b';
    if (temp > 20) return '#feca57';
    if (temp > 10) return '#48dbfb';
    return '#0abde3';
  };

  return (
    <div>
      <h2 className="mb-4">🌤️ Weather Information Along Your Route</h2>
      {weatherData.some(point => point.isMockData) && (
        <div className="alert alert-info mb-4 d-flex align-items-center justify-content-center" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          <span className="badge bg-warning text-dark me-2" style={{ fontSize: '1rem' }}>Demo Mode</span>
          <span>📡 Weather data is simulated due to network restrictions. Real weather data requires network access to external APIs.</span>
        </div>
      )}
      <div className="row">
        {weatherData.map((point, index) => (
          <div key={`${point.lat}-${point.lon}-${index}`} className="col-lg-6 mb-4">
            <div className="weather-card">
              <div className="d-flex align-items-center">
                <div className="me-4">
                  <div className="weather-icon" style={{ fontSize: '3rem' }}>
                    {getWeatherEmoji(point.description)}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${point.icon}@2x.png`}
                    alt={point.description}
                    style={{ 
                      width: '60px', 
                      height: '60px',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-2" style={{ color: '#2d3748', fontWeight: '700' }}>
                    📍 {point.location}
                  </h5>
                  <div className="mb-2">
                    <span 
                      className="badge" 
                      style={{ 
                        background: `linear-gradient(135deg, ${getTemperatureColor(point.temperature)}, ${getTemperatureColor(point.temperature)}aa)`,
                        color: 'white',
                        fontSize: '1rem',
                        padding: '8px 12px',
                        borderRadius: '20px'
                      }}
                    >
                      🌡️ {Math.round(point.temperature)}°C
                    </span>
                  </div>
                  <p className="mb-2" style={{ 
                    color: '#4a5568', 
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {point.description}
                  </p>
                  <div className="row text-center">
                    <div className="col-4">
                      <small style={{ color: '#718096' }}>🕐 Arrival</small>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {point.estimatedArrivalTime}
                      </div>
                    </div>
                    <div className="col-4">
                      <small style={{ color: '#718096' }}>💧 Humidity</small>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {point.humidity}%
                      </div>
                    </div>
                    <div className="col-4">
                      <small style={{ color: '#718096' }}>💨 Wind</small>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {point.windSpeed} m/s
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherInfo;

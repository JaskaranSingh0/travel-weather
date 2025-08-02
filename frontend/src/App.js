import React, { useState } from 'react';
import { useWeatherData } from './hooks/useWeatherData';
import RouteForm from './components/RouteForm';
import WeatherInfo from './components/WeatherInfo';
import MapView from './components/MapView';
import ErrorBoundary from './components/ErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom-theme.css';


const App = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const { data, loading, error, fetchWeatherData } = useWeatherData();

  // When data changes, update local state for routeCoordinates, distance, duration, traffic, weatherData
  React.useEffect(() => {
    if (data) {
      setRouteCoordinates(data.routeCoordinates || []);
      setDistance(data.distance || null);
      setDuration(data.duration || null);
      setTraffic(data.traffic || null);
    }
  }, [data]);

  return (
    <ErrorBoundary>
      <div className='wrapper'>
        <div className="container">
          <h1 className="main-title">🌤️ Travel Weather</h1>
          
          <div className="card p-4 mb-4">
            <RouteForm onSearch={fetchWeatherData} loading={loading} />
          </div>
          
          {loading && (
            <div className="alert alert-info text-center loading-container">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="loading-text">Fetching weather data along your route...</div>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}
          
          {distance && !loading && (
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-value">{distance}</div>
                <div className="stat-label">Kilometers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{duration}</div>
                <div className="stat-label">Hours</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{traffic}</div>
                <div className="stat-label">Traffic</div>
              </div>
            </div>
          )}
          
          {data && data.weatherData && (
            <div className="card p-4 mb-4">
              <WeatherInfo weatherData={data.weatherData} />
            </div>
          )}
          
          {routeCoordinates.length > 0 && (
            <div className="card p-4">
              <h2>🗺️ Route Map</h2>
              <div className="map-container">
                <MapView routeCoordinates={routeCoordinates} weatherData={data ? data.weatherData : null} />
              </div>
            </div>
          )}
          
          <footer className="text-center mt-5" style={{ 
            padding: '30px 0',
            borderTop: '2px solid rgba(102, 126, 234, 0.1)',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '16px',
            marginTop: '40px'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#718096',
              fontWeight: '500'
            }}>
              🌤️ Built with ❤️ for travelers • Weather data by OpenWeatherMap • Routes by OpenRouteService
            </p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RouteForm = ({ onSearch, loading }) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [startCoords, setStartCoords] = useState(null); // { lat, lon }
  const [departureLocal, setDepartureLocal] = useState(''); // yyyy-MM-ddTHH:mm
  const [geoError, setGeoError] = useState('');

  const API_BASE_URL = '/api';

  // Initialize departure time to now in local timezone for datetime-local input
  useEffect(() => {
    const now = new Date();
    // Round to nearest 5 minutes for nicer UI
    now.setSeconds(0, 0);
    const minutes = now.getMinutes();
    now.setMinutes(minutes - (minutes % 5));
    const pad = (n) => String(n).padStart(2, '0');
    const value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setDepartureLocal(value);
  }, []);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query, setSuggestions) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/autocomplete`, {
        params: { query }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]); // Clear suggestions on error
    }
  };

  // Handle changes to the start location input
  const handleStartChange = (e) => {
    const query = e.target.value;
    setStartLocation(query);
  setUseCurrentLocation(false);
  setStartCoords(null);
    if (query.length > 1) {
      fetchSuggestions(query, setStartSuggestions);
    } else {
      setStartSuggestions([]);
    }
  };

  // Handle changes to the end location input
  const handleEndChange = (e) => {
    const query = e.target.value;
    setEndLocation(query);
    if (query.length > 1) {
      fetchSuggestions(query, setEndSuggestions);
    } else {
      setEndSuggestions([]);
    }
  };

  // Handle selection of a suggestion
  const selectSuggestion = (name, setLocation, setSuggestions) => {
    setLocation(name);
    setSuggestions([]);
  };

  const handleUseCurrentLocation = async () => {
    setGeoError('');
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported by this browser.');
      return;
    }
    setUseCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStartCoords({ lat: latitude, lon: longitude });
        setStartLocation('Current Location');
        setStartSuggestions([]);
      },
      (err) => {
        setUseCurrentLocation(false);
        setGeoError(err.message || 'Failed to get current location');
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
    );
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return; // prevent duplicate submissions while loading
    
    // Validate inputs
    if (!startLocation.trim() || !endLocation.trim()) {
      alert('Please enter both start and end locations');
      return;
    }
    
    // Basic validation for location format
    if (startLocation.trim().length < 2 || endLocation.trim().length < 2) {
      alert('Location names must be at least 2 characters long');
      return;
    }

    // Build departure timestamp (ms since epoch) from datetime-local
    let departureTimestamp = Date.now();
    if (departureLocal) {
      const dt = new Date(departureLocal);
      if (!isNaN(dt.getTime())) departureTimestamp = dt.getTime();
    }

    onSearch({
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      startCoords: useCurrentLocation && startCoords ? startCoords : null,
      departureTimestamp
    });

    // Clear suggestions to hide the dropdown
    setStartSuggestions([]);
    setEndSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row">
        <div className="col-md-5">
          <div className="form-group mb-3 position-relative">
            <label className="form-label">📍 Start Location</label>
            <input
              type="text"
              className="form-control"
              value={startLocation}
              onChange={handleStartChange}
              placeholder="Where are you starting from?"
              aria-label="Start location"
            />
            <div className="d-flex align-items-center mt-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleUseCurrentLocation} disabled={loading}>
                Use current location
              </button>
              {useCurrentLocation && startCoords && (
                <small className="ms-2 text-success">({startCoords.lat.toFixed(4)}, {startCoords.lon.toFixed(4)})</small>
              )}
            </div>
            {geoError && <div className="text-danger mt-1" role="alert">{geoError}</div>}
            {/* Suggestions for Start Location */}
            {startSuggestions.length > 0 && (
              <ul className="list-group position-absolute w-100 autocomplete-list" role="listbox" aria-label="Start location suggestions">
                {startSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action"
                    onClick={() => selectSuggestion(suggestion.name, setStartLocation, setStartSuggestions)}
                    style={{ cursor: 'pointer' }}
                  >
                    📍 {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="col-md-2 d-flex align-items-center justify-content-center">
          <div className="route-arrow" style={{ 
            animation: 'float 3s ease-in-out infinite',
            fontSize: '2rem', 
            color: '#667eea'
          }}>
            →
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="form-group mb-3 position-relative">
            <label className="form-label">🎯 Destination</label>
            <input
              type="text"
              className="form-control"
              value={endLocation}
              onChange={handleEndChange}
              placeholder="Where are you going?"
              aria-label="Destination"
            />
            {/* Suggestions for End Location */}
            {endSuggestions.length > 0 && (
              <ul className="list-group position-absolute w-100 autocomplete-list" role="listbox" aria-label="Destination suggestions">
                {endSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action"
                    onClick={() => selectSuggestion(suggestion.name, setEndLocation, setEndSuggestions)}
                    style={{ cursor: 'pointer' }}
                  >
                    🎯 {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label className="form-label">🕒 Departure time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={departureLocal}
              onChange={(e) => setDepartureLocal(e.target.value)}
              aria-label="Departure time"
            />
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Loading...
            </>
          ) : (
            <>
              <span style={{ marginRight: '10px' }}>🌤️</span>
              Get Weather Info
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RouteForm;

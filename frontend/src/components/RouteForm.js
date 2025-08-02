import React, { useState } from 'react';
import axios from 'axios';

const RouteForm = ({ onSearch, loading }) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    
    onSearch(startLocation.trim(), endLocation.trim());

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
            />
            {/* Suggestions for Start Location */}
            {startSuggestions.length > 0 && (
              <ul className="list-group position-absolute w-100">
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
            />
            {/* Suggestions for End Location */}
            {endSuggestions.length > 0 && (
              <ul className="list-group position-absolute w-100">
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

import React, { useState } from 'react';
import axios from 'axios';

const RouteForm = ({ onSearch }) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query, setSuggestions) => {
    try {
      const response = await axios.get(`http://localhost:5000/autocomplete`, {
        params: { query }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
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
    onSearch(startLocation, endLocation);

    // Clear suggestions to hide the dropdown
    setStartSuggestions([]);
    setEndSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="form-group mb-3">
        <label>Start Location</label>
        <input
          type="text"
          className="form-control"
          value={startLocation}
          onChange={handleStartChange}
        />
        {/* Suggestions for Start Location */}
        {startSuggestions.length > 0 && (
          <ul className="list-group position-absolute">
            {startSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() => selectSuggestion(suggestion.name, setStartLocation, setStartSuggestions)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group mb-3">
        <label>End Location</label>
        <input
          type="text"
          className="form-control"
          value={endLocation}
          onChange={handleEndChange}
        />
        {/* Suggestions for End Location */}
        {endSuggestions.length > 0 && (
          <ul className="list-group position-absolute">
            {endSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() => selectSuggestion(suggestion.name, setEndLocation, setEndSuggestions)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        Get Weather Info
      </button>
    </form>
  );
};

export default RouteForm;

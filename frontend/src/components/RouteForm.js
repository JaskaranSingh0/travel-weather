import React, { useState } from 'react';

const RouteForm = ({ onSearch }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(start, end);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Start Location"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        type="text"
        placeholder="End Location"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />
      <button type="submit">Get Weather Info</button>
    </form>
  );
};

export default RouteForm;

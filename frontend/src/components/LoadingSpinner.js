import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner-border" role="status" style={{
        width: '3rem',
        height: '3rem',
        borderWidth: '4px'
      }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="loading-text" style={{
        marginLeft: '20px',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        {message}
      </div>
    </div>
  );
};

export default LoadingSpinner;

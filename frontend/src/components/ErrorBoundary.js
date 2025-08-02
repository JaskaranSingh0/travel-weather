import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wrapper">
          <div className="container">
            <div className="alert alert-danger text-center" style={{ margin: '50px auto', maxWidth: '600px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
              <h4 style={{ marginBottom: '1rem' }}>Oops! Something went wrong</h4>
              <p style={{ marginBottom: '1.5rem', color: '#721c24' }}>
                An unexpected error occurred while loading the application. Please refresh the page and try again.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                style={{ marginRight: '10px' }}
              >
                🔄 Refresh Page
              </button>
              <details style={{ 
                marginTop: '20px', 
                textAlign: 'left', 
                background: 'rgba(0,0,0,0.05)', 
                padding: '15px', 
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '10px' }}>
                  🔍 Technical Details
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#721c24' }}>
                  {this.state.error && this.state.error.toString()}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

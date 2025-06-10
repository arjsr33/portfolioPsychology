// fullstack-psychology/frontend/src/main.jsx - React Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                <path d="M12 7v6M12 17h.01"/>
              </svg>
              <h1 className="text-xl font-bold text-red-400">Application Error</h1>
            </div>
            
            <p className="text-gray-300 mb-4">
              The Interactive Psychology application encountered an unexpected error. 
              This could be due to a temporary issue or network connectivity problem.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Refresh Application
              </button>
              
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-gray-400 cursor-pointer text-sm">
                  Error Details (Development Mode)
                </summary>
                <div className="mt-2 p-3 bg-gray-900 rounded text-xs">
                  <div className="text-red-300 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <pre className="text-gray-400 overflow-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-sm">
                If this problem persists, try:
              </p>
              <ul className="text-gray-500 text-sm mt-2 list-disc list-inside space-y-1">
                <li>Clearing your browser cache</li>
                <li>Checking your internet connection</li>
                <li>Ensuring the backend server is running on port 3001</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Connection status component
const ConnectionMonitor = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline && showOfflineMessage) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          You're offline. Some features may not work properly.
        </div>
      </div>
    );
  }

  return null;
};

// Performance monitoring
if (typeof window !== 'undefined') {
  // Log performance metrics
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      console.log('🚀 Psychology App Performance:', {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      });
    }
  });

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ Long task detected:', entry.duration + 'ms');
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Ignore if long task monitoring is not supported
    }
  }
}

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with error boundary and connection monitoring
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConnectionMonitor />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Service worker registration for PWA features (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🧠 Service Worker registered:', registration);
      })
      .catch((registrationError) => {
        console.log('❌ Service Worker registration failed:', registrationError);
      });
  });
}

// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('🧠 Interactive Psychology React App Initialized');
  console.log('📊 Level 3 Skills: React + Hooks + Real-time APIs + State Management');
  console.log('🔗 Backend API:', 'http://localhost:3001/api');
  console.log('📱 Frontend Dev Server:', 'http://localhost:5173');
}

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  
  // Prevent the default behavior (logging to console)
  event.preventDefault();
  
  // You could show a user-friendly error message here
  if (process.env.NODE_ENV === 'development') {
    console.warn('This error was caught by the global handler');
  }
});

// Expose app info to window for debugging
if (process.env.NODE_ENV === 'development') {
  window.__PSYCHOLOGY_APP__ = {
    version: '1.0.0',
    environment: 'development',
    apiBase: 'http://localhost:3001/api',
    buildTime: new Date().toISOString(),
    features: {
      consciousness: true,
      psychology_tests: true,
      real_time_monitoring: true,
      brainwave_simulation: true,
      neural_network_viz: true
    }
  };
}
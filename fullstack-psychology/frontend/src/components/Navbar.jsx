// fullstack-psychology/frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="nav-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="nav-brand flex items-center">
            <Brain className="w-8 h-8 text-blue-400 mr-3" />
            <Link to="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              Psychology-Driven Development
            </Link>
          </div>

          {/* Navigation Menu */}
          <ul className="nav-menu flex items-center space-x-6">
            <li>
              <Link 
                to="/overview" 
                className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/overview') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Project Overview
              </Link>
            </li>
            
            <li>
              <a 
                href="/visual-psychology.html" 
                className="nav-link px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Visual Psychology
              </a>
            </li>
            
            <li>
              <a 
                href="/responsive-psychology/responsive.html" 
                className="nav-link px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Responsive Mind
              </a>
            </li>
            
            <li>
              <Link 
                to="/" 
                className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Interactive Psychology
              </Link>
            </li>
            
            <li>
              <a 
                href="http://psychology-backend.ap-south-1.elasticbeanstalk.com/demo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="nav-link px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Backend Systems
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
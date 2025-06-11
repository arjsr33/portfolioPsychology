import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <i className="fas fa-brain"></i>
          <span>Psychology-Driven Development</span>
        </div>
        <ul className="nav-menu">
          <li>
            <a href="/" className="nav-link">
              Home
            </a>
          </li>  
          <li>
            <a href="/visual-psychology.html" className="nav-link">
              Visual Psychology
            </a>
          </li>
          <li>
            <a href="/responsive-psychology/responsive.html" className="nav-link">
              Responsive Mind
            </a>
          </li>
          <li>
            <a href="/src/" className="nav-link active">
              Interactive Cognition
            </a>
          </li>
          <li>
            <a href="http://localhost:3001/demo" className="nav-link" target="_blank" rel="noopener noreferrer">
              Subconscious Systems
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
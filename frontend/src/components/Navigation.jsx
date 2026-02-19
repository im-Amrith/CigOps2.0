import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-text">Nicotine Recovery</span>
        </Link>
        
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''} 
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/quit-plan" 
              className={isActive('/quit-plan') ? 'active' : ''} 
              onClick={closeMenu}
            >
              Quit Plan
            </Link>
          </li>
          <li>
            <Link 
              to="/crisis-chat" 
              className={isActive('/crisis-chat') ? 'active' : ''} 
              onClick={closeMenu}
            >
              Crisis Chat
            </Link>
          </li>
          <li>
            <Link 
              to="/craving-log" 
              className={isActive('/craving-log') ? 'active' : ''} 
              onClick={closeMenu}
            >
              Craving Log
            </Link>
          </li>
          <li>
            <Link 
              to="/knowledge-base" 
              className={isActive('/knowledge-base') ? 'active' : ''} 
              onClick={closeMenu}
            >
              Knowledge Base
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
} 
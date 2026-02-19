import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Nicotine Recovery</h3>
          <p>
            A supportive app to help you quit nicotine and improve your health.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/quit-plan">Quit Plan</Link></li>
            <li><Link to="/crisis-chat">Crisis Chat</Link></li>
            <li><Link to="/craving-log">Craving Log</Link></li>
            <li><Link to="/knowledge-base">Knowledge Base</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Resources</h3>
          <ul className="footer-links">
            <li><a href="https://www.cdc.gov/tobacco/quit_smoking/index.htm" target="_blank" rel="noopener noreferrer">CDC Quit Smoking</a></li>
            <li><a href="https://smokefree.gov/" target="_blank" rel="noopener noreferrer">Smokefree.gov</a></li>
            <li><a href="https://www.who.int/teams/health-promotion/tobacco-control/quit-tobacco" target="_blank" rel="noopener noreferrer">WHO Quit Tobacco</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@nicotinerecovery.com</p>
          <p>Phone: 1-800-QUIT-NOW</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Nicotine Recovery. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
} 
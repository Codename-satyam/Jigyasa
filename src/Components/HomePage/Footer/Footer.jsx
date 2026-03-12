import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="retro-footer">
      {/* 8-bit Dashed border separating footer from main content */}
      <div className="footer-top-border"></div>
      
      <div className="footer-content">
        <div className="footer-left">
          <h3 className="footer-logo gold-text">JIGYASA_OS</h3>
          <p className="footer-desc">
            Empowering young heroes through interactive quests and brain-teasing trials!
          </p>
        </div>

        <div className="footer-center">
          <h4 className="footer-heading blue-text">FAST TRAVEL</h4>
          <ul className="footer-links">
            <li>
              <Link to="/"><span>&gt;</span> Base Camp</Link>
            </li>
            <li>
              <Link to="/about"><span>&gt;</span> Guild Roster</Link>
            </li>
            <li>
              <Link to="/contact"><span>&gt;</span> Support</Link>
            </li>
            <li>
              <Link to="/play/quiz-select"><span>&gt;</span> Quest Board</Link>
            </li>
          </ul>
        </div>

        <div className="footer-right">
          <h4 className="footer-heading green-text">COMMS LINK</h4>
          <div className="socials">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-btn facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-btn twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-btn instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>LEVEL 1 COMPLETE. © {new Date().getFullYear()} JIGYASA. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}

export default Footer;
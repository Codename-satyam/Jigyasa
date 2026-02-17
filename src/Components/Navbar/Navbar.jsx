import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import auth from "../../api/auth";

const Navbar = () => {
  const [user, setUser] = useState(auth.getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = () => setUser(auth.getCurrentUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    navigate('/home');
    setMenuOpen(false); // Close menu after logout
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar pixelify-sans-font">
      <div className="logo">
        <span className="logo-letter">J</span>
        <span className="logo-letter">i</span>
        <span className="logo-letter">g</span>
        <span className="logo-letter">y</span>
        <span className="logo-letter">a</span>
        <span className="logo-letter">s</span>
        <span className="logo-letter">a</span>
      </div>

      <button
        className="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
        <li><Link to="/home" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/about" onClick={closeMenu}>About</Link></li>
        <li><Link to="/play" onClick={closeMenu}>Play</Link></li>
        {/* <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li> */}
        <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
        {!user ? (
          <>
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
          </>
        ) : (
          <>
            <li>
              <span className="nav-user">Hello, {user.name}</span>
            </li>
            <li>
              <a
                href="#"
                className="nav-logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                role="button"
                aria-label="Logout"
              >
                Logout
              </a>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

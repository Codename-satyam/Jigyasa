import "./Navbar.css";
import { Link } from "react-router-dom";
const Navbar = () => {

  return (
    <nav className="navbar pixelify-sans-font">
      <div className="logo">
        <span>J</span>igyasa
      </div>
      <ul>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/quiz">Play</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;

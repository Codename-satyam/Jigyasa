import './HomePage.css';
import back from '../../Assets/back.mp4';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <video src={back} autoPlay loop muted playsInline className="background"></video>

      <div className="right">
        <div className="left">
          <h1>Welcome to Jigyasa!</h1>
          <center><p>We make Learning Fun and Engaging!</p></center>
        </div>
        <h2>What We Do</h2>
        <p>
          At <strong>Jigyasa</strong>, we make learning fun and engaging!
          Take part in quizzes across various topics — from science to pop culture —
          and challenge yourself or your friends.
        </p>

        <h3>How It Works</h3>
        <ul>
          <li>Choose your quiz category.</li>
          <li>Answer timed questions.</li>
          <li>Earn points and climb the leaderboard!</li>
        </ul>

        <div style={{display:'flex',gap:12,marginTop:12,justifyContent:'center'}}>
          <button className="pixel-button">Get Started</button>
          <Link to="/contact" className="pixel-button" style={{textDecoration:'none'}}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

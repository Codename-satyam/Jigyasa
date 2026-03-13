import './HomePage.css';
import back from '../../../Assets/back3.mp4';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page pixelify-sans-font">
      
      {/* Background Video with Dark Overlay */}
      <video src={back} autoPlay loop muted playsInline className="background-video"></video>
      <div className="video-scan-overlay"></div>

      <div className="hero-container">
        
        {/* THE WILD ANIMATED TITLE */}
        <div className="hero-title-wrapper">
          <h2 className="system-boot blue-text">SYSTEM BOOT SEQUENCE INITIATED...</h2>
          <div className="wild-hero-title">
            <span className="hero-letter">J</span>
            <span className="hero-letter">i</span>
            <span className="hero-letter">g</span>
            <span className="hero-letter">y</span>
            <span className="hero-letter">a</span>
            <span className="hero-letter">s</span>
            <span className="hero-letter">a</span>
          </div>
          <p className="hero-subtitle">WE MAKE LEARNING AN EPIC QUEST</p>
        </div>

        <div className="arcade-panels-wrapper">
          {/* Left Panel: What We Do */}
          <div className="retro-panel info-panel border-magenta">
            <div className="panel-header bg-magenta text-black">
              &gt; MISSION_BRIEFING.TXT
            </div>
            <div className="panel-body">
              <p>
                At <strong className="gold-text">Jigyasa</strong>, we make learning fun and engaging!
                Take part in trial quests across various sectors — from deep science to pop culture —
                and challenge yourself or your guildmates.
              </p>
            </div>
          </div>

          {/* Right Panel: How It Works */}
          <div className="retro-panel info-panel border-cyan">
            <div className="panel-header bg-cyan text-black">
              &gt; EXECUTE_PROTOCOL.EXE
            </div>
            <div className="panel-body">
              <ul className="hacker-list">
                <li><span className="cyan-text">[1]</span> Select your target zone (Category).</li>
                <li><span className="cyan-text">[2]</span> Defeat timed challenges.</li>
                <li><span className="cyan-text">[3]</span> Harvest EXP and dominate the leaderboard!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Arcade Call to Action */}
        <div className="cta-section">
          <h3 className="insert-coin blink-fast gold-text">INSERT COIN TO START</h3>
          
          <div className="action-buttons">
            <Link to="/play" className="pixel-btn btn-green pulse-btn">
              [ INITIALIZE PLAY ]
            </Link>
            <Link to="/contact" className="pixel-btn btn-purple">
              [ COMMS LINK ]
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HomePage;
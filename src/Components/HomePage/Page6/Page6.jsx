import { useNavigate } from 'react-router-dom';
import './Page6.css';

// Component imports
function JoinUs() {
  const navigate = useNavigate();

  return (
    <div className="join-hero-container">
      <div className="arcade-cabinet-screen">
        <div className="title-banner">
          <h1 className="pixel-title gold-text blink-slow">JOIN THE ADVENTURERS GUILD</h1>
          <p className="pixel-subtitle">A new realm of learning awaits. Are you ready to level up?</p>
        </div>

        <div className="guild-perks-grid">
          <div className="perk-card">
            <div className="perk-icon">⚔️</div>
            <h3 className="blue-text">Epic Quests</h3>
            <p>Turn boring tests into exciting challenges. Defeat quizzes to earn EXP and unlock new zones.</p>
          </div>

          <div className="perk-card">
            <div className="perk-icon">🏆</div>
            <h3 className="gold-text">Achievements</h3>
            <p>Climb the leaderboards, earn legendary badges, and show off your high scores to the realm.</p>
          </div>

          <div className="perk-card">
            <div className="perk-icon">🧙‍♂️</div>
            <h3 className="purple-text">Guild Masters</h3>
            <p>Learn from veteran mentors who design custom campaigns to help you master new skills.</p>
          </div>
        </div>

        <div className="path-selection">
          <h2 className="pixel-title-small">CHOOSE YOUR DESTINY</h2>

          <div className="action-buttons-container">
            <button
              onClick={() => navigate('/register?role=student')}
              className="pixel-btn-massive btn-green bounce-hover"
            >
              <span className="btn-icon">👾</span>
              <span className="btn-text">BECOME A PLAYER</span>
              <span className="btn-subtext">Start Learning</span>
            </button>

            <button
              onClick={() => navigate('/register?role=teacher')}
              className="pixel-btn-massive btn-blue bounce-hover"
            >
              <span className="btn-icon">📜</span>
              <span className="btn-text">BECOME A MASTER</span>
              <span className="btn-subtext">Create Quests</span>
            </button>
          </div>
        </div>

        <div className="footer-action">
          <p className="retro-text">ALREADY HAVE A SAVE FILE?</p>
          <button
            onClick={() => navigate('/login')}
            className="pixel-btn btn-dark insert-coin-btn"
          >
            [ INSERT COIN TO LOGIN ]
          </button>
        </div>

      </div>

    </div>
  );
}

export default JoinUs;
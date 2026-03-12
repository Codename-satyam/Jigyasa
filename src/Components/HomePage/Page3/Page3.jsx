import './Page3.css'; 
import { FaBookOpen, FaPuzzlePiece, FaLightbulb, FaChartBar, FaGamepad } from 'react-icons/fa';

function Page3() {
  return (
    <div className="page-3-container">
      <div className="p3-content">
        
        {/* Header Section */}
        <div className="start1 text-center mb-4">
          <h2 className="pixel-title gold-text">
            DEVELOPING <span className="blue-text">FUTURE LEADERS !!</span>
          </h2>
          
          <div className="rpg-dialogue-box intro-text-box">
            <p>
              We are a guild of passionate <span className="green-text">educators and innovators</span> dedicated to transforming the way children learn and grow. Our mission is to empower young minds with the <span className="purple-text">skills they need to thrive in an ever-changing world.</span>
            </p>
          </div>
        </div>

        {/* System Perks / Feature Cards */}
        <div className="features-grid">
          
          {/* Box 1 */}
          <div className="retro-panel feature-card">
            <div className="feature-icon bg-red">
              <FaBookOpen />
            </div>
            <h3 className="pixel-title-small red-text">Relevant Content</h3>
            <p className="pixel-text-small">
              Creativity, Attention, Problem Solving — we target the core stats that are most important for your child’s growth.
            </p>
          </div>

          {/* Box 2 */}
          <div className="retro-panel feature-card">
            <div className="feature-icon bg-gold">
              <FaPuzzlePiece />
            </div>
            <h3 className="pixel-title-small gold-text">Gamified Content</h3>
            <p className="pixel-text-small">
              Badges, Avatars, Rewards and Challenges make learning feel like an epic game while keeping your child engaged.
            </p>
          </div>

          {/* Box 3 */}
          <div className="retro-panel feature-card">
            <div className="feature-icon bg-green">
              <FaLightbulb />
            </div>
            <h3 className="pixel-title-small green-text">Adaptive Learning</h3>
            <p className="pixel-text-small">
              Children practice at their own pace. The quest difficulty automatically adjusts to their abilities as they level up.
            </p>
          </div>

          {/* Box 4 */}
          <div className="retro-panel feature-card">
            <div className="feature-icon bg-purple">
              <FaChartBar />
            </div>
            <h3 className="pixel-title-small purple-text">Progress Report</h3>
            <p className="pixel-text-small">
              Easily track your young hero's strengths and weaknesses with our rich player reporting modules.
            </p>
          </div>

          {/* Box 5 */}
          <div className="retro-panel feature-card">
            <div className="feature-icon bg-blue">
              <FaGamepad />
            </div>
            <h3 className="pixel-title-small blue-text">Productive Usage</h3>
            <p className="pixel-text-small">
              Engage your child in educational and productive activities instead of meaningless video loops and idle games.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Page3;
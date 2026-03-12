import "./Page2.css";

function Page2() {
  return (
    <div className="page-2-container">
      <div className="p2-content">
        
        {/* Header Section */}
        <div className="start1 text-center mb-4">
          <h2 className="pixel-title gold-text">
            CHOOSE YOUR PATH
            <br />
            <span className="pixel-subtitle-large blue-text">What your young heroes will gain</span>
          </h2>
          
          <div className="rpg-dialogue-box intro-text-box">
            <p>
              This training ground is designed to develop mental aptitude in young adventurers. 
              By engaging in brain-teasing quests, our mind games help enhance critical skill-sets 
              like critical thinking, problem-solving, and boundless creativity.
            </p>
          </div>
        </div>

        {/* Class Selection / Benefits Boxes */}
        <div className="class-boxes-grid">
          
          {/* Class 1: The Programmer */}
          <div className="retro-panel class-card">
            <div className="class-icon-wrapper blue-bg">
              <span className="class-icon">💻</span>
            </div>
            <h3 className="pixel-title-small blue-text">The Programmer</h3>
            <ul className="pixel-list">
              <li><span>&gt;</span> Personalized Worksheets</li>
              <li><span>&gt;</span> Daily Brain Workout</li>
              <li><span>&gt;</span> Gamified Format</li>
              <li><span>&gt;</span> Available Offline</li>
              <li><span>&gt;</span> Fun & Engaging</li>
              <li><span>&gt;</span> Track Improvement</li>
            </ul>
          </div>

          {/* Class 2: The Fixer */}
          <div className="retro-panel class-card">
            <div className="class-icon-wrapper green-bg">
              <span className="class-icon">🔧</span>
            </div>
            <h3 className="pixel-title-small green-text">The Fixer</h3>
            <ul className="pixel-list">
              <li><span>&gt;</span> Global Arena Exams (1M+ Players)</li>
              <li><span>&gt;</span> Pure Mental Ability (No Math/Science)</li>
              <li><span>&gt;</span> Legendary Certificates</li>
            </ul>
          </div>

          {/* Class 3: The Thinker */}
          <div className="retro-panel class-card">
            <div className="class-icon-wrapper purple-bg">
              <span className="class-icon">💡</span>
            </div>
            <h3 className="pixel-title-small purple-text">The Thinker</h3>
            <ul className="pixel-list">
              <li><span>&gt;</span> Creativity Enhancement</li>
              <li><span>&gt;</span> Personality Level-Up Prog.</li>
              <li><span>&gt;</span> Bard Skills (Dance & Music)</li>
              <li><span>&gt;</span> Artisan Skills (Art & Craft)</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Page2;
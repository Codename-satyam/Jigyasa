import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="retro-container">
      {/* Overlay to create the old-school TV/Monitor look */}
      <div className="scanlines"></div>
      
      <div className="content">
        <h1 className="glitch" data-text="404">404</h1>
        <h2 className="pixel-text">GAME OVER</h2>
        <p className="pixel-text small">
          The page you are looking for has been moved to another castle.
        </p>
        
        <a href="/" className="retro-btn">
          INSERT COIN TO CONTINUE
        </a>
      </div>
    </div>
  );
};

export default NotFound;
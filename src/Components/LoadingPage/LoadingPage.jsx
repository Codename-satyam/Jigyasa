import React, { useState, useEffect } from "react";
import "./LoadingPage.css";

function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INSERT COIN...");

  useEffect(() => {
    // Fun, game-themed loading phrases
    const texts = [
      "LOADING ASSETS...",
      "RETICULATING SPLINES...",
      "GENERATING LEVELS...",
      "POWERING UP...",
    ];
    let textIndex = 0;

    // Cycle through text every 800ms
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      if (progress < 100) {
        setLoadingText(texts[textIndex]);
      }
    }, 800);

    // Simulate progress filling up unpredictably
    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        const jump = Math.floor(Math.random() * 15) + 5; // Jump by 5-20%
        const newProgress = oldProgress + jump;
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setLoadingText("PRESS START");
          return 100;
        }
        return newProgress;
      });
    }, 400);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [progress]);

  return (
    <div className="retro-loading-page pixelify-sans-font">
      <div className="retro-loading-content">
        
        {/* Bouncing pixel character */}
        <div className="sprite-container">
          <div className="pixel-sprite"></div>
        </div>

        <h1 className="loading-title">{loadingText}</h1>
        
        {/* 8-bit style progress bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="progress-percentage">{progress}%</p>
      </div>
    </div>
  );
}

export default LoadingPage;
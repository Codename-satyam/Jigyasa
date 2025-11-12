import { useState, useRef, useEffect } from 'react';
import './Landing.css';
import background from '../../Assets/back2.jpg';
import button from '../../Assets/buttn.png';
import gear2 from '../../Assets/gear2.jpg';
import note from '../../Assets/music.jpg';   
import note1 from '../../Assets/music1.jpg';  
import music from '../../Assets/back-music.mp3';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const audioRef = useRef(new Audio(music));
  const [isPlaying, setIsPlaying] = useState(true); 


  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.log("Autoplay blocked, user must interact first:", err);
    });
    return () => audio.pause(); 
  }, []);

  const handleStartClick = () => {
    navigate('/home');
  };

  const handleNoteClick = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="landing-page">
      <img src={background} alt="Background" className="background-image" />

      <div className="button">
        <img src={button} alt="Start Quiz" className="start-quiz-image" onClick={handleStartClick} />
      </div>
      <div className="gear-image-container">
        <img src={gear2} alt="Gear" className="gear-image" />
      </div>

      <div className="note-image-container">
        <img
          src={isPlaying ? note : note1}
          alt="Note"
          className="note-image"
          onClick={handleNoteClick}
        />
      </div>
    </div>
  );
};

export default Landing;

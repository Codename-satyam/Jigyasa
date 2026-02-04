import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const SettingClick = () => {
    navigate('/settings');
  }

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

      <motion.div
        className="button"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <motion.img
          src={button}
          alt="Start Quiz"
          className="start-quiz-image"
          onClick={handleStartClick}
          whileHover={{ scale: 1.1, rotate: [0, -2, 2, -2, 0] }}
          whileTap={{ scale: 0.95 }}
        />
      </motion.div>
      <motion.div
        className="gear-image-container"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.img
          src={gear2}
          alt="Gear"
          className="gear-image"
          onClick={SettingClick}
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>

      <motion.div
        className="note-image-container"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.img
          src={isPlaying ? note : note1}
          alt="Note"
          className="note-image"
          onClick={handleNoteClick}
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
          whileTap={{ scale: 0.9 }}
        />
      </motion.div>
    </div>
  );
};

export default Landing;

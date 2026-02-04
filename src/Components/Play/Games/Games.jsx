import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Games.css";

function Games() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="games-page">
      <motion.div
        className="games-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h2
          className="games-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          🎮 GAMES
        </motion.h2>
        <motion.p
          className="games-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Select a game to play
        </motion.p>

        <motion.div
          className="games-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="button"
            className="game-card featured"
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/play/games/g1")}
          >
            🧠 Memory Card Game
            <span>Test your focus & memory</span>
          </motion.button>

          <motion.button
            type="button"
            className="game-card"
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/play/games/g2")}
          >
            Guess the Guy
            <span>Who do you think is behind ?</span>
          </motion.button>

          <motion.button
            type="button"
            className="game-card"
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/play/games/g3")}
          >
            🐍 Snake Game
            <span>Retro survival challenge</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Games;

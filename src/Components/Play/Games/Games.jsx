import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThreeDBackground from "./ThreeDBackground";
import "./Games.css";

function Games() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <>
      <ThreeDBackground />
      <div className="games-page">
        <motion.div
          className="games-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="games-title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            SELECT YOUR GAME
          </motion.h1>
          <motion.p
            className="games-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Choose a challenge and test your skills
          </motion.p>

          <motion.div
            className="games-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              type="button"
              className="game-card card-featured"
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/play/games/g1")}
            >
              <div className="card-icon">🧠</div>
              <div className="card-content">
                <h3>Memory Card Game</h3>
                <p>Test your focus & memory</p>
              </div>
              <div className="card-badge">LEVEL 1</div>
            </motion.button>

            <motion.button
              type="button"
              className="game-card card-medium"
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/play/games/g2")}
            >
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <h3>Guess the Guy</h3>
                <p>Who's hiding from you?</p>
              </div>
              <div className="card-badge">LEVEL 2</div>
            </motion.button>

            <motion.button
              type="button"
              className="game-card card-hard"
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/play/games/g3")}
            >
              <div className="card-icon">🏛️</div>
              <div className="card-content">
                <h3>What is this wonder</h3>
                <p>Name the Monument</p>
              </div>
              <div className="card-badge">LEVEL 3</div>
            </motion.button>
            <motion.button
              type="button"
              className="game-card card-extreme"
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/play/games/g4")}
            >
              <div className="card-icon">➕</div>
              <div className="card-content">
                <h3>Math-A-Magic</h3>
                <p>Are you a Wizard of Maths ??</p>
              </div>
              <div className="card-badge">LEVEL 4</div>
            </motion.button>
            <motion.button
              type="button"
              className="game-card card-mythic"
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/play/games/g5")}
            >
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <h3>Game 5</h3>
                <p>Upr wala hi baachaye ab</p>
              </div>
              <div className="card-badge">LEVEL 5</div>
            </motion.button>
             <motion.button
              type="button"
              className="game-card card-chickchick"
              variants={cardVariants}
              whileHover={{ scale: 1.08, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/play/games/g4")}
            >
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <h3>Game 6</h3>
                <p>Upr wala hi baachaye ab</p>
              </div>
              <div className="card-badge">LEVEL 6</div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export default Games;

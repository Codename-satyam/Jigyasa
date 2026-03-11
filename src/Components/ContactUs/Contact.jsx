import React, { useState } from 'react';
import './Contact.css';

const RPGContact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [dialogue, setDialogue] = useState("Greetings, traveler. Do you require the services of the guild? Fill out your manifest to proceed.");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (field) => {
    const dialogues = {
      name: "Ah, your name! We must know who we are dealing with before accepting a quest.",
      email: "A magical routing address? Excellent. We shall send our messenger owls there.",
      message: "Speak your mind! What grand adventure or inquiry brings you to our tavern?"
    };
    setDialogue(dialogues[field]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDialogue("Quest accepted! Your message has been sent into the aether.");
    setFormData({ name: '', email: '', message: '' });
    
    // Reset dialogue after a few seconds
    setTimeout(() => {
      setDialogue("Is there anything else you need, traveler?");
    }, 4000);
  };

  // Calculate "Mana" (form completion progress)
  const calculateMana = () => {
    let score = 0;
    if (formData.name.length > 2) score += 33.3;
    if (formData.email.includes('@')) score += 33.3;
    if (formData.message.length > 10) score += 33.4;
    return score;
  };

  return (
    <div className="rpg-container">
      <div className="game-screen">
        
        {/* Top HUD: Stats and Quest Info */}
        <div className="hud">
          <div className="hud-panel">
            <h3>QUEST: SEND MESSAGE</h3>
            <div className="stat-bar-container">
              <span>MANA (Readiness)</span>
              <div className="stat-bar-bg">
                <div 
                  className="stat-bar-fill blue" 
                  style={{ width: `${calculateMana()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* The "Play Area" / Form */}
        <div className="play-area">
          <form onSubmit={handleSubmit} className="rpg-form">
            <div className="inventory-slot">
              <label>NAME_SCROLL</label>
              <input 
                type="text" name="name" 
                value={formData.name} onChange={handleChange}
                onFocus={() => handleFocus('name')}
                required autoComplete="off"
              />
            </div>
            
            <div className="inventory-slot">
              <label>ROUTING_GEM (EMAIL)</label>
              <input 
                type="email" name="email" 
                value={formData.email} onChange={handleChange}
                onFocus={() => handleFocus('email')}
                required autoComplete="off"
              />
            </div>

            <div className="inventory-slot large">
              <label>TOME_OF_MESSAGE</label>
              <textarea 
                name="message" rows="4" 
                value={formData.message} onChange={handleChange}
                onFocus={() => handleFocus('message')}
                required 
              ></textarea>
            </div>

            <button 
              type="submit" 
              className={`cast-spell-btn ${calculateMana() > 99 ? 'ready' : ''}`}
              disabled={calculateMana() < 99}
            >
              [ CAST: SEND_MESSAGE ]
            </button>
          </form>
        </div>

        {/* Classic JRPG Dialogue Box */}
        <div className="dialogue-box">
          <div className="npc-portrait">
            {/* You can easily swap this div out for your own 8-bit pixel art `img` tag */}
            <div className="pixel-sprite"></div>
          </div>
          <div className="dialogue-text">
            <p className="npc-name">Guildmaster</p>
            <p className="type-effect">{dialogue}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RPGContact;
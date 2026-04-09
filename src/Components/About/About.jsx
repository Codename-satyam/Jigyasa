import React, { useState } from "react";
import satyam from '../../Assets/about_videos/satyam[1].mp4';
import siddarth from '../../Assets/about_videos/sidh.mp4';
import yashvi from '../../Assets/about_videos/yash[1].mp4';
import rabindra from '../../Assets/about_videos/rabindra.mp4';
import Prashant from '../../Assets/about_videos/prashant.mp4';
import Sanjay from '../../Assets/about_videos/sanjay.mp4';

import "./About.css";

const teamMembers = [
    {
        name: "Satyam Anand",
        role: "Full Stack Engineer",
        icon: "⚙️",
        video: satyam,
        color: "#00f0ff", // Converted to hex for dynamic glowing
        stats: { hp: 1200, mp: 850 },
        powers: [
            { name: "Full-Stack Strike", desc: "Connects frontend & backend for a devastating combo." },
            { name: "State Management", desc: "Restores party balance by clearing corrupted data." }
        ]
    },
    {
        name: "Prashant Bharadwaj",
        role: "Backend Developer",
        icon: "🔧",
        video: Prashant,
        color: "#39ff14",
        stats: { hp: 1500, mp: 600 },
        powers: [
            { name: "Query Smash", desc: "Executes heavy database queries to crush latency." },
            { name: "API Barrier", desc: "Casts an impenetrable shield of secure endpoints." }
        ]
    },
    {
        name: "Siddarth Singh",
        role: "Data Science Engineer",
        icon: "📊",
        video: siddarth,
        color: "#b000ff",
        stats: { hp: 1000, mp: 1200 },
        powers: [
            { name: "Algorithmic Prediction", desc: "Reads enemy movements using advanced ML models." },
            { name: "Data Cleansing", desc: "Purges debuffs and null values from the party." }
        ]
    },
    {
        name: "Yashvi Chaturvedi",
        role: "Data Science Engineer",
        icon: "📈",
        video: yashvi,
        color: "#ffd700",
        stats: { hp: 950, mp: 1300 },
        powers: [
            { name: "Visualization Beam", desc: "Blinds foes with complex, high-res data charts." },
            { name: "Pattern Recognition", desc: "Automatically targets the weakest point in any architecture." }
        ]
    },
    {
        name: "Sanjay Srivastav",
        role: "AI/ML Integrator",
        icon: "🤖",
        video: Sanjay,
        color: "#ff003c",
        stats: { hp: 1100, mp: 1500 },
        powers: [
            { name: "Neural Network", desc: "Summons AI drones for continuous passive damage." },
            { name: "Deep Learning", desc: "Adapts to enemy attacks, gaining EXP exponentially." }
        ]
    },
    {
        name: "Rabindra Nahak",
        role: "Cloud Engineer",
        icon: "☁️",
        video: rabindra,
        color: "#00ffff",
        stats: { hp: 1800, mp: 900 },
        powers: [
            { name: "Serverless Surge", desc: "Rains down auto-scaling server pods on the battlefield." },
            { name: "Load Balance", desc: "Distributes enemy damage evenly, reducing total impact." }
        ]
    }
];

function About() {
    const [flippedIndex, setFlippedIndex] = useState(null);

    const handleCardClick = (index) => {
        // Toggle the flip state. If clicking the already flipped card, it un-flips.
        setFlippedIndex(flippedIndex === index ? null : index);
    };

    const handleMouseEnter = (e) => {
        e.target.play().catch(err => console.log('Video play error:', err));
    };

    const handleMouseLeave = (e) => {
        e.target.pause();
    };

    return (
        <div className="holo-about-page">
            <div className="holo-background-grid"></div>
            
            <header className="holo-header">
                <h1 className="holo-title">THE JIGYASA GUILD</h1>
                <p className="holo-subtitle">Select a holographic card to view agent specifications.</p>
                <div className="holo-mission-box">
                    <p>
                        Jigyasa is a playful learning app that transforms quizzes into an exciting adventure. Built by a guild of six passionate developers, Jigyasa aims to create a platform where curiosity meets creativity.
                    </p>
                </div>
            </header>

            <div className="tcg-grid">
                {teamMembers.map((member, idx) => {
                    const isFlipped = flippedIndex === idx;

                    return (
                        <div 
                            key={idx} 
                            className="tcg-card-scene"
                            style={{ '--theme-color': member.color }}
                        >
                            <div className={`tcg-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                                
                                {/* --- FRONT OF CARD --- */}
                                <div className="tcg-card-front" onClick={() => handleCardClick(idx)}>
                                    <div className="tcg-card-glare"></div>
                                    <div className="tcg-video-wrapper">
                                        <video
                                            src={member.video}
                                            muted
                                            loop
                                            className="tcg-video"
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        />
                                        <div className="tcg-hover-hint">HOVER TO PLAY • CLICK TO FLIP</div>
                                    </div>
                                    
                                    <div className="tcg-card-footer">
                                        <div className="tcg-icon-ring">{member.icon}</div>
                                        <div className="tcg-name-plate">
                                            <h3>{member.name}</h3>
                                            <span>{member.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* --- BACK OF CARD (STATS & POWERS) --- */}
                                <div className="tcg-card-back" onClick={() => handleCardClick(idx)}>
                                    <div className="tcg-back-header">
                                        <span className="tcg-back-icon">{member.icon}</span>
                                        <h4>{member.role.toUpperCase()}</h4>
                                    </div>

                                    <div className="tcg-stats-container">
                                        <div className="tcg-stat-bar">
                                            <div className="stat-label">HP <span className="stat-val">{member.stats.hp}</span></div>
                                            <div className="stat-track">
                                                <div className="stat-fill hp-fill" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                        <div className="tcg-stat-bar">
                                            <div className="stat-label">MP <span className="stat-val">{member.stats.mp}</span></div>
                                            <div className="stat-track">
                                                <div className="stat-fill mp-fill" style={{ width: '70%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tcg-powers-container">
                                        <div className="powers-title">SPECIAL ABILITIES</div>
                                        {member.powers.map((power, i) => (
                                            <div key={i} className="tcg-power">
                                                <div className="power-name">✦ {power.name}</div>
                                                <div className="power-desc">{power.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="tcg-flip-back-hint">CLICK TO RETURN</div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default About;
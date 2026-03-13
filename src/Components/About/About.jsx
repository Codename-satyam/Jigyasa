import { useRef, useState } from "react";
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
        color: "blue",
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
        color: "green",
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
        color: "purple",
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
        color: "gold",
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
        color: "red",
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
        color: "cyan",
        stats: { hp: 1800, mp: 900 },
        powers: [
            { name: "Serverless Surge", desc: "Rains down auto-scaling server pods on the battlefield." },
            { name: "Load Balance", desc: "Distributes enemy damage evenly, reducing total impact." }
        ]
    },
];

function About() {
    const screenRef = useRef(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isScreenOn, setIsScreenOn] = useState(true);

    const onOff = () => {
        setIsScreenOn((currentValue) => !currentValue);
        setSelectedMember(null);
    };

    const scrollUp = () => {
        if (!isScreenOn) {
            return;
        }

        if (screenRef.current) {
            screenRef.current.scrollBy({ top: -150, behavior: "smooth" });
        }
    };

    const scrollDown = () => {
        if (!isScreenOn) {
            return;
        }

        if (screenRef.current) {
            screenRef.current.scrollBy({ top: 150, behavior: "smooth" });
        }
    };

    const toggleMemberInfo = (index) => {
        setSelectedMember(selectedMember === index ? null : index);
    };

    const openModal = (index) => {
        if (!isScreenOn) {
            return;
        }

        setSelectedMember(index);
    };

    const closeModal = () => {
        setSelectedMember(null);
    };

    const handleMouseEnter = (e) => {
        e.target.play().catch(err => console.log('Video play error:', err));
    };

    const handleMouseLeave = (e) => {
        e.target.pause();
    };

    return (
        <div className="about-page">
            <div className="retro-pc-setup">

                <div className="pc-monitor-bezel">
                    <div className="pc-monitor-screen">

                        <div
                            className={`screen-content-wrapper ${isScreenOn ? '' : 'screen-off'}`.trim()}
                            ref={screenRef}
                        >

                            <div className="about-header text-center">
                                <h1 className="pixel-title gold-text">SYSTEM DIRECTORY</h1>
                                <p className="pixel-subtitle blue-text mt-2">C:\JIGYASA\ROSTER.EXE</p>
                            </div>

                            <div className="rpg-dialogue-box">
                                <h2 className="pixel-title-small green-text text-center">ABOUT JIGYASA</h2>
                                <p className="text-center">
                                    Jigyasa is a playful learning app that transforms quizzes into an exciting adventure. Designed to make learning fun and interactive, it blends knowledge with game-like challenges that keep users engaged and motivated. Built by a guild of six passionate developers, Jigyasa aims to create a platform where curiosity meets creativity, encouraging learners to test their knowledge, explore new ideas, and enjoy the process of learning.
                                </p>
                            </div>

                            <h2 className="pixel-title text-center mt-4 mb-4 blink-slow">SELECT YOUR FIGHTER</h2>

                            {/* SYMMETRICAL 3x2 GRID */}
                            <div className="roster-grid">
                                {teamMembers.map((member, idx) => (
                                    <div
                                        key={idx}
                                        className={`roster-card border-${member.color}`}
                                        onClick={() => openModal(idx)}
                                    >
                                        <div className="video-container">
                                            <video
                                                src={member.video}
                                                muted
                                                loop
                                                className="roster-video"
                                                onMouseEnter={handleMouseEnter}
                                                onMouseLeave={handleMouseLeave}
                                            />
                                            <div className="video-overlay">HOVER TO INITIALIZE</div>
                                        </div>

                                        <div className="card-info text-center">
                                            <span className="member-icon">{member.icon}</span>
                                            <span className="member-name block mt-2">{member.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* IN-SCREEN MODAL (FIGHTER STATS) */}
                            {selectedMember !== null && (
                                <div className="in-screen-modal-overlay">
                                    <div className={`in-screen-modal-content border-${teamMembers[selectedMember].color}`}>
                                        <button className="close-modal-btn" onClick={closeModal}>[ X ]</button>

                                        <div className="modal-split">

                                            {/* Left: Video & Stats */}
                                            <div className="modal-video-side">
                                                <video
                                                    src={teamMembers[selectedMember].video}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    className="modal-video"
                                                />
                                                <div className="fighter-stats p-2">
                                                    <div className="stat-row">
                                                        <span className="stat-label">HP</span>
                                                        <div className="stat-bar-bg">
                                                            <div className="stat-bar-fill bg-hp" style={{ width: '80%' }}></div>
                                                        </div>
                                                        <span className="stat-num">{teamMembers[selectedMember].stats.hp}</span>
                                                    </div>
                                                    <div className="stat-row mt-2">
                                                        <span className="stat-label">MP</span>
                                                        <div className="stat-bar-bg">
                                                            <div className="stat-bar-fill bg-mp" style={{ width: '65%' }}></div>
                                                        </div>
                                                        <span className="stat-num">{teamMembers[selectedMember].stats.mp}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Powers & Commands */}
                                            <div className="modal-info-side">
                                                <div className="modal-icon">{teamMembers[selectedMember].icon}</div>
                                                <h2 className="pixel-title-small mt-2">
                                                    {teamMembers[selectedMember].name}
                                                </h2>
                                                <h3 className={`role-badge bg-${teamMembers[selectedMember].color} mt-2 mb-4`}>
                                                    CLASS: {teamMembers[selectedMember].role.toUpperCase()}
                                                </h3>

                                                <div className="command-list">
                                                    <h4 className="gold-text mb-2">COMMAND LIST (SPECIALS)</h4>
                                                    {teamMembers[selectedMember].powers.map((power, i) => (
                                                        <div key={i} className="power-item">
                                                            <span className={`power-name text-${teamMembers[selectedMember].color}`}>
                                                                ▶ {power.name}
                                                            </span>
                                                            <p className="power-desc">{power.desc}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Hardware branding & buttons on the monitor */}
                    <div className="monitor-hardware-bottom">
                        <div className="monitor-logo">JIGYASA_TRON 2000</div>
                        <div className="monitor-buttons">
                            <div className="pwr-btn"></div>
                            <div
                                className={`on-off ${isScreenOn ? 'is-on' : 'is-off'}`}
                                onClick={onOff}
                                role="button"
                                aria-label={isScreenOn ? 'Turn screen off' : 'Turn screen on'}
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        onOff();
                                    }
                                }}
                            ></div>
                            <div className="menu-btn" onClick={scrollUp}></div>
                            <div className="menu-btn" onClick={scrollDown}></div>
                        </div>
                    </div>
                </div>

                {/* PC STAND */}
                <div className="pc-stand-neck"></div>
                <div className="pc-stand-base"></div>

            </div>
        </div>
    );
}

export default About;
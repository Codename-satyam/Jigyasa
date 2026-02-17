import { useRef, useState } from "react";
import satyam from '../../Assets/about_videos/satyam[1].mp4';
import siddarth from '../../Assets/about_videos/sidh.mp4';
import yashvi from '../../Assets/about_videos/yash[1].mp4';
import rabindra from '../../Assets/about_videos/rabindra.mp4';
import Prashant from '../../Assets/about_videos/prashant.mp4';

import "./About.css";

const teamMembers = [
    { name: "Satyam Anand", role: "Full Stack Engineer", icon: "⚙️" },
    { name: "Prashant Bharadwaj", role: "Backend Developer", icon: "🔧" },
    { name: "Siddarth Singh", role: "Data Science Engineer", icon: "📊" },
    { name: "Yashvi Chaturvedi", role: "Data Science Engineer", icon: "📈" },
    { name: "Sanjay Srivastav", role: "AI/ML Integrator", icon: "🤖" },
    { name: "Rabindra Nahak", role: "Cloud Engineer", icon: "☁️" },
];

function About() {
    const screenRef = useRef(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [hoveredBox, setHoveredBox] = useState(null);

    const scrollUp = () => {
        if (screenRef.current) {
            screenRef.current.scrollBy({
                top: -80,
                behavior: "smooth",
            });
        }
    };

    const scrollDown = () => {
        if (screenRef.current) {
            screenRef.current.scrollBy({
                top: 80,
                behavior: "smooth",
            });
        }
    };

    const toggleMemberInfo = (index) => {
        setSelectedMember(selectedMember === index ? null : index);
    };

    return (
        <div className="about-page">
            <div className={`floating-box box-1 ${hoveredBox === 0 ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredBox(0)}
                onMouseLeave={() => setHoveredBox(null)}>
                <video src={satyam} autoPlay loop muted className="about-video" />
                <div className="box-label">Satyam</div>
            </div>
            <div className={`floating-box box-2 ${hoveredBox === 1 ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredBox(1)}
                onMouseLeave={() => setHoveredBox(null)}>
                <video src={siddarth} autoPlay loop muted className="about-video" />
                <div className="box-label">Siddarth</div>
            </div>
            <div className={`floating-box box-3 ${hoveredBox === 2 ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredBox(2)}
                onMouseLeave={() => setHoveredBox(null)}>
                <video src={yashvi} autoPlay loop muted className="about-video" />
                <div className="box-label">Yashvi</div>
            </div>
            <div className={`floating-box box-4 ${hoveredBox === 3 ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredBox(3)}
                onMouseLeave={() => setHoveredBox(null)}>
                <video src={rabindra} autoPlay loop muted className="about-video" />
                <div className="box-label">Rabindra</div>
            </div>
            <div className={`floating-box box-5 ${hoveredBox === 4 ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredBox(4)}
                onMouseLeave={() => setHoveredBox(null)}>
                <video src={Prashant} autoPlay loop muted className="about-video" />
                <div className="box-label">Prashant</div>
                <div className="box-pulse"></div>
            </div>

            <div className="about-gameboy">
                <div className="about-gb-top">
                    <div className="about-gb-power" />
                    <div className="about-gb-speaker" />
                </div>

                <div className="about-gb-screen">
                    <div className="about-screen-inner" ref={screenRef}>
                        <h2 className="screen-title">About Quizy</h2>
                        <p className="screen-description">
                            Quizy is a playful learning app that makes quizzes feel like a
                            game. It uses bright challenges, friendly feedback, and simple
                            progression to keep kids engaged built by a team of six passionate
                            developers.
                        </p>
                        <div className="team-display">
                            {teamMembers.map((member, idx) => (
                                <div
                                    key={idx}
                                    className={`team-member-item ${selectedMember === idx ? 'expanded' : ''}`}
                                    onClick={() => toggleMemberInfo(idx)}
                                >
                                    <span className="member-icon">{member.icon}</span>
                                    <span className="member-name">{member.name}</span>
                                    {selectedMember === idx && (
                                        <span className="member-role">{member.role}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="about-gb-controls">
                    <div className="about-dpad">
                        <div className="about-dpad-row">
                            <div className="about-btn up" onClick={scrollUp} title="Scroll Up" />
                        </div>
                        <div className="about-dpad-row">
                            <div className="about-btn left" />
                            <div className="about-btn center" />
                            <div className="about-btn right" />
                        </div>
                        <div className="about-dpad-row">
                            <div className="about-btn down" onClick={scrollDown} title="Scroll Down" />
                        </div>
                    </div>

                    <div className="about-action-buttons">
                        <div className="about-action a" onClick={scrollUp} title="Scroll Up">
                            X
                        </div>
                        <div className="about-action b" onClick={scrollDown} title="Scroll Down">
                            Y
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;

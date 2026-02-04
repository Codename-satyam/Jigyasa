import React, { useRef } from "react";
import "./About.css";

function About() {
    const screenRef = useRef(null);

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

    return (
        <div className="about-page">
            <div className="about-gameboy">
                <div className="about-gb-top">
                    <div className="about-gb-power" />
                    <div className="about-gb-speaker" />
                </div>

                <div className="about-gb-screen">
                    <div className="about-screen-inner" ref={screenRef}>
                        <h2>About Quizy</h2>
                        <p>
                            Quizy is a playful learning app that makes quizzes feel like a
                            game. It uses bright challenges, friendly feedback, and simple
                            progression to keep kids engaged built by a team of six passionate
                            developers.
                        </p>
                        <ul>
                            <li>Satyam Anand - Full Stack Engineer</li>
                            <li>Prashant Bharadwaj - Backend Developer</li>
                            <li>Siddarth Singh - Data Science Engineer</li>
                            <li>Yashvi Chaturvedi - Data Science Engineer</li>
                            <li>Sanjay Srivastav - AI/ML Integrator</li>
                            <li>Rabindra Nahak - Cloud Engineer</li>
                        </ul>
                    </div>
                </div>

                <div className="about-gb-controls">
                    <div className="about-dpad">
                        <div className="about-dpad-row">
                            <div className="about-btn up" />
                        </div>
                        <div className="about-dpad-row">
                            <div className="about-btn left" />
                            <div className="about-btn center" />
                            <div className="about-btn right" />
                        </div>
                        <div className="about-dpad-row">
                            <div className="about-btn down" />
                        </div>
                    </div>

                    <div className="about-action-buttons">
                        <div className="about-action a" onClick={scrollUp}>
                            X
                        </div>
                        <div className="about-action b" onClick={scrollDown}>
                            Y
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;

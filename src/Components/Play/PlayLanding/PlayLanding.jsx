import React, { useEffect, useState } from 'react';
import './PlayLanding.css';
import { Link } from 'react-router-dom';
import { FaBook, FaGamepad, FaQuestionCircle } from 'react-icons/fa';

function PlayLanding() {
    const [quote, setQuote] = useState("");
    const [typing, setTyping] = useState("");

    useEffect(() => {
        let mounted = true;
        const localQuotes = [
            "Curiosity is like a treasure map that leads you on exciting adventures. Even when the path gets tricky, keep exploring with an open heart and mind, because every question you ask brings you closer to discovering something wonderful.",
            "When you face difficulties, remember that resilience is your superpower. It’s the strength to stand up after falling and the courage to keep asking questions. Curiosity and resilience together help you learn, grow, and unlock your greatest potential in life.",
            "Never stop wondering about the world around you. Even if you find things hard or confusing, be brave enough to ask why and how. With patience and persistence, your curiosity will turn obstacles into stepping stones on your journey of discovery.",
            "Sometimes learning feels like climbing a mountain, hard but rewarding. Use your curiosity to explore every path and your resilience to keep going when it gets steep. Every step you take teaches you new things and makes you stronger and wiser.",
            "Imagine your mind as a garden where curiosity plants seeds and resilience waters them every day. Together, they help you grow into a creative thinker and problem solver, ready to face challenges with excitement and confidence in your abilities.",
            "Curiosity is the spark that lights up your imagination, while resilience is the fuel that keeps it burning during tough times. When you blend both, you create a powerful force that helps you learn from mistakes and keep moving towards your dreams.",
            "Each time you ask a question or try again after failing, you practice resilience. Your curiosity leads you to explore new ideas and your resilience helps you bounce back stronger, turning setbacks into lessons on your exciting path to success.",
            "The world is full of mysteries waiting for curious minds like yours to solve. When you encounter challenges, use resilience as your shield and curiosity as your sword to uncover answers and create new possibilities with every step you take.",
            "Curiosity makes learning an adventure filled with wonder and excitement. Resilience gives you the courage to keep exploring even when things get tough. Together, they help you discover that challenges are just chances to grow stronger and wiser.",
            "Asking questions helps you understand the world better, and resilience helps you keep going even when answers are hard to find. With these traits, you can turn every problem into an opportunity for discovery and make learning a lifelong journey.",
            "When you don’t know the answer, be curious and ask more questions. When things don’t go as planned, be resilient and try again. Combining curiosity and resilience makes you unstoppable in your quest for knowledge and success.",
            "Curiosity is the key that unlocks doors to new ideas, while resilience is the strength to open those doors again and again. Together, they help you grow into a confident learner who sees challenges as exciting opportunities to discover and improve.",
            "Every mistake you make is a chance to learn something new. Use your curiosity to understand what went wrong and your resilience to keep going without giving up. This way, you turn every obstacle into a stepping stone toward your dreams.",
            "Resilience helps you bounce back when things get hard, and curiosity leads you to ask valuable questions that open up new worlds. With these qualities, you can face any challenge with a positive attitude and find joy in learning every day.",
            "Curiosity and resilience are like best friends that help you grow. Curiosity helps you explore and ask questions, and resilience helps you keep trying when things are difficult. Together, they make your learning journey exciting, joyful, and full of wonder."
        ];

        if (mounted) {
            const q = localQuotes[Math.floor(Math.random() * localQuotes.length)];
            setQuote(q);
            setTyping("");
        }

        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!quote) return;

        let index = -1;
        const interval = setInterval(() => {
            setTyping(prev => prev + quote.charAt(index));
            index++;

            if (index >= quote.length) {
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [quote]);

    return (
        <div className="play-landing">
            <header className="pl-header">
                <h1 className="pl-title">Play</h1>
                <p className="pl-sub"> "{typing}"</p>
            </header>

            <div className="pl-grid">
                <Link to="/courses" className='pl-card' aria-label='Courses'>
                    <div className="pl-icon"><FaBook /></div>
                    <div className="pl-label">Courses</div>
                </Link>

                <Link to="/games" className="pl-card" aria-label="Games">
                    <div className="pl-icon"><FaGamepad /></div>
                    <div className="pl-label">Games</div>
                </Link>

                <Link to="/play/quiz-select" className="pl-card" aria-label="Quiz">
                    <div className="pl-icon"><FaQuestionCircle /></div>
                    <div className="pl-label">Quiz</div>
                </Link>
            </div>
        </div>
    );
}

export default PlayLanding;

import "./SubjectCards.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import data from "../data.js";
import ThreeDBackground from "../../Games/ThreeDBackground.jsx";
import { getSubjectProgress } from "../../../../api/progressTracker.js";

function SubjectCards(){

const[selectedSubject, setSelectedSubject] = useState(null);
const[progress, setProgress] = useState({});
const navigate = useNavigate();

const subjects = useMemo(() => Object.keys(data), []);

useEffect(() => {
    // Calculate progress for all subjects
    const progressData = {};
    subjects.forEach(subject => {
        const topicsData = data[subject] || [];
        progressData[subject] = getSubjectProgress(subject, topicsData.length, topicsData);
    });
    setProgress(progressData);
}, [subjects]);

const handleCardClick = (subject) => {
    setSelectedSubject(subject);
    navigate(`/videos/subject/${subject}`);
};


    return(
        <>
        <ThreeDBackground />
        <div className="Subject-container">
            {subjects.map(subject => (
                <button
                    key={subject}
                    className="Subject-card"
                    onClick={() => handleCardClick(subject)}
                >
                    <div className="Subject-card-content">
                        <div className="Subject-card-icon">📚</div>
                        <span className="Subject-card-text">{subject}</span>
                        {progress[subject] && progress[subject].total > 0 && (
                            <div className="Subject-progress">
                                <div className="Progress-bar-container">
                                    <div 
                                        className="Progress-bar-fill" 
                                        style={{ width: `${progress[subject].percentage}%` }}
                                    ></div>
                                </div>
                                <span className="Progress-text">
                                    {progress[subject].percentage}% • {progress[subject].completed}/{progress[subject].total}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="Subject-card-glow"></div>
                </button>
            ))}
        </div>
        </>
    )
}
export default SubjectCards;
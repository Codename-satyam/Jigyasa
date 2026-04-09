import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaBookmark, FaPlay, FaArrowLeft } from 'react-icons/fa';
import data from '../../data.js';
import { getTopicProgress, getLastViewedTopic } from '../../../../../api/progressTracker.js';
import './TopicSelector.css';

function TopicSelector() {
    const { subject } = useParams();
    const navigate = useNavigate();
    const [topicProgress, setTopicProgress] = useState({});
    const [lastViewed, setLastViewed] = useState(null);

    const topicsForSubject = useMemo(() => data[subject] || [], [subject]);
    
    // Format subject string for the header (e.g., "maths" -> "Maths")
    const formattedSubject = useMemo(() => {
        if (!subject) return "Subject";
        return subject.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }, [subject]);

    useEffect(() => {
        const progressData = {};
        topicsForSubject.forEach((topic, index) => {
            progressData[index] = getTopicProgress(subject, index, 1);
        });
        setTopicProgress(progressData);

        const last = getLastViewedTopic(subject);
        setLastViewed(last);
    }, [subject, topicsForSubject]);

    const handleCardClick = (index) => {
        navigate(`/videos/subject/${subject}/topic/${index}`);
    };

    return (
        <div className="topic-selector-root">
            <div className="topic-header-banner">
                <Link to="/courses" className="back-link">
                    <FaArrowLeft /> Back to Courses
                </Link>
                <h1 className="subject-title">{formattedSubject} Modules</h1>
                <p className="subject-subtitle">Select a topic below to continue your learning journey.</p>
            </div>

            <div className="topic-grid-container">
                {topicsForSubject.length > 0 ? (
                    <div className="topics-grid">
                        {topicsForSubject.map((topic, index) => {
                            const progress = topicProgress[index];
                            const isLastViewed = lastViewed === index;
                            const isCompleted = progress?.percentage === 100;

                            return (
                                <div
                                    key={index}
                                    className={`topic-card ${isLastViewed ? 'is-highlighted' : ''} ${isCompleted ? 'is-completed' : ''}`}
                                    onClick={() => handleCardClick(index)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    {/* Badges */}
                                    <div className="topic-badges">
                                        {isLastViewed && (
                                            <span className="badge badge-bookmark">
                                                <FaBookmark /> Last Viewed
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="badge badge-complete">
                                                <FaCheckCircle /> Completed
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="topic-card-content">
                                        <div className="topic-index">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <h3 className="topic-name">{topic.title}</h3>
                                    </div>

                                    {/* Progress Footer */}
                                    {progress && progress.total > 0 && (
                                        <div className="topic-card-footer">
                                            <div className="progress-info">
                                                <span className="progress-label">Progress</span>
                                                <span className="progress-stats">
                                                    {progress.percentage}% ({progress.completed}/{progress.total})
                                                </span>
                                            </div>
                                            <div className="progress-track">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${progress.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover Action Icon */}
                                    <div className="topic-action-icon">
                                        <FaPlay />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No Modules Found</h3>
                        <p>We couldn't find any topics for this subject yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopicSelector;
import './TopicSelector.css';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import data from '../data.js';
import { getTopicProgress, getLastViewedTopic } from '../../../../api/progressTracker.js';


function TopicSelector() {
    const { subject } = useParams();
    const [setSelectedTopic] = useState(null);
    const [topicProgress, setTopicProgress] = useState({});
    const [lastViewed, setLastViewed] = useState(null);
    const navigate = useNavigate();

    const topicsForSubject = useMemo(() => data[subject] || [], [subject]);

    useEffect(() => {
        // Load progress for all topics in this subject
        const progressData = {};
        topicsForSubject.forEach((topic, index) => {
            progressData[index] = getTopicProgress(subject, index, 1);
        });
        setTopicProgress(progressData);

        // Get last viewed topic
        const last = getLastViewedTopic(subject);
        setLastViewed(last);
    }, [subject, topicsForSubject]);

    const handleCardClick = (index) => {
        setSelectedTopic(index);
        navigate(`/videos/subject/${subject}/topic/${index}`);
    };

    return (
        <div className="Topic-container">
            <div className="Topics-wrapper">
                {topicsForSubject.length > 0 ? (
                    topicsForSubject.map((topic, index) => {
                        const progress = topicProgress[index];
                        const isLastViewed = lastViewed === index;

                        return (
                            <div
                                key={index}
                                className={`Topic-card ${isLastViewed ? 'last-viewed' : ''} ${progress?.percentage === 100 ? 'completed' : ''}`}
                                onClick={() => handleCardClick(index)}
                            >
                                <div className="badge-wrapper">
                                    {isLastViewed && <div className="Last-viewed-badge">📌 Last Viewed</div>}
                                    {progress?.percentage === 100 && <div className="Completed-badge">✓ Completed</div>}
                                </div>
                                <span className="Topic-number">{index + 1}</span>
                                <h3 className="Topic-title">{topic.title}</h3>

                                {progress && progress.total > 0 && (
                                    <div className="Topic-progress">
                                        <div className="Progress-bar-container">
                                            <div
                                                className="Progress-bar-fill"
                                                style={{ width: `${progress.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="Progress-text">
                                            {progress.percentage}% • {progress.completed}/{progress.total}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="no-topics">No topics available for this subject</p>
                )}
            </div>
        </div>
    );
}
export default TopicSelector;
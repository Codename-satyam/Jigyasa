import './LeaderBoard.css';
import { useState, useEffect } from 'react';
import scoresApi from '../../api/scores';

function LeaderBoard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                console.log('📊 [LeaderBoard] Fetching public leaderboard...');
                const leaderboard = await scoresApi.getPublicLeaderboard();
                console.log('✅ [LeaderBoard] Leaderboard data:', leaderboard.length, 'entries');
                setLeaderboardData(leaderboard || []);
            } catch (error) {
                console.error('❌ [LeaderBoard] Error loading leaderboard:', error);
                setLeaderboardData([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadLeaderboard();
    }, []);
    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">🏆 Global Leaderboard</h2>
            <p className="leaderboard-subtitle">Top performers across all quizzes</p>
            {loading ? (
                <div className="loading">Loading leaderboard...</div>
            ):(
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Score %</th>
                            <th>Quiz Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="leaderboard-empty">No scores yet</td>
                            </tr>
                        ) : (
                            leaderboardData.map((entry, index) => {
                                const displayScore = entry.percentage !== undefined 
                                    ? `${Math.round(entry.percentage)}%` 
                                    : (entry.score !== undefined ? `${entry.score}` : '0%');
                                const userName = entry.userId?.name || entry.name || 'Anonymous';
                                const quizTitle = entry.quizTitle || 'Quiz';
                                
                                return (
                                    <tr key={entry._id || index} className={index < 3 ? `rank-${index + 1}` : ''}>
                                        <td className="rank-cell">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </td>
                                        <td>{userName}</td>
                                        <td className="score-cell">{displayScore}</td>
                                        <td className="quiz-cell">{quizTitle}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default LeaderBoard;
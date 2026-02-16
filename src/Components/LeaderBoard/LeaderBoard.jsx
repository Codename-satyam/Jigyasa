import './LeaderBoard.css';
import { useState, useEffect } from 'react';
import scoresApi from '../../api/scores';

function LeaderBoard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const scores = scoresApi.getScores();
        const sorted = [...scores].sort((a, b) => b.score - a.score);
        setLeaderboardData(sorted.slice(0, 10));
        setLoading(false);
    }, []);
    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">Leaderboard</h2>
            {loading ? (
                <div className="loading">Loading...</div>
            ):(
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="leaderboard-empty">No scores yet</td>
                            </tr>
                        ) : (
                            leaderboardData.map((entry, index) => (
                                <tr key={entry.id || `${entry.email}-${index}`}>
                                    <td>{index + 1}</td>
                                    <td>{entry.name}</td>
                                    <td>{entry.score}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default LeaderBoard;
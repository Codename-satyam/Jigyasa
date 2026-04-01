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
        <div className="leaderboard-page crt-screen">
            <div className="arcade-leaderboard-container retro-panel border-gold">
                
                {/* THE RADAR SCANLINE */}
                <div className="scanline"></div>

                <div className="leaderboard-header text-center mb-4">
                    <h2 className="pixel-title gold-text glitch-effect">🏆 GLOBAL TOP 10</h2>
                    <p className="pixel-subtitle blue-text mt-2">ELITE OPERATIVES ACROSS ALL ZONES</p>
                </div>

                {loading ? (
                    <div className="loading-screen text-center green-text blink-slow">
                        CONNECTING TO MAINFRAME...
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="cyber-table">
                            <thead>
                                <tr className="cyber-table-header">
                                    <th className="text-center">RANK</th>
                                    <th className="text-left">OPERATIVE</th>
                                    <th className="text-center">EXP %</th>
                                    <th className="text-right">ZONE DETAILS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="empty-row text-center red-text blink">
                                            NO DATA FRAGS FOUND
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboardData.slice(0, 10).map((entry, index) => {
                                        const displayScore = entry.percentage !== undefined 
                                            ? `${Math.round(entry.percentage)}%` 
                                            : (entry.score !== undefined ? `${entry.score}` : '0%');
                                        const userName = entry.userId?.name || entry.name || 'ANONYMOUS';
                                        const quizTitle = entry.quizTitle || 'UNKNOWN QUEST';
                                        
                                        let rankClass = "standard-rank";
                                        if (index === 0) rankClass = "rank-1 gold-text";
                                        if (index === 1) rankClass = "rank-2 cyan-text";
                                        if (index === 2) rankClass = "rank-3 magenta-text";

                                        return (
                                            <tr 
                                                key={entry._id || index} 
                                                className={`cyber-table-row ${rankClass}`}
                                                /* STAGGERED ENTRANCE ANIMATION DELAY */
                                                style={{ animationDelay: `${index * 0.15}s` }}
                                            >
                                                <td className="rank-cell text-center">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `[${index + 1}]`}
                                                </td>
                                                <td className="name-cell text-left">{userName}</td>
                                                <td className="score-cell text-center glitch-hover">{displayScore}</td>
                                                <td className="quiz-cell text-right">{quizTitle}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaderBoard;
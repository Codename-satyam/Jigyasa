import './LeaderBoard.css';
import { useState, useEffect } from 'react';
import gamesTracker from '../../api/gamesTracker';

function GamesLeaderBoard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                console.log('🎮 [GamesLeaderBoard] Fetching global games leaderboard...');
                const leaderboard = await gamesTracker.getPublicGamesLeaderboard();
                console.log('✅ [GamesLeaderBoard] Games leaderboard data:', leaderboard.length, 'entries');
                setLeaderboardData(leaderboard || []);
            } catch (error) {
                console.error('❌ [GamesLeaderBoard] Error loading leaderboard:', error);
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
                    <h2 className="pixel-title gold-text glitch-effect">🎮 GAMES CHAMPIONS</h2>
                    <p className="pixel-subtitle cyan-text mt-2">TOP GAMERS ACROSS ALL ARENAS</p>
                </div>

                {loading ? (
                    <div className="loading-screen text-center green-text blink-slow">
                        LOADING GAME STATS...
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="cyber-table">
                            <thead>
                                <tr className="cyber-table-header">
                                    <th className="text-center">RANK</th>
                                    <th className="text-left">GAMER</th>
                                    <th className="text-center">TOP SCORE</th>
                                    <th className="text-center">LEVEL</th>
                                    <th className="text-right">GAMES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="empty-row text-center red-text blink">
                                            NO CHAMPIONS YET
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboardData.slice(0, 10).map((entry, index) => {
                                        // Get user name from multiple sources
                                        let userName = entry.displayName ||  // displayName from backend
                                                       (typeof entry.name === 'object' ? entry.name?.name : entry.name) ||  // Direct name field
                                                       'Gamer';  // Fallback
                                        
                                        const displayScore = entry.highestScore || 0;
                                        const displayLevel = entry.highestLevel || 1;
                                        const gamesCount = entry.gamesPlayed || 0;
                                        
                                        let rankClass = "standard-rank";
                                        if (index === 0) rankClass = "rank-1 gold-text";
                                        if (index === 1) rankClass = "rank-2 cyan-text";
                                        if (index === 2) rankClass = "rank-3 magenta-text";

                                        return (
                                            <tr 
                                                key={entry.userId || index} 
                                                className={`cyber-table-row ${rankClass}`}
                                                style={{ animationDelay: `${index * 0.15}s` }}
                                            >
                                                <td className="rank-cell text-center">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `[${index + 1}]`}
                                                </td>
                                                <td className="name-cell text-left">
                                                    <span className="user-name">{userName}</span>
                                                </td>
                                                <td className="score-cell text-center glitch-hover">{displayScore}</td>
                                                <td className="score-cell text-center">⭐ {displayLevel}</td>
                                                <td className="quiz-cell text-right">{gamesCount} 🎯</td>
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

export default GamesLeaderBoard;

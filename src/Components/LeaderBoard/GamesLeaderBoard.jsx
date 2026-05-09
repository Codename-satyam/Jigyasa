import './LeaderBoard.css';
import { useState, useEffect } from 'react';
import gamesTracker from '../../api/gamesTracker';

function GamesLeaderBoard() {
    const [selectedGame, setSelectedGame] = useState('Math Game');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const games = [
        { name: 'Math Game', id: 'math' },
        { name: '2048 Game', id: '2048' }
    ];
    
    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            try {
                console.log(`🎮 [GamesLeaderBoard] Fetching leaderboard for ${selectedGame}...`);
                const leaderboard = await gamesTracker.getGameSpecificLeaderboard(selectedGame);
                console.log(`✅ [GamesLeaderBoard] ${selectedGame} leaderboard data:`, leaderboard.length, 'entries');
                setLeaderboardData(leaderboard || []);
            } catch (error) {
                console.error(`❌ [GamesLeaderBoard] Error loading leaderboard for ${selectedGame}:`, error);
                setLeaderboardData([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadLeaderboard();
    }, [selectedGame]);

    return (
        <div className="leaderboard-page crt-screen">
            <div className="arcade-leaderboard-container retro-panel border-gold">
                
                {/* THE RADAR SCANLINE */}
                <div className="scanline"></div>

                <div className="leaderboard-header text-center mb-4">
                    <h2 className="pixel-title gold-text glitch-effect">🎮 GAME CHAMPIONS</h2>
                    <p className="pixel-subtitle cyan-text mt-2">MASTER THE GAMES & DOMINATE THE LEADERBOARD</p>
                </div>

                {/* GAME TABS */}
                <div className="game-tabs-container">
                    {games.map(game => (
                        <button
                            key={game.id}
                            className={`game-tab ${selectedGame === game.name ? 'active' : ''}`}
                            onClick={() => setSelectedGame(game.name)}
                        >
                            {game.name}
                        </button>
                    ))}
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
                                    <th className="text-right">TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="empty-row text-center red-text blink">
                                            NO CHAMPIONS YET FOR THIS GAME
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboardData.slice(0, 10).map((entry, index) => {
                                        // Get user name from multiple sources
                                        let userName = entry.displayName ||  // displayName from backend
                                                       (typeof entry.userId === 'object' && entry.userId?.name) ||  // Populated userId object
                                                       (typeof entry.name === 'object' ? entry.name?.name : entry.name) ||  // Direct name field
                                                       'Gamer';  // Fallback
                                        
                                        const displayScore = entry.score || 0;
                                        const displayLevel = entry.level || 1;
                                        const displayTime = entry.timePlayed ? `${Math.round(entry.timePlayed)}s` : '--';
                                        
                                        let rankClass = "standard-rank";
                                        if (index === 0) rankClass = "rank-1 gold-text";
                                        if (index === 1) rankClass = "rank-2 cyan-text";
                                        if (index === 2) rankClass = "rank-3 magenta-text";

                                        return (
                                            <tr 
                                                key={entry._id || index} 
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
                                                <td className="quiz-cell text-right">{displayTime}</td>
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

import './Admin.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// API imports
import * as authApi from '../../api/auth';
import { apiCall } from '../../api/client';

// Component imports
import PageTransition from '../PageTransition.jsx';
import FadeInWhenVisible from '../FadeInWhenVisible.jsx';

// ==================== ADMIN FUNCTIONS ====================

// USER MANAGEMENT FUNCTIONS
async function fetchAllUsers() {
  try {
    const response = await apiCall('/api/users', 'GET');
    const users = response?.success ? response.users : [];
    return Array.isArray(users)
      ? users.map((u) => ({ ...u, id: u._id || u.id }))
      : [];
  } catch (e) {
    console.error("Error fetching users:", e);
    return [];
  }
}

async function toggleUserStatus(userId, blocked) {
  try {
    const endpoint = blocked ? `/api/users/${userId}/block` : `/api/users/${userId}/unblock`;
    const response = await apiCall(endpoint, 'POST');
    return response.success || false;
  } catch (e) {
    console.error("Error updating user status:", e);
    return false;
  }
}

async function changeUserRole(userId, newRole) {
  try {
    const response = await apiCall(`/api/users/${userId}`, 'PUT', { role: newRole });
    return response.success || false;
  } catch (e) {
    console.error("Error changing user role:", e);
    return false;
  }
}

async function deleteUserAccount(userId) {
  try {
    const response = await apiCall(`/api/users/${userId}`, 'DELETE');
    return response.success || false;
  } catch (e) {
    console.error("Error deleting user:", e);
    return false;
  }
}

function searchUsers(users, searchTerm) {
  if (!searchTerm) return users;
  const term = searchTerm.toLowerCase();
  return users.filter(user =>
    user.name?.toLowerCase().includes(term) ||
    user.email?.toLowerCase().includes(term)
  );
}

// QUIZ MANAGEMENT FUNCTIONS
async function fetchAllQuizzes() {
  try {
    const response = await apiCall('/api/quizzes/all', 'GET');
    const quizzes = response?.success ? response.quizzes : [];
    return Array.isArray(quizzes)
      ? quizzes.map((q) => ({
          ...q,
          id: q._id || q.id,
          isPublished: typeof q.isPublished === 'boolean' ? q.isPublished : !!q.ispublished,
        }))
      : [];
  } catch (e) {
    console.error("Error fetching quizzes:", e);
    return [];
  }
}

async function toggleQuizPublication(quizId, published) {
  try {
    const endpoint = published ? `/api/quizzes/${quizId}/publish` : `/api/quizzes/${quizId}/unpublish`;
    const response = await apiCall(endpoint, 'POST');
    return response.success || false;
  } catch (e) {
    console.error("Error toggling quiz publication:", e);
    return false;
  }
}

async function deleteQuiz(quizId) {
  try {
    const response = await apiCall(`/api/quizzes/${quizId}`, 'DELETE');
    return response.success || false;
  } catch (e) {
    console.error("Error deleting quiz:", e);
    return false;
  }
}

// ANALYTICS FUNCTIONS
function getOverallStats(users, quizzes, scores) {
  return {
    totalUsers: users?.length || 0,
    totalTeachers: users?.filter(u => u.role === 'teacher')?.length || 0,
    totalStudents: users?.filter(u => u.role === 'student')?.length || 0,
    totalQuizzes: quizzes?.length || 0,
    totalAttempts: scores?.length || 0,
    averageScore: scores?.length
      ? Math.round((scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length) * 100) / 100
      : 0,
  };
}

function getQuizPerformanceReport(quizId, scores) {
  const quizScores = scores?.filter(s => s.quizId === quizId) || [];
  const scores_array = quizScores.map(s => s.score || 0);
  return {
    quizId,
    totalAttempts: quizScores.length,
    averageScore: quizScores.length
      ? Math.round((quizScores.reduce((sum, s) => sum + (s.score || 0), 0) / quizScores.length) * 100) / 100
      : 0,
    passRate: quizScores.length
      ? Math.round((quizScores.filter(s => (s.score || 0) >= 60).length / quizScores.length) * 100)
      : 0,
    maxScore: scores_array.length ? Math.max(...scores_array) : 0,
    minScore: scores_array.length ? Math.min(...scores_array) : 0,
  };
}

// MODERATION FUNCTIONS
async function getFlaggedContent() {
  try {
    const response = await apiCall('/api/flags', 'GET');
    const flags = response?.success ? response.flags : [];
    return Array.isArray(flags)
      ? flags.map((f) => ({ ...f, id: f._id || f.id }))
      : [];
  } catch (e) {
    console.error("Error retrieving flagged content:", e);
    return [];
  }
}

async function moderateContent(flagId, action, feedback) {
  try {
    const status = action === 'approved' ? 'resolved' : 'rejected';
    const response = await apiCall(`/api/flags/${flagId}/review`, 'POST', {
      status,
      resolution: feedback,
    });
    return response.success || false;
  } catch (e) {
    console.error("Error moderating content:", e);
    return false;
  }
}

// TEACHER APPROVAL FUNCTIONS
function getPendingTeacherRequests(users) {
  return users?.filter(u => u.role === 'teacher' && !u.approved) || [];
}

async function approveTeacher(teacherId) {
  try {
    const response = await apiCall(`/api/users/${teacherId}/approve`, 'POST');
    return response.success || false;
  } catch (e) {
    console.error("Error approving teacher:", e);
    return false;
  }
}

async function rejectTeacher(teacherId, reason) {
  try {
    const response = await apiCall(`/api/users/${teacherId}`, 'PUT', {
      approved: false,
      rejectionReason: reason || '',
    });
    return response.success || false;
  } catch (e) {
    console.error("Error rejecting teacher:", e);
    return false;
  }
}

// SYSTEM FUNCTIONS
async function backupSystemData(users, quizzes, scores) {
  try {
    const backup = {
      users,
      quizzes,
      scores,
      timestamp: new Date().toISOString()
    };
    const dataStr = JSON.stringify(backup);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `admin_backup_${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    return true;
  } catch (e) {
    console.error("Error backing up data:", e);
    return false;
  }
}

async function sendNotification(userIds, message) {
  try {
    const notifications = JSON.parse(localStorage.getItem('jq_notifications') || '[]');
    userIds.forEach(userId => {
      notifications.push({
        id: Date.now() + Math.random(),
        userId,
        message,
        timestamp: new Date().toISOString(),
        read: false
      });
    });
      localStorage.setItem('jq_notifications', JSON.stringify(notifications));
    return true;
  } catch (e) {
    console.error("Error sending notification:", e);
    return false;
  }
}

// ==================== ADMIN COMPONENT ====================

function Admin() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [message, setMessage] = useState('');
  const [rejectReason, setRejectReason] = useState({}); // Moved up to prevent hook errors
  const navigate = useNavigate();

  // ==================== ADMIN VERIFICATION ====================
  useEffect(() => {
    const currentUser = authApi.getCurrentUser?.();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
  }, [navigate]);

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('📊 [Admin] Fetching admin data from backend...');
        
        // Fetch all users and quizzes from backend
        const fetchedUsers = await fetchAllUsers();
        const fetchedQuizzes = await fetchAllQuizzes();

        // Fetch all scores from backend
        const scoresResponse = await apiCall('/api/scores', 'GET');
        console.log('📊 [Admin] Scores response:', scoresResponse);
        const fetchedScores = scoresResponse.success
          ? scoresResponse.scores.map((s) => ({
              ...s,
              id: s._id || s.id,
              quizId: s.quizId?._id || s.quizId,
              userId: s.userId?._id || s.userId,
            }))
          : [];

        // Fetch flagged content from backend
        const fetchedFlags = await getFlaggedContent();

        console.log('✅ [Admin] All data fetched successfully');
        
        setUsers(fetchedUsers);
        setQuizzes(fetchedQuizzes);
        setScores(fetchedScores);
        setFlaggedContent(fetchedFlags);
      } catch (e) {
        console.error("❌ Error loading admin data:", e);
        setMessage('Error loading data: ' + (e.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchUsers([user], searchTerm).length > 0;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = getOverallStats(users, quizzes, scores);
  const pendingTeachers = getPendingTeacherRequests(users);

  // ==================== UI RENDER FUNCTIONS ====================

  const renderOverview = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">Command Center</h2>
      <div className="stats-grid">
        <div className="pixel-card">
          <h3>Players</h3>
          <p className="stat-number">{stats.totalUsers}</p>
          <small className="pixel-text-small">Lvl 1 Students: {stats.totalStudents} | Guild Masters: {stats.totalTeachers}</small>
        </div>
        <div className="pixel-card">
          <h3>Active Quests</h3>
          <p className="stat-number">{stats.totalQuizzes}</p>
        </div>
        <div className="pixel-card">
          <h3>Quests Attempted</h3>
          <p className="stat-number">{stats.totalAttempts}</p>
        </div>
        <div className="pixel-card">
          <h3>Global EXP (Avg)</h3>
          <p className="stat-number">{stats.averageScore.toFixed(1)}%</p>
        </div>
      </div>

      <div className="recent-activity mt-4">
        <h3 className="pixel-subtitle">Quick Commands</h3>
        <div className="action-buttons">
          <button onClick={() => setCurrentSection('users')} className="pixel-btn btn-blue">Manage Players</button>
          <button onClick={() => setCurrentSection('quizzes')} className="pixel-btn btn-green">Manage Quests</button>
          <button onClick={() => setCurrentSection('analytics')} className="pixel-btn btn-purple">High Scores</button>
          <button onClick={() => setCurrentSection('moderation')} className="pixel-btn btn-red">Banishment Zone</button>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">Player Roster</h2>
      
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Find player..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pixel-input"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="pixel-select"
        >
          <option value="all">All Classes</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="pixel-table-wrapper">
        <table className="pixel-table">
          <thead>
            <tr>
              <th>Avatar ID</th>
              <th>Comms Link</th>
              <th>Class</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name || 'Unknown'}</td>
                <td>{user.email || 'N/A'}</td>
                <td>
                  <select
                    value={user.role || 'student'}
                    onChange={async (e) => {
                      const nextRole = e.target.value;
                      const ok = await changeUserRole(user.id, nextRole);
                      if (!ok) {
                        setMessage('Failed to change user role');
                        return;
                      }
                      setUsers((prev) => prev.map((u) =>
                        u.id === user.id ? { ...u, role: nextRole } : u
                      ));
                      setMessage('User role updated');
                    }}
                    className="pixel-select-small"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.blocked ? 'badge-red' : 'badge-green'}`}>
                    {user.blocked ? 'BANISHED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="action-cell">
                  <button
                    onClick={async () => {
                      const nextBlocked = !user.blocked;
                      const ok = await toggleUserStatus(user.id, nextBlocked);
                      if (!ok) {
                        setMessage('Failed to update user status');
                        return;
                      }
                      setUsers((prev) => prev.map((u) =>
                        u.id === user.id ? { ...u, blocked: nextBlocked } : u
                      ));
                      setMessage(nextBlocked ? 'User blocked' : 'User unblocked');
                    }}
                    className={`pixel-btn-small ${user.blocked ? 'btn-green' : 'btn-orange'}`}
                  >
                    {user.blocked ? 'Revive' : 'Banish'}
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await deleteUserAccount(user.id);
                      if (!ok) {
                        setMessage('Failed to delete user');
                        return;
                      }
                      setUsers((prev) => prev.filter((u) => u.id !== user.id));
                      setMessage('User deleted');
                    }}
                    className="pixel-btn-small btn-red"
                  >
                    Delete File
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuizManagement = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">Quest Log</h2>
      
      <div className="quizzes-grid">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="pixel-card quest-card">
            <h3>{quiz.title || 'Mystery Quest'}</h3>
            <p className="pixel-text-small">{quiz.description || 'No lore provided.'}</p>
            <div className="quiz-meta">
              <span>Stages: {quiz.questions?.length || 0}</span>
              <span>Difficulty: {quiz.difficulty || 'N/A'}</span>
            </div>
            <div className="quiz-actions">
              <button
                onClick={async () => {
                  const nextPublished = !quiz.isPublished;
                  const ok = await toggleQuizPublication(quiz.id, nextPublished);
                  if (!ok) {
                    setMessage('Failed to update quiz publication status');
                    return;
                  }
                  setQuizzes((prev) => prev.map((q) =>
                    q.id === quiz.id ? { ...q, isPublished: nextPublished } : q
                  ));
                  setMessage(nextPublished ? 'Quest published' : 'Quest recalled');
                }}
                className={`pixel-btn ${quiz.isPublished ? 'btn-orange' : 'btn-green'}`}
              >
                {quiz.isPublished ? 'Recall Quest' : 'Launch Quest'}
              </button>
              <button
                onClick={async () => {
                  const ok = await deleteQuiz(quiz.id);
                  if (!ok) {
                    setMessage('Failed to delete quiz');
                    return;
                  }
                  setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
                  setMessage('Quest destroyed');
                }}
                className="pixel-btn btn-red"
              >
                Destroy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">Hall of Fame & High Scores</h2>
      
      <div className="analytics-grid">
        <div className="pixel-box">
          <h3 className="gold-text">Top Players</h3>
          <div className="leaderboard">
            {scores.filter(s => s.score >= 80).sort((a, b) => b.score - a.score).slice(0, 10).map((score, idx) => {
              const user = users.find(u => u.id === score.userId);
              return (
                <div key={idx} className="leaderboard-row">
                  <span className="rank">#{idx + 1}</span>
                  <span className="name">{user?.name || 'Player 1'}</span>
                  <span className="score">{score.score} PTS</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pixel-box">
          <h3 className="blue-text">Quest Difficulty Stats</h3>
          <div className="quest-stats">
            {quizzes.slice(0, 5).map(quiz => {
              const report = getQuizPerformanceReport(quiz.id, scores);
              return (
                <div key={quiz.id} className="stat-row">
                  <p><strong>{quiz.title || 'Quest'}</strong></p>
                  <div className="stat-bars">
                    <span>Clear Rate: {report.passRate}%</span>
                    <span>Tries: {report.totalAttempts}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherApproval = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">Guild Master Applications</h2>
      
      <div className="requests-list">
        {pendingTeachers.length === 0 ? (
          <p className="pixel-text blink">No pending applications...</p>
        ) : (
          pendingTeachers.map(teacher => (
            <div key={teacher.id} className="pixel-card flex-row">
              <div className="request-info">
                <h3>{teacher.name}</h3>
                <p className="pixel-text-small">{teacher.email}</p>
              </div>
              <div className="request-actions">
                <button
                  onClick={() => {
                    approveTeacher(teacher.id).then((ok) => {
                      if (!ok) {
                        setMessage('Failed to approve Guild Master');
                        return;
                      }
                      setUsers((prev) => prev.map((u) =>
                        u.id === teacher.id ? { ...u, approved: true } : u
                      ));
                      setMessage('Guild Master approved successfully');
                    });
                  }}
                  className="pixel-btn btn-green"
                >
                  Grant Rank
                </button>
                <input
                  type="text"
                  placeholder="Denial Reason..."
                  value={rejectReason[teacher.id] || ''}
                  onChange={(e) => setRejectReason({ ...rejectReason, [teacher.id]: e.target.value })}
                  className="pixel-input-small"
                />
                <button
                  onClick={() => {
                    rejectTeacher(teacher.id, rejectReason[teacher.id] || '').then((ok) => {
                      if (!ok) {
                        setMessage('Failed to deny Guild Master');
                        return;
                      }
                      setUsers((prev) => prev.map((u) =>
                        u.id === teacher.id
                          ? { ...u, approved: false, rejectionReason: rejectReason[teacher.id] || '' }
                          : u
                      ));
                      setMessage('Guild Master request denied');
                    });
                  }}
                  className="pixel-btn btn-red"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">The Banishment Zone</h2>
      <p className="pixel-subtitle">Review reported anomalies.</p>
      
      <div className="flagged-content">
        {flaggedContent.length === 0 ? (
          <p className="pixel-text blink">Sector is clear.</p>
        ) : (
          flaggedContent.map(flag => (
            <div key={flag.id} className="pixel-card error-border">
              <h4>Anomaly: {(flag.contentType || 'DATA').toUpperCase()}</h4>
              <p className="pixel-text-small">Log: {flag.reason || 'Unknown error code'}</p>
              <div className="flag-actions mt-2">
                <button
                  onClick={async () => {
                    const ok = await moderateContent(flag.id, 'approved', 'Approved by admin');
                    if (!ok) {
                      setMessage('Failed to clear anomaly');
                      return;
                    }
                    setFlaggedContent((prev) => prev.filter((f) => f.id !== flag.id));
                    setMessage('Anomaly cleared and marked safe');
                  }}
                  className="pixel-btn btn-green"
                >
                  Pardon
                </button>
                <button
                  onClick={async () => {
                    const ok = await moderateContent(flag.id, 'rejected', 'Rejected by admin');
                    if (!ok) {
                      setMessage('Failed to reject anomaly');
                      return;
                    }
                    setFlaggedContent((prev) => prev.filter((f) => f.id !== flag.id));
                    setMessage('Anomaly successfully purged');
                  }}
                  className="pixel-btn btn-red"
                >
                  Execute
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="retro-panel">
      <h2 className="pixel-title">System Options</h2>
      
      <div className="settings-grid">
        <div className="pixel-box">
          <h3>Save State</h3>
          <p className="pixel-text-small mb-2">Export current realm data to local storage.</p>
          <button onClick={() => backupSystemData(users, quizzes, scores)} className="pixel-btn btn-blue">
            Download Save File
          </button>
        </div>

        <div className="pixel-box">
          <h3>Global Broadcast</h3>
          <p className="pixel-text-small mb-2">Transmit a message to all players.</p>
          <textarea
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Type transmission..."
            className="pixel-textarea"
            rows={4}
          />
          <button
            onClick={() => {
              const userIds = users.map(u => u.id);
              sendNotification(userIds, notificationMessage);
              setNotificationMessage('');
              setMessage('Transmission broadcasted successfully');
            }}
            className="pixel-btn btn-purple mt-2"
          >
            Transmit
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <h1 className="pixel-title blink">LOADING SYSTEM...</h1>
      </div>
    );
  }

  return (
    <PageTransition>
      <FadeInWhenVisible>
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="pixel-title gold-text">SYSTEM ADMIN</h1>
            <button onClick={() => navigate('/dashboard')} className="pixel-btn btn-dark">
              [ ESC ] Exit Menu
            </button>
          </div>

          {message && <div className="pixel-alert blink">{message}</div>}

          <div className="admin-layout">
            <nav className="pixel-sidebar">
              {[
                { id: 'overview', label: 'Command Center' },
                { id: 'users', label: 'Player Roster' },
                { id: 'quizzes', label: 'Quest Log' },
                { id: 'analytics', label: 'High Scores' },
                { id: 'teachers', label: 'Guild Approvals' },
                { id: 'moderation', label: 'Banishment Zone' },
                { id: 'settings', label: 'Options' },
              ].map(nav => (
                <button
                  key={nav.id}
                  onClick={() => setCurrentSection(nav.id)}
                  className={`pixel-nav-btn ${currentSection === nav.id ? 'active' : ''}`}
                >
                  {currentSection === nav.id ? '> ' : ''}{nav.label}
                </button>
              ))}
            </nav>

            <main className="admin-content-area">
              {currentSection === 'overview' && renderOverview()}
              {currentSection === 'users' && renderUserManagement()}
              {currentSection === 'quizzes' && renderQuizManagement()}
              {currentSection === 'analytics' && renderAnalytics()}
              {currentSection === 'teachers' && renderTeacherApproval()}
              {currentSection === 'moderation' && renderModeration()}
              {currentSection === 'settings' && renderSettings()}
            </main>
          </div>
        </div>
      </FadeInWhenVisible>
    </PageTransition>
  );
}

export default Admin;
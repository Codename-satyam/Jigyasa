import './Admin.css';
import { useState, useEffect, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

// API imports
import * as authApi from '../../api/auth';
import * as quizApi from '../../api/quizApi';
import * as scoreApi from '../../api/scores';
import * as progressApi from '../../api/progressTracker';
import * as gamesTrackerApi from '../../api/gamesTracker';
import * as quizManagerApi from '../../api/quizManager.js';
import { apiCall } from '../../api/client';

// Component imports
import PageTransition from '../PageTransition.jsx';
import FadeInWhenVisible from '../FadeInWhenVisible.jsx';

// ==================== ADMIN FUNCTIONS ====================

// USER MANAGEMENT FUNCTIONS
async function fetchAllUsers() {
  try {
    const users = authApi.getAllUsers?.() || [];
    return Array.isArray(users) ? users : [];
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
    const users = authApi.getAllUsers?.() || [];
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = newRole;
      localStorage.setItem('jq_users', JSON.stringify(users));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error changing user role:", e);
    return false;
  }
}

async function deleteUserAccount(userId) {
  try {
    let users = authApi.getAllUsers?.() || [];
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('jq_users', JSON.stringify(users));
    return true;
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
    // Get all quizzes directly from localStorage (admin needs all, not just published)
    const quizzes = JSON.parse(localStorage.getItem('jq_quizzes') || '[]');
    return Array.isArray(quizzes) ? quizzes : [];
  } catch (e) {
    console.error("Error fetching quizzes:", e);
    return [];
  }
}

async function toggleQuizPublication(quizId, published) {
  try {
    const quizzes = JSON.parse(localStorage.getItem('jq_quizzes') || '[]');
    const quizIndex = quizzes.findIndex(q => q.id === quizId);
    if (quizIndex !== -1) {
      quizzes[quizIndex].isPublished = published;
      localStorage.setItem('jq_quizzes', JSON.stringify(quizzes));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error toggling quiz publication:", e);
    return false;
  }
}

async function deleteQuiz(quizId) {
  try {
    let quizzes = JSON.parse(localStorage.getItem('jq_quizzes') || '[]');
    quizzes = quizzes.filter(q => q.id !== quizId);
    localStorage.setItem('jq_quizzes', JSON.stringify(quizzes));
    return true;
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

function getUserPerformanceReport(userId, scores) {
  const userScores = scores?.filter(s => s.userId === userId) || [];
  const scores_array = userScores.map(s => s.score || 0);
  return {
    userId,
    totalAttempts: userScores.length,
    averageScore: userScores.length
      ? Math.round((userScores.reduce((sum, s) => sum + (s.score || 0), 0) / userScores.length) * 100) / 100
      : 0,
    bestScore: scores_array.length ? Math.max(...scores_array) : 0,
    worstScore: scores_array.length ? Math.min(...scores_array) : 0,
    lastAttempt: userScores[userScores.length - 1]?.timestamp || null,
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
async function flagContent(contentId, contentType, reason) {
  try {
    const flags = JSON.parse(localStorage.getItem('jq_flagged') || '[]');
    flags.push({
      id: Date.now(),
      contentId,
      contentType,
      reason,
      flaggedAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('jq_flagged', JSON.stringify(flags));
    return true;
  } catch (e) {
    console.error("Error flagging content:", e);
    return false;
  }
}

async function getFlaggedContent() {
  try {
    return JSON.parse(localStorage.getItem('jq_flagged') || '[]');
  } catch (e) {
    console.error("Error retrieving flagged content:", e);
    return [];
  }
}

async function moderateContent(flagId, action, feedback) {
  try {
    let flags = JSON.parse(localStorage.getItem('jq_flagged') || '[]');
    const flagIndex = flags.findIndex(f => f.id === flagId);
    if (flagIndex !== -1) {
      flags[flagIndex].status = action;
      flags[flagIndex].feedback = feedback;
      flags[flagIndex].moderatedAt = new Date().toISOString();
      localStorage.setItem('jq_flagged', JSON.stringify(flags));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error moderating content:", e);
    return false;
  }
}

// TEACHER APPROVAL FUNCTIONS
async function getPendingTeacherRequests(users) {
  try {
    return users?.filter(u => u.role === 'teacher' && !u.approved) || [];
  } catch (e) {
    console.error("Error fetching teacher requests:", e);
    return [];
  }
}

async function approveTeacher(teacherId) {
  try {
    const users = authApi.getAllUsers?.() || [];
    const userIndex = users.findIndex(u => u.id === teacherId);
    if (userIndex !== -1) {
      users[userIndex].approved = true;
      users[userIndex].approvedAt = new Date().toISOString();
      localStorage.setItem('jq_users', JSON.stringify(users));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error approving teacher:", e);
    return false;
  }
}

async function rejectTeacher(teacherId, reason) {
  try {
    const users = authApi.getAllUsers?.() || [];
    const userIndex = users.findIndex(u => u.id === teacherId);
    if (userIndex !== -1) {
      users[userIndex].approved = false;
      users[userIndex].rejectionReason = reason;
      localStorage.setItem('jq_users', JSON.stringify(users));
      return true;
    }
    return false;
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [message, setMessage] = useState('');
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
        
        // Fetch all users from backend
        const usersResponse = await apiCall('/api/users', 'GET');
        console.log('👥 [Admin] Users response:', usersResponse);
        const fetchedUsers = usersResponse.success ? usersResponse.users.map(u => ({ ...u, id: u._id })) : [];

        // Fetch all quizzes from backend
        const quizzesResponse = await apiCall('/api/quizzes/all', 'GET');
        console.log('📝 [Admin] Quizzes response:', quizzesResponse);
        const fetchedQuizzes = quizzesResponse.success ? quizzesResponse.quizzes : [];

        // Fetch all scores from backend
        const scoresResponse = await apiCall('/api/scores', 'GET');
        console.log('📊 [Admin] Scores response:', scoresResponse);
        const fetchedScores = scoresResponse.success ? scoresResponse.scores : [];

        // Fetch flagged content from localStorage for now
        const fetchedFlags = JSON.parse(localStorage.getItem('jq_flagged') || '[]');

        console.log('✅ [Admin] All data fetched successfully');
        console.log('  - Users:', fetchedUsers.length);
        console.log('  - Quizzes:', fetchedQuizzes.length);
        console.log('  - Scores:', fetchedScores.length);
        console.log('  - Flagged:', fetchedFlags.length);

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

  // ==================== UI SECTIONS ====================

  // OVERVIEW SECTION
  const OverviewSection = () => (
    <div className="admin-section overview-section">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
          <small>{stats.totalStudents} Students | {stats.totalTeachers} Teachers</small>
        </div>
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <p className="stat-number">{stats.totalQuizzes}</p>
        </div>
        <div className="stat-card">
          <h3>Quiz Attempts</h3>
          <p className="stat-number">{stats.totalAttempts}</p>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <p className="stat-number">{stats.averageScore.toFixed(1)}%</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button onClick={() => setCurrentSection('users')} className="btn-primary">Manage Users</button>
          <button onClick={() => setCurrentSection('quizzes')} className="btn-primary">Manage Quizzes</button>
          <button onClick={() => setCurrentSection('analytics')} className="btn-primary">View Analytics</button>
          <button onClick={() => setCurrentSection('moderation')} className="btn-warning">Moderation</button>
        </div>
      </div>
    </div>
  );

  // USER MANAGEMENT SECTION
  const UserManagementSection = () => (
    <div className="admin-section user-section">
      <h2>User Management</h2>
      
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name || 'N/A'}</td>
                <td>{user.email || 'N/A'}</td>
                <td>
                  <select
                    value={user.role || 'student'}
                    onChange={(e) => {
                      changeUserRole(user.id, e.target.value);
                      const updatedUsers = users.map(u => 
                        u.id === user.id ? { ...u, role: e.target.value } : u
                      );
                      setUsers(updatedUsers);
                    }}
                    className="role-select"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status ${user.blocked ? 'blocked' : 'active'}`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => {
                      toggleUserStatus(user.id, !user.blocked);
                      const updatedUsers = users.map(u =>
                        u.id === user.id ? { ...u, blocked: !u.blocked } : u
                      );
                      setUsers(updatedUsers);
                    }}
                    className="btn-small btn-secondary"
                  >
                    {user.blocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={() => {
                      deleteUserAccount(user.id);
                      setUsers(users.filter(u => u.id !== user.id));
                    }}
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // QUIZ MANAGEMENT SECTION
  const QuizManagementSection = () => (
    <div className="admin-section quiz-section">
      <h2>Quiz Management</h2>
      
      <div className="quizzes-grid">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <h3>{quiz.title || 'Untitled Quiz'}</h3>
            <p>{quiz.description || 'No description'}</p>
            <div className="quiz-meta">
              <span>Questions: {quiz.questions?.length || 0}</span>
              <span>Difficulty: {quiz.difficulty || 'N/A'}</span>
            </div>
            <div className="quiz-actions">
              <button
                onClick={() => {
                  toggleQuizPublication(quiz.id, !quiz.isPublished);
                  const updatedQuizzes = quizzes.map(q =>
                    q.id === quiz.id ? { ...q, isPublished: !q.isPublished } : q
                  );
                  setQuizzes(updatedQuizzes);
                }}
                className={`btn-small ${quiz.isPublished ? 'btn-secondary' : 'btn-primary'}`}
              >
                {quiz.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => {
                  deleteQuiz(quiz.id);
                  setQuizzes(quizzes.filter(q => q.id !== quiz.id));
                }}
                className="btn-small btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ANALYTICS SECTION
  const AnalyticsSection = () => (
    <div className="admin-section analytics-section">
      <h2>Analytics & Reports</h2>
      
      <div className="analytics-tabs">
        <div className="tab-content">
          <h3>Top Performers</h3>
          <div className="performers-list">
            {scores
              .filter(s => s.score >= 80)
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((score, idx) => {
                const user = users.find(u => u.id === score.userId);
                return (
                  <div key={idx} className="performer-item">
                    <span>{user?.name || 'Unknown'}</span>
                    <span className="score-badge">{score.score}%</span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="tab-content">
          <h3>Quiz Performance</h3>
          <div className="quiz-performance">
            {quizzes.slice(0, 5).map(quiz => {
              const report = getQuizPerformanceReport(quiz.id, scores);
              return (
                <div key={quiz.id} className="performance-item">
                  <p><strong>{quiz.title || 'Quiz'}</strong></p>
                  <p>Attempts: {report.totalAttempts}</p>
                  <p>Avg Score: {report.averageScore.toFixed(1)}%</p>
                  <p>Pass Rate: {report.passRate}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // TEACHER APPROVAL SECTION
  const TeacherApprovalSection = () => {
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [rejectReason, setRejectReason] = useState({});

    useEffect(() => {
      getPendingTeacherRequests(users).then(setPendingTeachers);
    }, [users]);

    return (
      <div className="admin-section teacher-section">
        <h2>Teacher Approval Requests</h2>
        
        <div className="requests-list">
          {pendingTeachers.length === 0 ? (
            <p className="no-data">No pending teacher requests</p>
          ) : (
            pendingTeachers.map(teacher => (
              <div key={teacher.id} className="request-card">
                <div className="request-info">
                  <h3>{teacher.name}</h3>
                  <p>Email: {teacher.email}</p>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => {
                      approveTeacher(teacher.id);
                      setPendingTeachers(pendingTeachers.filter(t => t.id !== teacher.id));
                      setMessage('Teacher approved successfully');
                    }}
                    className="btn-primary"
                  >
                    Approve
                  </button>
                  <input
                    type="text"
                    placeholder="Rejection reason (optional)"
                    value={rejectReason[teacher.id] || ''}
                    onChange={(e) => setRejectReason({ ...rejectReason, [teacher.id]: e.target.value })}
                    className="input-small"
                  />
                  <button
                    onClick={() => {
                      rejectTeacher(teacher.id, rejectReason[teacher.id] || '');
                      setPendingTeachers(pendingTeachers.filter(t => t.id !== teacher.id));
                      setMessage('Teacher request rejected');
                    }}
                    className="btn-danger"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // MODERATION SECTION
  const ModerationSection = () => (
    <div className="admin-section moderation-section">
      <h2>Content Moderation</h2>
      
      <div className="flagged-content">
        {flaggedContent.length === 0 ? (
          <p className="no-data">No flagged content</p>
        ) : (
          flaggedContent.map(flag => (
            <div key={flag.id} className="flag-card">
              <div className="flag-info">
                <h4>{flag.contentType.toUpperCase()}</h4>
                <p>Reason: {flag.reason}</p>
                <small>Flagged: {new Date(flag.flaggedAt).toLocaleString()}</small>
              </div>
              <div className="flag-actions">
                <button
                  onClick={() => {
                    moderateContent(flag.id, 'approved', 'Approved');
                    setFlaggedContent(flaggedContent.filter(f => f.id !== flag.id));
                  }}
                  className="btn-primary"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    moderateContent(flag.id, 'rejected', 'Rejected');
                    setFlaggedContent(flaggedContent.filter(f => f.id !== flag.id));
                  }}
                  className="btn-danger"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // SETTINGS SECTION
  const SettingsSection = () => (
    <div className="admin-section settings-section">
      <h2>System Settings</h2>
      
      <div className="settings-panel">
        <div className="setting-group">
          <h3>Backup & Export</h3>
          <button
            onClick={() => backupSystemData(users, quizzes, scores)}
            className="btn-primary"
          >
            Download Backup
          </button>
        </div>

        <div className="setting-group">
          <h3>Send Announcement</h3>
          <textarea
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Enter announcement message..."
            className="textarea-input"
            rows={4}
          />
          <button
            onClick={() => {
              const userIds = users.map(u => u.id);
              sendNotification(userIds, notificationMessage);
              setNotificationMessage('');
              setMessage('Announcement sent successfully');
            }}
            className="btn-primary"
          >
            Send to All Users
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="admin-loading">Loading Admin Panel...</div>;
  }

  return (
    <PageTransition>
      <FadeInWhenVisible>
        <div className="admin-container">
          <div className="admin-header">
            <h1>Admin Control Panel</h1>
            <button onClick={() => navigate('/dashboard')} className="btn-back">
              Back to Dashboard
            </button>
          </div>

          {message && <div className="alert alert-info">{message}</div>}

          <div className="admin-nav">
            <button
              onClick={() => setCurrentSection('overview')}
              className={`nav-btn ${currentSection === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentSection('users')}
              className={`nav-btn ${currentSection === 'users' ? 'active' : ''}`}
            >
              Users
            </button>
            <button
              onClick={() => setCurrentSection('quizzes')}
              className={`nav-btn ${currentSection === 'quizzes' ? 'active' : ''}`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setCurrentSection('analytics')}
              className={`nav-btn ${currentSection === 'analytics' ? 'active' : ''}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setCurrentSection('teachers')}
              className={`nav-btn ${currentSection === 'teachers' ? 'active' : ''}`}
            >
              Teacher Approvals
            </button>
            <button
              onClick={() => setCurrentSection('moderation')}
              className={`nav-btn ${currentSection === 'moderation' ? 'active' : ''}`}
            >
              Moderation
            </button>
            <button
              onClick={() => setCurrentSection('settings')}
              className={`nav-btn ${currentSection === 'settings' ? 'active' : ''}`}
            >
              Settings
            </button>
          </div>

          <div className="admin-content">
            {currentSection === 'overview' && <OverviewSection />}
            {currentSection === 'users' && <UserManagementSection />}
            {currentSection === 'quizzes' && <QuizManagementSection />}
            {currentSection === 'analytics' && <AnalyticsSection />}
            {currentSection === 'teachers' && <TeacherApprovalSection />}
            {currentSection === 'moderation' && <ModerationSection />}
            {currentSection === 'settings' && <SettingsSection />}
          </div>
        </div>
      </FadeInWhenVisible>
    </PageTransition>
  );
}

export default Admin;

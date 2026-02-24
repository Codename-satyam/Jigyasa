// Auth helper - connects to backend API with JWT tokens
import { apiCall } from './client';

const CURRENT_KEY = "qq_currentUser";
const TOKEN_KEY = "token";

// Avatar options
export const AVATAR_OPTIONS = [
  { id: 1, emoji: '🦁', name: 'Lion' },
  { id: 2, emoji: '🐯', name: 'Tiger' },
  { id: 3, emoji: '🦊', name: 'Fox' },
  { id: 4, emoji: '🐻', name: 'Bear' },
  { id: 5, emoji: '🐢', name: 'Turtle' },
  { id: 6, emoji: '🦅', name: 'Eagle' },
  { id: 7, emoji: '🐉', name: 'Dragon' },
  { id: 8, emoji: '🦄', name: 'Unicorn' },
  { id: 9, emoji: '🐙', name: 'Octopus' },
  { id: 10, emoji: '🦈', name: 'Shark' },
  { id: 11, emoji: '🐸', name: 'Frog' },
  { id: 12, emoji: '🦚', name: 'Peacock' }
];

export async function register({ name, email, password, avatarId, role = 'student' }) {
  console.log('🔷 [auth.js] register() called');
  console.log('📋 [auth.js] Parameters:', { name, email, role, avatarId });
  
  try {
    console.log('📡 [auth.js] Making API call to /api/users/register');
    const response = await apiCall('/api/users/register', 'POST', {
      name,
      email,
      password,
      role
    });

    console.log('📨 [auth.js] API response received:', response);

    if (response.success) {
      console.log('✅ [auth.js] Registration successful');
      const token = response.token;
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        avatarId: avatarId || 1,
      };

      console.log('💾 [auth.js] Storing token in localStorage');
      console.log('💾 [auth.js] Storing user data:', userData);
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(userData));
      
      console.log('✅ [auth.js] Data saved to localStorage');
      return userData;
    } else {
      console.warn('⚠️ [auth.js] Registration failed - response.success is false');
      console.warn('⚠️ [auth.js] Error from server:', response.error);
      throw new Error(response.error || 'Registration failed');
    }
  } catch (error) {
    console.error('❌ [auth.js] Exception caught in register()');
    console.error('❌ [auth.js] Error:', error);
    console.error('❌ [auth.js] Error message:', error.message);
    throw error;
  }
}

export async function login({ email, password }) {
  try {
    const response = await apiCall('/api/users/login', 'POST', {
      email,
      password
    });

    if (response.success) {
      const token = response.token;
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        avatarId: response.user.avatarId || 1,
        blocked: response.user.blocked || false,
        approved: response.user.approved || false
      };

      if (userData.blocked) {
        throw new Error("ACCOUNT_BLOCKED");
      }

      // Store token and user data
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(userData));
      
      return userData;
    } else {
      throw new Error(response.error || 'Login failed');
    }
  } catch (error) {
    throw error;
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    
    const currentUser = JSON.parse(raw);
    
    // Check if user is blocked
    if (currentUser.blocked) {
      localStorage.removeItem(CURRENT_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    
    return currentUser;
  } catch (e) {
    return null;
  }
}

export function isUserBlocked(userId) {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.blocked || false : false;
}

export function isAuthenticated() {
  return !!getCurrentUser() && !!localStorage.getItem(TOKEN_KEY);
}

export async function getAllUsers() {
  try {
    const response = await apiCall('/api/users', 'GET');
    return response.success ? response.users : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

const auth = { register, login, logout, getCurrentUser, isAuthenticated, isUserBlocked, getAllUsers, AVATAR_OPTIONS };
export default auth;

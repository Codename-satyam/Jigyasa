// Simple auth helper using localStorage for demo purposes
const USERS_KEY = "qq_users";
const CURRENT_KEY = "qq_currentUser";

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

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}


function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register({ name, email, password, avatarId, role = 'student' }) {
  const users = loadUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("User already exists");
  }
  
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
  
  const user = { 
    id: Date.now(), 
    name, 
    email, 
    password,
    avatarId: avatar.id,
    avatar: avatar.emoji,
    role: role // 'student' or 'teacher'
  };
  users.push(user);
  saveUsers(users);
  
  // auto-login after register
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ 
    id: user.id, 
    name: user.name, 
    email: user.email,
    avatarId: user.avatarId,
    avatar: user.avatar,
    role: user.role
  }));
  return user;
}

export function login({ email, password }) {
  const users = loadUsers();
  const u = users.find((x) => x.email === email && x.password === password);
  if (!u) throw new Error("Invalid credentials");
  
  const userData = { 
    id: u.id, 
    name: u.name, 
    email: u.email,
    avatarId: u.avatarId || 1,
    avatar: u.avatar || '🦁',
    role: u.role || 'student'
  };
  
  localStorage.setItem(CURRENT_KEY, JSON.stringify(userData));
  return userData;
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

const auth = { register, login, logout, getCurrentUser, isAuthenticated, AVATAR_OPTIONS };
export default auth;

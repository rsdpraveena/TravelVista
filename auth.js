/* =========================================
   auth.js - Authentication & Session Logic
   ========================================= */

// --- Constants ---
const USERS_KEY = 'travelvista_users';
const SESSION_KEY = 'travelvista_session';

// --- Utility: Get all users from localStorage ---
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// --- Utility: Save users to localStorage ---
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- Utility: Get current logged-in user ---
function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

// --- Utility: Set current session ---
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// --- Utility: Clear session (logout) ---
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// --- Guard: Redirect if not logged in ---
function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// --- Guard: Redirect if already logged in (for login/register pages) ---
function redirectIfLoggedIn() {
  const session = getSession();
  if (session) {
    window.location.href = 'index.html';
  }
}

// --- Initialize demo user if no users exist ---
function initDemoUser() {
  const users = getUsers();
  if (users.length === 0) {
    users.push({ name: 'John', email: 'john@gmail.com', password: 'password123' });
    saveUsers(users);
  }
}

// --- Register a new user ---
function registerUser(name, email, password) {
  const users = getUsers();
  // Check if email already registered
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email already registered. Please login.' };
  }
  users.push({ name, email, password });
  saveUsers(users);
  return { success: true, message: 'Account created! Redirecting to login...' };
}

// --- Login user with email & password ---
function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { success: false, message: 'Invalid email or password. Please try again.' };
  }
  setSession({ name: user.name, email: user.email });
  return { success: true };
}

// --- Logout handler ---
function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// --- Populate navbar with user's name ---
function setupNavbar() {
  const session = getSession();
  const greetEl = document.getElementById('nav-greeting');
  const logoutBtn = document.getElementById('nav-logout');

  if (greetEl && session) {
    greetEl.innerHTML = `Hello, <strong>${session.name}</strong>`;
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Highlight active nav link
  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  const page = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
}

// --- Show toast notification ---
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Init demo user on load
initDemoUser();

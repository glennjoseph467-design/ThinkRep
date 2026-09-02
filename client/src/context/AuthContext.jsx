import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'thinkrep_users';
const SESSION_KEY = 'thinkrep_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  function signup(email, password, name) {
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    const newUser = { id: Date.now(), email, password, name };
    saveUsers([...users, newUser]);
    const session = { id: newUser.id, email, name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }

  function login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password');
    }
    const session = { id: found.id, email: found.email, name: found.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

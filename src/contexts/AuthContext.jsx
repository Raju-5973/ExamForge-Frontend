import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);
const CURRENT_USER_STORAGE_KEY = 'examforge_current_user';

const API_URL = process.env.REACT_APP_API_URL || '';

const readStoredCurrentUser = () => {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Fallback for name if it's missing in stored data
    if (user && !user.name) {
      user.name = user.username || (user.email ? user.email.split('@')[0] : 'User');
    }
    return user;
  } catch (error) {
    console.error('Failed to read current user:', error);
    return null;
  }
};

const writeStoredCurrentUser = (user) => {
  if (user) {
    sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredCurrentUser());
    setIsLoading(false);
  }, []);

  const register = async (email, password, name, role, username, department) => {
    try {
      if (!email || !password || !name || !role || !username) {
        return { success: false, message: 'All fields are required' };
      }
      if (role !== 'principal' && !department) {
        return { success: false, message: 'Department is required for staff accounts' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      const response = await fetch(`${API_URL}/api/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password, 
          name: name.trim(), 
          role,
          username: username.trim(),
          department: department
        }),
      });
      
      const data = await response.json();

      if (response.ok && data.token) {
        const userData = { 
          ...data.user, 
          name: data.user.username || data.user.name || email.split('@')[0],
          token: data.token 
        };
        writeStoredCurrentUser(userData);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, message: 'Registration successful' };
      } else {
        const message = data.message || 'Registration failed';
        toast.error(message);
        return { success: false, message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Is the backend running?');
      return { success: false, message: 'Network error. Is the backend running?' };
    }
  };

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const response = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const userData = { 
          ...data.user, 
          name: data.user.username || data.user.name || email.split('@')[0],
          token: data.token 
        };
        writeStoredCurrentUser(userData);
        setUser(userData);
        toast.success(`Logged in as ${userData.name}`);
        return { success: true, message: 'Login successful' };
      } else {
        const message = data.message || 'Invalid credentials';
        toast.error(message);
        return { success: false, message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Is the backend running?');
      return { success: false, message: 'Network error. Is the backend running?' };
    }
  };

  const logout = async () => {
    const name = user?.name || 'User';
    writeStoredCurrentUser(null);
    setUser(null);
    toast.success(`Logged out successfully. Goodbye, ${name}!`);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// authService.js – authenticates against the local SQLite backend
import api from './api';

export async function login(email, password) {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Invalid email or password';
    throw new Error(message);
  }
}

export async function register(name, email, password) {
  try {
    // 1. Register account
    const res = await api.post('/auth/register', {
      full_name: name,
      email,
      password,
    });
    
    // 2. Automatically log in after registration
    await login(email, password);
    
    return res.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Registration failed';
    throw new Error(message);
  }
}

export async function signOut() {
  localStorage.removeItem('access_token');
  return Promise.resolve();
}

export async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    localStorage.removeItem('access_token');
    return null;
  }
}

export default {
  login,
  register,
  signOut,
  getCurrentUser,
};

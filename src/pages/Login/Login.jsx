import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [fields, setFields] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFields((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(fields.email, fields.password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>Sign in with your university account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} name="email" type="email" value={fields.email} onChange={handleChange} required />

          <label className={styles.label}>Password</label>
          <input className={styles.input} name="password" type="password" value={fields.password} onChange={handleChange} required />

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className={styles.small}>Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
}

export default Login;

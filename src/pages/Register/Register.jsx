import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { useAuth } from '../../context/AuthContext';

function Register() {
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFields((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fields.name, fields.email, fields.password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className={styles.card}>
        <h1 className={styles.title}>Create an Account</h1>
        <p className={styles.subtitle}>Register using your university email</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Full Name</label>
          <input className={styles.input} name="name" value={fields.name} onChange={handleChange} required />

          <label className={styles.label}>Email</label>
          <input className={styles.input} name="email" type="email" value={fields.email} onChange={handleChange} required />

          <label className={styles.label}>Password</label>
          <input className={styles.input} name="password" type="password" value={fields.password} onChange={handleChange} required />

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className={styles.small}>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}

export default Register;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#4ADE80',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#8888A0',
    fontSize: '14px',
    marginBottom: '32px',
  },
  card: {
    background: '#1C1C22',
    borderRadius: '12px',
    border: '1px solid #2A2A34',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
  },
  tabs: {
    display: 'flex',
    marginBottom: '24px',
    borderBottom: '1px solid #2A2A34',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    color: '#8888A0',
    fontSize: '14px',
    fontWeight: 500,
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#4ADE80',
    borderBottom: '2px solid #4ADE80',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#141418',
    border: '1px solid #2A2A34',
    borderRadius: '8px',
    color: '#F0F0F0',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#4ADE80',
    color: '#0B0B0F',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '8px',
  },
  error: {
    color: '#F87171',
    fontSize: '13px',
    marginBottom: '12px',
  },
};

export default function Auth() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.logo}>ThinkRep</div>
      <div style={styles.subtitle}>Train your thinking</div>
      <div style={styles.card}>
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'login' ? styles.activeTab : {}) }}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'signup' ? styles.activeTab : {}) }}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <input
              style={styles.input}
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

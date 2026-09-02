import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#141418',
    borderTop: '1px solid #2A2A34',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '64px',
    zIndex: 100,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    color: '#8888A0',
    fontSize: '11px',
    padding: '8px 16px',
  },
  active: {
    color: '#4ADE80',
  },
  logout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    color: '#8888A0',
    fontSize: '11px',
    padding: '8px 16px',
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isQuizzes = location.pathname === '/' || location.pathname.startsWith('/quiz');
  const isPortfolio = location.pathname === '/portfolio';

  return (
    <nav style={styles.nav}>
      <button
        style={{ ...styles.tab, ...(isQuizzes ? styles.active : {}) }}
        onClick={() => navigate('/')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Quizzes
      </button>
      <button
        style={{ ...styles.tab, ...(isPortfolio ? styles.active : {}) }}
        onClick={() => navigate('/portfolio')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        Portfolio
      </button>
      <button
        style={styles.logout}
        onClick={() => { logout(); navigate('/auth'); }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </nav>
  );
}

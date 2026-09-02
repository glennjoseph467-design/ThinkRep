import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizzes } from '../data/quizzes';

const styles = {
  page: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  greeting: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  sub: {
    color: '#8888A0',
    fontSize: '14px',
    marginBottom: '24px',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: '#1C1C22',
    border: '1px solid #2A2A34',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '6px',
  },
  cardDesc: {
    color: '#8888A0',
    fontSize: '13px',
    lineHeight: '1.5',
    marginBottom: '10px',
  },
  badge: {
    display: 'inline-block',
    background: '#2A2A34',
    color: '#8888A0',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.greeting}>Hey {user?.name}</div>
      <div style={styles.sub}>Pick a quiz and start thinking.</div>
      <div style={styles.grid}>
        {quizzes.map(q => (
          <div
            key={q.id}
            style={styles.card}
            onClick={() => navigate(`/quiz/${q.id}`)}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4ADE80'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A34'}
          >
            <div style={styles.cardTitle}>{q.title}</div>
            <div style={styles.cardDesc}>{q.description}</div>
            <span style={styles.badge}>{q.questions.length} questions</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ATTEMPTS_KEY = 'thinkrep_attempts';

function getAttempts(userId) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  return all.filter(a => a.user_id === userId);
}

function deleteAttemptFromStorage(id) {
  const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all.filter(a => a.id !== id)));
}

const styles = {
  page: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  empty: {
    color: '#8888A0',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '48px',
  },
  progressCard: {
    background: '#1C1C22',
    border: '1px solid #2A2A34',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  brainScore: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#4ADE80',
    lineHeight: 1,
  },
  brainLabel: {
    fontSize: '13px',
    color: '#8888A0',
    marginTop: '4px',
    marginBottom: '20px',
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    padding: '10px 12px',
    background: '#141418',
    borderRadius: '8px',
  },
  trendArrow: {
    fontSize: '18px',
    flexShrink: 0,
  },
  trendText: {
    fontSize: '13px',
    color: '#F0F0F0',
    lineHeight: 1.4,
  },
  categorySection: {
    borderTop: '1px solid #2A2A34',
    paddingTop: '16px',
  },
  categoryLabel: {
    fontSize: '12px',
    color: '#8888A0',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  catRow: {
    marginBottom: '12px',
  },
  catHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '4px',
  },
  catName: {
    color: '#F0F0F0',
  },
  catPct: {
    color: '#8888A0',
    fontWeight: 500,
  },
  barTrack: {
    height: '6px',
    background: '#2A2A34',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#8888A0',
    marginBottom: '12px',
  },
  card: {
    background: '#1C1C22',
    border: '1px solid #2A2A34',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '4px',
  },
  meta: {
    color: '#8888A0',
    fontSize: '12px',
  },
  score: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#4ADE80',
    marginRight: '16px',
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid #2A2A34',
    borderRadius: '6px',
    color: '#F87171',
    padding: '6px 10px',
    fontSize: '12px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
};

function getBarColor(pct) {
  if (pct >= 80) return '#4ADE80';
  if (pct >= 60) return '#818CF8';
  if (pct >= 40) return '#FBBF24';
  return '#F87171';
}

export default function Portfolio() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    setAttempts(getAttempts(user.id));
  }, [user.id]);

  function handleDelete(id) {
    deleteAttemptFromStorage(id);
    setAttempts(prev => prev.filter(a => a.id !== id));
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  const brainScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / attempts.length)
    : 0;

  let trendMessage = '';
  let trendColor = '#8888A0';
  let trendArrow = '';
  if (attempts.length < 3) {
    trendMessage = 'Take more quizzes to unlock your progress insights.';
    trendColor = '#8888A0';
    trendArrow = '•';
  } else {
    const avg = arr => arr.reduce((s, a) => s + (a.score / a.total_questions), 0) / arr.length;
    const recent3 = avg(attempts.slice(0, 3));
    const oldest3 = avg(attempts.slice(-3));
    const diff = recent3 - oldest3;
    if (diff > 0.05) {
      trendMessage = 'Your thinking is getting sharper. Keep going.';
      trendColor = '#4ADE80';
      trendArrow = '↑';
    } else if (diff < -0.05) {
      trendMessage = 'Time to slow down and think deeper on each question.';
      trendColor = '#F87171';
      trendArrow = '↓';
    } else {
      trendMessage = 'Consistent performer. Try harder quizzes to push further.';
      trendColor = '#818CF8';
      trendArrow = '→';
    }
  }

  const catMap = {};
  for (const a of attempts) {
    const key = a.quiz_title;
    if (!catMap[key]) catMap[key] = { total: 0, scored: 0 };
    catMap[key].total += a.total_questions;
    catMap[key].scored += a.score;
  }
  const categories = Object.entries(catMap).map(([name, { total, scored }]) => ({
    name,
    pct: Math.round((scored / total) * 100),
  })).sort((a, b) => b.pct - a.pct);

  return (
    <div style={styles.page}>
      <div style={styles.title}>Portfolio</div>

      {attempts.length > 0 && (
        <div style={styles.progressCard}>
          <div style={styles.brainScore}>{brainScore}%</div>
          <div style={styles.brainLabel}>Your ThinkRep Score</div>

          <div style={styles.trendRow}>
            <span style={{ ...styles.trendArrow, color: trendColor }}>{trendArrow}</span>
            <span style={styles.trendText}>{trendMessage}</span>
          </div>

          {categories.length > 0 && (
            <div style={styles.categorySection}>
              <div style={styles.categoryLabel}>Category breakdown</div>
              {categories.map(c => (
                <div key={c.name} style={styles.catRow}>
                  <div style={styles.catHeader}>
                    <span style={styles.catName}>{c.name}</span>
                    <span style={styles.catPct}>{c.pct}%</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{
                      height: '100%',
                      width: `${c.pct}%`,
                      background: getBarColor(c.pct),
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {attempts.length === 0 ? (
        <div style={styles.empty}>No attempts yet. Go take a quiz!</div>
      ) : (
        <>
          <div style={styles.sectionLabel}>Past Attempts</div>
          {attempts.map(a => (
            <div key={a.id} style={styles.card}>
              <div>
                <div style={styles.quizTitle}>{a.quiz_title}</div>
                <div style={styles.meta}>{formatDate(a.completed_at)}</div>
              </div>
              <div style={styles.right}>
                <div style={styles.score}>{a.score}/{a.total_questions}</div>
                <button style={styles.deleteBtn} onClick={() => handleDelete(a.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

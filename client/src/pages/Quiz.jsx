import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizzes } from '../data/quizzes';

const ATTEMPTS_KEY = 'thinkrep_attempts';

function getAttempts() {
  return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
}

function saveAttempt(attempt) {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
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
    marginBottom: '4px',
  },
  progress: {
    color: '#8888A0',
    fontSize: '13px',
    marginBottom: '20px',
  },
  question: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },
  option: {
    padding: '14px 16px',
    background: '#1C1C22',
    border: '1px solid #2A2A34',
    borderRadius: '10px',
    color: '#F0F0F0',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  selected: {
    background: '#818CF8',
    borderColor: '#818CF8',
    color: '#fff',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#4ADE80',
    color: '#0B0B0F',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  resultCard: {
    background: '#1C1C22',
    border: '1px solid #2A2A34',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '10px',
  },
  correct: {
    borderLeft: '3px solid #4ADE80',
  },
  wrong: {
    borderLeft: '3px solid #F87171',
  },
  score: {
    fontSize: '28px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '4px',
  },
  scoreSub: {
    textAlign: 'center',
    color: '#8888A0',
    fontSize: '14px',
    marginBottom: '24px',
  },
  explanation: {
    color: '#8888A0',
    fontSize: '13px',
    lineHeight: '1.5',
    marginTop: '8px',
  },
  tag: {
    display: 'inline-block',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '8px',
  },
};

const optionLabels = ['A', 'B', 'C', 'D'];
const optionKeys = ['a', 'b', 'c', 'd'];

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const quiz = quizzes.find(q => q.id === parseInt(id));
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  if (!quiz) return null;

  const questions = quiz.questions;
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const selected = answers[q?.id];

  function selectOption(key) {
    if (results) return;
    setAnswers(prev => ({ ...prev, [q.id]: key }));
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  }

  function submit() {
    let score = 0;
    const resultList = questions.map(question => {
      const picked = answers[question.id] || null;
      const isCorrect = picked === question.correct_option;
      if (isCorrect) score++;
      return {
        question_id: question.id,
        correct: isCorrect,
        correct_option: question.correct_option,
        explanation: question.explanation,
      };
    });

    saveAttempt({
      id: Date.now(),
      user_id: user.id,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      score,
      total_questions: questions.length,
      completed_at: new Date().toISOString(),
    });

    setResults({ score, total: questions.length, results: resultList });
  }

  if (results) {
    const resultMap = new Map(results.results.map(r => [r.question_id, r]));
    return (
      <div style={styles.page}>
        <div style={styles.score}>
          {results.score}/{results.total}
        </div>
        <div style={styles.scoreSub}>
          {results.score === results.total ? 'Perfect score!' :
           results.score >= results.total * 0.8 ? 'Great job!' :
           results.score >= results.total * 0.6 ? 'Not bad!' : 'Keep practicing!'}
        </div>
        {questions.map((question, i) => {
          const r = resultMap.get(question.id);
          return (
            <div key={question.id} style={{ ...styles.resultCard, ...(r?.correct ? styles.correct : styles.wrong) }}>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                <strong>Q{i + 1}.</strong> {question.question_text}
                <span style={{
                  ...styles.tag,
                  background: r?.correct ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                  color: r?.correct ? '#4ADE80' : '#F87171',
                }}>
                  {r?.correct ? 'Correct' : 'Wrong'}
                </span>
              </div>
              {!r?.correct && (
                <div style={{ fontSize: '13px', color: '#F0F0F0', marginTop: '4px' }}>
                  Your answer: {optionLabels[optionKeys.indexOf(answers[question.id])]} | Correct: {optionLabels[optionKeys.indexOf(r?.correct_option)]}
                </div>
              )}
              <div style={styles.explanation}>{r?.explanation}</div>
            </div>
          );
        })}
        <button style={{ ...styles.btn, marginTop: '16px' }} onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.title}>{quiz.title}</div>
      <div style={styles.progress}>Question {current + 1} of {questions.length}</div>
      <div style={styles.question}>{q.question_text}</div>
      <div style={styles.options}>
        {optionKeys.map((key, i) => (
          <button
            key={key}
            style={{
              ...styles.option,
              ...(selected === key ? styles.selected : {}),
            }}
            onClick={() => selectOption(key)}
          >
            <strong>{optionLabels[i]}.</strong> {q[`option_${key}`]}
          </button>
        ))}
      </div>
      {isLast ? (
        <button
          style={{ ...styles.btn, ...(!selected ? styles.btnDisabled : {}) }}
          onClick={submit}
          disabled={!selected}
        >
          Submit Quiz
        </button>
      ) : (
        <button
          style={{ ...styles.btn, ...(!selected ? styles.btnDisabled : {}) }}
          onClick={next}
          disabled={!selected}
        >
          Next
        </button>
      )}
    </div>
  );
}

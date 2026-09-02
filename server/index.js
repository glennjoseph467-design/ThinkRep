const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'thinkrep-dev-secret-change-in-prod';

app.use(cors());
app.use(express.json());

// --- Database setup ---
const db = new Database(path.join(__dirname, 'thinkrep.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK(correct_option IN ('a','b','c','d')),
    explanation TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TEXT DEFAULT (datetime('now'))
  );
`);

// --- Seed data ---
const quizCount = db.prepare('SELECT COUNT(*) as c FROM quizzes').get().c;
if (quizCount === 0) {
  const insertQuiz = db.prepare('INSERT INTO quizzes (title, description) VALUES (?, ?)');
  const insertQuestion = db.prepare('INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  const seed = db.transaction(() => {
    // Quiz 1: Logical Reasoning
    const q1 = insertQuiz.run('Logical Reasoning', 'Test your ability to identify patterns, evaluate syllogisms, and solve logic puzzles.');

    insertQuestion.run(q1.lastInsertRowid,
      'All roses are flowers. Some flowers fade quickly. Which conclusion must be true?',
      'All roses fade quickly',
      'Some roses fade quickly',
      'Neither conclusion necessarily follows',
      'Both conclusions follow',
      'c',
      'The premise says SOME flowers fade quickly — roses may or may not be among that subset. Without knowing which flowers fade quickly, neither conclusion is guaranteed.'
    );
    insertQuestion.run(q1.lastInsertRowid,
      'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
      '40',
      '42',
      '36',
      '44',
      'b',
      'The differences between terms are 4, 6, 8, 10 — each increasing by 2. The next difference is 12, so 30 + 12 = 42. Alternatively, the nth term is n(n+1).'
    );
    insertQuestion.run(q1.lastInsertRowid,
      'If no musicians are tone-deaf, and some athletes are musicians, which must be true?',
      'No athletes are tone-deaf',
      'Some athletes are not tone-deaf',
      'All musicians are athletes',
      'Some tone-deaf people are athletes',
      'b',
      'Some athletes are musicians, and no musicians are tone-deaf, so those athlete-musicians are definitely not tone-deaf. Therefore some athletes are not tone-deaf.'
    );
    insertQuestion.run(q1.lastInsertRowid,
      'A is taller than B. C is shorter than B. D is taller than A. Who is the shortest?',
      'A',
      'B',
      'C',
      'D',
      'c',
      'From tallest to shortest: D > A > B > C. C is shorter than B, who is shorter than A, who is shorter than D.'
    );
    insertQuestion.run(q1.lastInsertRowid,
      'If it rains, the ground is wet. The ground is wet. What can you conclude?',
      'It rained',
      'It might have rained, or something else caused it',
      'It definitely did not rain',
      'Rain is the only possible cause',
      'b',
      'This is the fallacy of affirming the consequent. The ground being wet is consistent with rain but doesn\'t prove it — a sprinkler, spill, or dew could also be the cause.'
    );

    // Quiz 2: Business & Estimation
    const q2 = insertQuiz.run('Business & Estimation', 'Quick math, market sizing, and business judgment questions to sharpen your analytical instincts.');

    insertQuestion.run(q2.lastInsertRowid,
      'A chai stall sells 200 cups/day at Rs 15 each. Monthly rent is Rs 8,000 and supplies cost Rs 5 per cup. What is the approximate monthly profit?',
      'Rs 30,000',
      'Rs 52,000',
      'Rs 82,000',
      'Rs 90,000',
      'b',
      'Revenue: 200 x 15 x 30 = Rs 90,000. Supply costs: 200 x 5 x 30 = Rs 30,000. Rent: Rs 8,000. Profit = 90,000 - 30,000 - 8,000 = Rs 52,000.'
    );
    insertQuestion.run(q2.lastInsertRowid,
      'A SaaS company has 10,000 users paying $20/month with 5% monthly churn. Roughly how many users remain after 6 months if no new users join?',
      'About 7,350',
      'About 5,000',
      'About 8,500',
      'About 6,000',
      'a',
      'Each month 95% of users remain: 10,000 x 0.95^6 = 10,000 x 0.735 = 7,351. Compounding churn is more aggressive than it seems.'
    );
    insertQuestion.run(q2.lastInsertRowid,
      'A city has 5 million people. Roughly how many dentists does it need if each dentist handles 2,000 patients per year?',
      '250',
      '2,500',
      '25,000',
      '500',
      'b',
      '5,000,000 / 2,000 = 2,500 dentists. This is a classic Fermi estimation — break the problem into the population and the service capacity per provider.'
    );
    insertQuestion.run(q2.lastInsertRowid,
      'You invest Rs 1,00,000 with a 12% annual return. Using the Rule of 72, approximately when will your money double?',
      '4 years',
      '6 years',
      '8 years',
      '12 years',
      'b',
      'Rule of 72: divide 72 by the annual interest rate. 72 / 12 = 6 years. This quick mental shortcut gives a close approximation of doubling time.'
    );
    insertQuestion.run(q2.lastInsertRowid,
      'A restaurant has 40 seats and turns tables 3 times during dinner service. Average bill is Rs 800. What is the maximum dinner revenue?',
      'Rs 32,000',
      'Rs 96,000',
      'Rs 1,20,000',
      'Rs 64,000',
      'b',
      '40 seats x 3 turns x Rs 800 = Rs 96,000. This assumes full capacity every turn — in practice, occupancy would be lower.'
    );

    // Quiz 3: Critical Thinking
    const q3 = insertQuiz.run('Critical Thinking', 'Analyze arguments, spot logical fallacies, and separate strong reasoning from flawed assumptions.');

    insertQuestion.run(q3.lastInsertRowid,
      '"Sales increased after we changed the logo. Therefore the new logo caused more sales." This is an example of:',
      'Valid deductive reasoning',
      'Correlation vs causation error',
      'Straw man fallacy',
      'Appeal to authority',
      'b',
      'Just because two events occurred in sequence does not mean one caused the other. Many other factors (season, marketing spend, market trends) could explain the sales increase.'
    );
    insertQuestion.run(q3.lastInsertRowid,
      '"We should reject this climate policy because the politician proposing it failed their economics class in college." This is:',
      'Valid criticism',
      'Red herring',
      'Ad hominem fallacy',
      'False dilemma',
      'c',
      'Attacking the person rather than their argument is an ad hominem fallacy. A policy\'s merit is independent of its proposer\'s college grades.'
    );
    insertQuestion.run(q3.lastInsertRowid,
      'A study shows that ice cream sales and drowning rates both increase in summer. Which interpretation is most reasonable?',
      'Ice cream causes drowning',
      'Drowning causes people to buy ice cream',
      'A third factor (hot weather) drives both',
      'The data must be wrong',
      'c',
      'This is a classic confounding variable example. Hot weather independently causes both increased swimming (and drowning risk) and increased ice cream consumption.'
    );
    insertQuestion.run(q3.lastInsertRowid,
      '"Everyone in my friend group uses this app, so it must be the best one available." What assumption does this rely on?',
      'The app has good reviews',
      'A small sample is representative of the whole market',
      'Friends always make optimal choices',
      'Popular things are always best',
      'b',
      'This commits the hasty generalization fallacy — a small, non-random sample (your friend group) may share biases and does not represent the entire market.'
    );
    insertQuestion.run(q3.lastInsertRowid,
      'A company says "our product is safe because no one has proven it\'s dangerous." What is wrong with this argument?',
      'Nothing — absence of evidence is evidence of absence',
      'It shifts the burden of proof to the wrong side',
      'It uses a straw man',
      'It is an appeal to emotion',
      'b',
      'This is an argument from ignorance. The lack of evidence against safety doesn\'t constitute proof of safety — the burden should be on the company to demonstrate its product is safe.'
    );
  });

  seed();
  console.log('Seeded 3 quizzes with 5 questions each.');
}

// --- Auth middleware ---
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Auth routes ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, name);
  const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, email, name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// --- Quiz routes ---
app.get('/api/quizzes', auth, (req, res) => {
  const quizzes = db.prepare(`
    SELECT q.id, q.title, q.description, COUNT(qn.id) as question_count
    FROM quizzes q
    LEFT JOIN questions qn ON qn.quiz_id = q.id
    GROUP BY q.id
  `).all();
  res.json({ quizzes });
});

app.get('/api/quizzes/:id', auth, (req, res) => {
  const quiz = db.prepare('SELECT id, title, description FROM quizzes WHERE id = ?').get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = db.prepare(
    'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = ?'
  ).all(req.params.id);
  res.json({ quiz: { ...quiz, questions } });
});

// --- Attempt routes ---
app.post('/api/attempts', auth, (req, res) => {
  const { quiz_id, answers } = req.body;
  if (!quiz_id || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'quiz_id and answers array are required' });
  }
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz_id);
  if (questions.length === 0) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const questionMap = new Map(questions.map(q => [q.id, q]));
  let score = 0;
  const results = answers.map(a => {
    const q = questionMap.get(a.question_id);
    if (!q) return { question_id: a.question_id, correct: false, correct_option: null, explanation: 'Question not found' };
    const isCorrect = a.selected_option === q.correct_option;
    if (isCorrect) score++;
    return {
      question_id: a.question_id,
      correct: isCorrect,
      correct_option: q.correct_option,
      explanation: q.explanation
    };
  });

  const result = db.prepare(
    'INSERT INTO attempts (user_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)'
  ).run(req.userId, quiz_id, score, questions.length);

  res.json({ id: result.lastInsertRowid, score, total: questions.length, results });
});

app.get('/api/attempts', auth, (req, res) => {
  const attempts = db.prepare(`
    SELECT a.id, a.quiz_id, q.title as quiz_title, a.score, a.total_questions, a.completed_at
    FROM attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    WHERE a.user_id = ?
    ORDER BY a.completed_at DESC
  `).all(req.userId);
  res.json({ attempts });
});

app.delete('/api/attempts/:id', auth, (req, res) => {
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  db.prepare('DELETE FROM attempts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Serve frontend in production ---
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`ThinkRep server running on http://localhost:${PORT}`);
});

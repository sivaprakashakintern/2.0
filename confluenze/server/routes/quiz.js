const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const questions = require('../data/questions');
const { broadcast } = require('../ws/handler');

// All quiz routes require authentication
router.use(authMiddleware);

// ─── GET QUESTIONS ─────────────────────────────────────────────
router.get('/questions', async (req, res) => {
    // Return questions without answer field to clients
    const safeQuestions = questions.map(({ answer, ...q }) => q);
    res.json(safeQuestions);
});

// ─── GET PROGRESS (resume) ─────────────────────────────────────
router.get('/progress', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM quiz_progress WHERE user_id = ?', [req.user.id]
        );

        if (rows.length === 0) {
            return res.json({ status: 'not_started', answers: {}, current_page: 1, time_remaining: 1800 });
        }

        const progress = rows[0];
        // If in progress, recalculate remaining time
        let timeRemaining = progress.time_remaining;
        if (progress.status === 'in_progress' && progress.started_at) {
            const elapsed = Math.floor((Date.now() - new Date(progress.started_at).getTime()) / 1000);
            timeRemaining = Math.max(0, 1800 - elapsed);

            // Auto-submit if time expired
            if (timeRemaining === 0 && progress.status === 'in_progress') {
                await autoSubmit(req.user.id, progress.answers);
                const [result] = await db.query('SELECT score FROM results WHERE user_id = ?', [req.user.id]);
                return res.json({ status: 'submitted', score: result[0]?.score || 0 });
            }
        }

        const answers = typeof progress.answers === 'string'
            ? JSON.parse(progress.answers)
            : progress.answers;

        res.json({
            status: progress.status,
            current_page: progress.current_page,
            answers,
            time_remaining: timeRemaining,
            half_complete: progress.half_complete
        });
    } catch (err) {
        console.error('Progress error:', err);
        res.status(500).json({ error: 'Failed to load progress.' });
    }
});

// ─── START QUIZ ────────────────────────────────────────────────
router.post('/start', async (req, res) => {
    try {
        // Check if already submitted
        const [existing] = await db.query(
            'SELECT status FROM quiz_progress WHERE user_id = ?', [req.user.id]
        );

        if (existing.length > 0 && existing[0].status === 'submitted') {
            return res.status(400).json({ error: 'Quiz already submitted.' });
        }

        const now = new Date();

        if (existing.length === 0) {
            await db.query(
                `INSERT INTO quiz_progress (user_id, status, started_at, time_remaining, answers, current_page)
         VALUES (?, 'in_progress', ?, 1800, '{}', 1)`,
                [req.user.id, now]
            );
        } else if (existing[0].status === 'not_started') {
            await db.query(
                `UPDATE quiz_progress SET status='in_progress', started_at=? WHERE user_id=?`,
                [now, req.user.id]
            );
        }
        // If already in_progress, do nothing (resume)

        broadcast({ type: 'quiz_started', userId: req.user.id });

        res.json({ message: 'Quiz started.', started_at: now });
    } catch (err) {
        console.error('Start error:', err);
        res.status(500).json({ error: 'Failed to start quiz.' });
    }
});

// ─── SAVE ANSWERS (autosave) ────────────────────────────────────
router.post('/save', async (req, res) => {
    const { answers, current_page } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT status, started_at FROM quiz_progress WHERE user_id = ?', [req.user.id]
        );

        if (rows.length === 0 || rows[0].status === 'submitted') {
            return res.status(400).json({ error: 'Cannot save — quiz not active.' });
        }

        // Recalculate time remaining  
        const elapsed = Math.floor((Date.now() - new Date(rows[0].started_at).getTime()) / 1000);
        const timeRemaining = Math.max(0, 1800 - elapsed);

        // Mark half complete if on page 3+ (answered 10+ questions)
        const answeredCount = Object.keys(answers || {}).length;
        const halfComplete = answeredCount >= 10 ? 1 : 0;

        await db.query(
            `UPDATE quiz_progress 
       SET answers = ?, current_page = ?, time_remaining = ?, half_complete = ?, last_saved = NOW()
       WHERE user_id = ?`,
            [JSON.stringify(answers || {}), current_page || 1, timeRemaining, halfComplete, req.user.id]
        );

        // Broadcast progress update
        broadcast({
            type: 'progress_update',
            userId: req.user.id,
            current_page,
            answered: answeredCount,
            time_remaining: timeRemaining
        });

        res.json({ saved: true, time_remaining: timeRemaining });
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: 'Failed to save answers.' });
    }
});

// ─── SUBMIT QUIZ ────────────────────────────────────────────────
router.post('/submit', async (req, res) => {
    const { answers } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT status, started_at FROM quiz_progress WHERE user_id = ?', [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Quiz not started.' });
        }

        if (rows[0].status === 'submitted') {
            const [result] = await db.query('SELECT * FROM results WHERE user_id = ?', [req.user.id]);
            return res.json({ already_submitted: true, score: result[0]?.score || 0 });
        }

        const result = await autoSubmit(req.user.id, answers, rows[0].started_at);
        res.json({ success: true, score: result.score, total: 20 });
    } catch (err) {
        console.error('Submit error:', err);
        res.status(500).json({ error: 'Submission failed.' });
    }
});

// ─── Helper: Auto Submit ────────────────────────────────────────
async function autoSubmit(userId, answers, startedAt) {
    const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : (answers || {});

    // Calculate score
    let score = 0;
    questions.forEach(q => {
        const userAnswer = parsedAnswers[q.id];
        if (userAnswer !== undefined && parseInt(userAnswer) === q.answer) {
            score++;
        }
    });

    const completionTime = startedAt
        ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        : 1800;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            `UPDATE quiz_progress SET status='submitted', submitted_at=NOW(), answers=? WHERE user_id=?`,
            [JSON.stringify(parsedAnswers), userId]
        );

        await conn.query(
            `INSERT INTO results (user_id, score, total, completion_time)
       VALUES (?, ?, 20, ?)
       ON DUPLICATE KEY UPDATE score=?, completion_time=?, submitted_at=NOW()`,
            [userId, score, completionTime, score, completionTime]
        );

        await conn.commit();
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }

    broadcast({ type: 'quiz_submitted', userId, score });
    return { score };
}

module.exports = router;

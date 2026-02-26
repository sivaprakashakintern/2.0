const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const questions = require('../data/questions');

router.use(authMiddleware, adminMiddleware);

// ─── GET ALL PARTICIPANTS ──────────────────────────────────────
router.get('/participants', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        u.id, u.username, u.member1, u.member2,
        u.contact1, u.contact2, u.chest_number, u.college,
        COALESCE(qp.status, 'not_started') AS status,
        COALESCE(qp.current_page, 1) AS current_page,
        COALESCE(r.score, 0) AS score,
        qp.half_complete,
        qp.started_at,
        qp.submitted_at,
        qp.time_remaining,
        qp.answers,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS shortlisted
      FROM users u
      LEFT JOIN quiz_progress qp ON u.id = qp.user_id
      LEFT JOIN results r ON u.id = r.user_id
      LEFT JOIN shortlist s ON u.id = s.user_id
      WHERE u.is_admin = 0
      ORDER BY u.created_at ASC
    `);

        // Calculate live time remaining for in-progress users
        const enriched = rows.map(row => {
            let time_remaining = row.time_remaining;
            if (row.status === 'in_progress' && row.started_at) {
                const elapsed = Math.floor((Date.now() - new Date(row.started_at).getTime()) / 1000);
                time_remaining = Math.max(0, 1800 - elapsed);
            }
            const answers = typeof row.answers === 'string' ? JSON.parse(row.answers || '{}') : (row.answers || {});
            return {
                ...row,
                time_remaining,
                answered_count: Object.keys(answers).length
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error('Participants error:', err);
        res.status(500).json({ error: 'Failed to fetch participants.' });
    }
});

// ─── LEADERBOARD ───────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        u.id, u.member1, u.member2,
        u.college, u.chest_number, u.contact1, u.contact2,
        r.score, r.total, r.completion_time, r.submitted_at,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS shortlisted
      FROM results r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN shortlist s ON u.id = s.user_id
      ORDER BY r.score DESC, r.completion_time ASC
    `);
        res.json(rows);
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
});

// ─── DETAILED RESULT FOR ONE USER ──────────────────────────────
router.get('/results/:userId', async (req, res) => {
    try {
        const [userRows] = await db.query(
            'SELECT id, member1, member2, college, chest_number FROM users WHERE id = ?',
            [req.params.userId]
        );
        if (userRows.length === 0) return res.status(404).json({ error: 'User not found.' });

        const [progressRows] = await db.query(
            'SELECT answers, status FROM quiz_progress WHERE user_id = ?',
            [req.params.userId]
        );
        const [resultRows] = await db.query(
            'SELECT score, total, completion_time, submitted_at FROM results WHERE user_id = ?',
            [req.params.userId]
        );

        const answers = progressRows.length > 0
            ? (typeof progressRows[0].answers === 'string'
                ? JSON.parse(progressRows[0].answers || '{}')
                : progressRows[0].answers || {})
            : {};

        // Build detailed answer breakdown
        const breakdown = questions.map(q => ({
            id: q.id,
            question: q.question,
            code: q.code,
            language: q.language,
            difficulty: q.difficulty,
            options: q.options,
            correct_answer: q.answer,
            user_answer: answers[q.id] !== undefined ? parseInt(answers[q.id]) : null,
            is_correct: answers[q.id] !== undefined && parseInt(answers[q.id]) === q.answer
        }));

        res.json({
            user: userRows[0],
            result: resultRows[0] || null,
            breakdown
        });
    } catch (err) {
        console.error('Results detail error:', err);
        res.status(500).json({ error: 'Failed to fetch results.' });
    }
});

// ─── SHORTLIST: GET ────────────────────────────────────────────
router.get('/shortlist', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT u.id, u.member1, u.member2,
             u.contact1, u.contact2, u.college, u.chest_number,
             r.score, r.completion_time, s.selected_at
      FROM shortlist s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN results r ON u.id = r.user_id
      ORDER BY r.score DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error('Shortlist error:', err);
        res.status(500).json({ error: 'Failed to fetch shortlist.' });
    }
});

// ─── SHORTLIST: TOGGLE ─────────────────────────────────────────
router.post('/shortlist/toggle', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required.' });

    try {
        const [existing] = await db.query('SELECT id FROM shortlist WHERE user_id = ?', [userId]);
        if (existing.length > 0) {
            await db.query('DELETE FROM shortlist WHERE user_id = ?', [userId]);
            res.json({ shortlisted: false });
        } else {
            await db.query('INSERT INTO shortlist (user_id) VALUES (?)', [userId]);
            res.json({ shortlisted: true });
        }
    } catch (err) {
        console.error('Shortlist toggle error:', err);
        res.status(500).json({ error: 'Failed to update shortlist.' });
    }
});

// ─── UPDATE USER ───────────────────────────────────────────────
router.put('/users/:id', async (req, res) => {
    const { member1, member2, contact1, contact2, chest_number, college, username, password } = req.body;
    try {
        let query = `
            UPDATE users 
            SET member1 = ?, member2 = ?, contact1 = ?, contact2 = ?, chest_number = ?, college = ?, username = ?
        `;
        let params = [member1, member2, contact1, contact2, chest_number, college, username];

        if (password && password.trim() !== '') {
            const password_hash = await bcrypt.hash(password, 10);
            query += `, password_hash = ?`;
            params.push(password_hash);
        }

        query += ` WHERE id = ? AND is_admin = 0`;
        params.push(req.params.id);

        await db.query(query, params);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

// ─── DELETE USER ───────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ? AND is_admin = 0', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// ─── CLEAR ALL USERS ───────────────────────────────────────────
router.delete('/users', async (req, res) => {
    try {
        // We delete users where is_admin = 0. Cascade will handle quiz_progress and results.
        await db.query('DELETE FROM users WHERE is_admin = 0');
        res.json({ message: 'All participant accounts removed successfully' });
    } catch (err) {
        console.error('Clear users error:', err);
        res.status(500).json({ error: 'Failed to clear users.' });
    }
});

module.exports = router;


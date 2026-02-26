const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// ─── REGISTER ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const {
        username, password,
        member1, member2, contact1, contact2,
        chest_number, college
    } = req.body;

    // Validate required fields
    if (!username || !password || !member1 || !contact1 || !chest_number || !college) {
        return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    if (username.toLowerCase() === 'niitm') {
        return res.status(400).json({ error: 'Username not allowed.' });
    }

    if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    try {
        // Check duplicate username
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username already taken. Choose another.' });
        }

        // Check duplicate chest number
        const [chestCheck] = await db.query('SELECT id FROM users WHERE chest_number = ?', [chest_number]);
        if (chestCheck.length > 0) {
            return res.status(409).json({ error: 'Chest number already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (username, password_hash, member1, member2, contact1, contact2, chest_number, college)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, password_hash, member1, member2, contact1, contact2, chest_number, college]
        );

        res.status(201).json({ message: 'Registration successful! You can now login.' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// ─── LOGIN ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Check if quiz already submitted (non-admin)
        if (!user.is_admin) {
            const [progress] = await db.query(
                'SELECT status FROM quiz_progress WHERE user_id = ?', [user.id]
            );
            if (progress.length > 0 && progress[0].status === 'submitted') {
                return res.status(200).json({
                    submitted: true,
                    message: 'Quiz already submitted. Wait for next round.'
                });
            }
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                member1: user.member1,
                member2: user.member2,
                college: user.college,
                chest_number: user.chest_number,
                is_admin: user.is_admin
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

module.exports = router;

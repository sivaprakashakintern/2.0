import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/img.png';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/login', form);

            if (data.submitted) {
                setPopup(true);
                setLoading(false);
                return;
            }

            login(data.token, data.user);
            navigate(data.user.is_admin ? '/admin' : '/welcome');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            {popup && (
                <div className="modal-overlay" onClick={() => setPopup(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
                        <h2 style={{ marginBottom: '12px', color: 'var(--neon-cyan)' }}>Quiz Submitted</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                            Your quiz has already been submitted.<br />
                            <strong style={{ color: 'var(--neon-green)' }}>Wait for the next round.</strong><br />
                            Selected teams will be contacted.
                        </p>
                        <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => setPopup(false)}>Close</button>
                    </div>
                </div>
            )}

            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.7rem', letterSpacing: '4px', marginBottom: '12px' }}>
                        {'>'} SYSTEM ACCESS
                    </div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 900 }}>
                        <span className="neon-text">CONFLUENZE</span>
                    </h1>
                </div>

                <div className="card fade-in">
                    {error && <div className="alert alert-error">⚠ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="label">Username</label>
                            <input className="input" type="text" name="username"
                                value={form.username} onChange={handleChange}
                                placeholder="your_username" required autoComplete="off" />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="label">Password</label>
                            <input className="input" type="password" name="password"
                                value={form.password} onChange={handleChange}
                                placeholder="••••••••" required />
                        </div>

                        <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Authenticating...' : '→ LOGIN'}
                        </button>
                    </form>

                    <div className="neon-divider" />

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        New team?{' '}
                        <Link to="/register" style={{ color: 'var(--neon-green)', textDecoration: 'none' }}>Register here</Link>
                    </p>
                </div>


            </div>
        </div>
    );
}

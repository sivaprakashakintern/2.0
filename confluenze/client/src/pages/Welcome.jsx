import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Welcome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleStartQuiz = async () => {
        setLoading(true);
        try {
            await axios.post('/api/quiz/start');
            // Enter fullscreen
            try {
                await document.documentElement.requestFullscreen();
            } catch (_) { /* Fullscreen not critical */ }
            navigate('/quiz');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to start quiz.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div style={{ width: '100%', maxWidth: '760px', padding: '0 16px' }} className="fade-in">

                {/* Welcome card */}
                <div className="card" style={{ textAlign: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,212,255,0.05))' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.7rem', letterSpacing: '4px', marginBottom: '16px' }}>
            // WELCOME BACK
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>
                        ID: <span className="neon-text">{user?.chest_number}</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {user?.member1}{user?.member2 ? ` & ${user.member2}` : ''} • {user?.college}
                    </p>
                </div>

                {/* Instructions */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '20px', letterSpacing: '2px' }}>
            // EVENT INSTRUCTIONS
                    </h2>

                    <div style={{ display: 'grid', gap: '14px' }}>
                        {[
                            ['⏱', '30 Minutes', 'Timer starts immediately when you click START QUIZ'],
                            ['📝', '20 Questions', 'Debugging challenges across C, C++, and Java — Mixed Easy & Hard'],
                            ['📄', '5 Per Page', 'Navigate through 4 pages with Next/Previous controls'],
                            ['💾', 'Auto-Save', 'Answers save automatically — safe to refresh. Resume on reconnect'],
                            ['🔒', 'One Attempt', 'Quiz cannot be re-attempted after submission'],
                            ['🚫', 'No Cheating', 'Stay in fullscreen. External resources are not allowed'],
                        ].map(([icon, title, desc]) => (
                            <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '1.3rem', flex: '0 0 auto' }}>{icon}</span>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleStartQuiz}
                        disabled={loading}
                        style={{ padding: '20px 60px', fontSize: '1.2rem', letterSpacing: '3px' }}
                    >
                        {loading ? '→ LAUNCHING...' : '▶ START QUIZ'}
                    </button>
                    <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        Clicking START will enter fullscreen and begin the 30-minute timer
                    </p>
                </div>



            </div>
        </div>
    );
}

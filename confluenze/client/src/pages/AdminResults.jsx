import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminResults() {
    const { userId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/admin/results/${userId}`)
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="page-center"><div className="spinner" /></div>;
    if (!data) return <div className="page-center"><p>Not found.</p></div>;

    const { user, result, breakdown } = data;
    const correct = breakdown.filter(q => q.is_correct).length;

    const diffColors = { 'easy': 'var(--neon-green)', 'medium': 'var(--neon-cyan)', 'medium-hard': 'var(--neon-orange)', 'hard': 'var(--neon-red)' };

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px', maxWidth: '900px' }}>
            <Link to="/admin" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
                ← Back to Dashboard
            </Link>

            {/* Team info */}
            <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(0,255,136,0.04), rgba(0,212,255,0.04))', borderColor: 'rgba(0,255,136,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.7rem', letterSpacing: '3px', marginBottom: '6px' }}>
              // RESULT DETAILS
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{user.member1} & {user.member2}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '4px' }}>
                            {user.member1} & {user.member2} • {user.chest_number} • {user.college}
                        </p>
                    </div>
                    {result ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 900, color: 'var(--neon-green)' }}>
                                {result.score}/20
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>FINAL SCORE</div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Not submitted yet</div>
                    )}
                </div>
            </div>

            {/* Breakdown */}
            <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px' }}>
        // ANSWER BREAKDOWN ({correct}/20 correct)
            </h3>

            {breakdown.map((q, i) => (
                <div key={q.id} className="card" style={{
                    marginBottom: '16px',
                    borderColor: q.user_answer === null ? 'var(--border)' : q.is_correct ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)',
                    background: q.user_answer === null ? 'var(--bg-card)' : q.is_correct ? 'rgba(0,255,136,0.03)' : 'rgba(255,51,102,0.03)'
                }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: q.is_correct ? 'var(--neon-green)' : q.user_answer === null ? 'var(--text-muted)' : 'var(--neon-red)' }}>
                            {q.user_answer === null ? '○' : q.is_correct ? '✓' : '✗'} Q{i + 1}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '20px', border: `1px solid ${diffColors[q.difficulty]}`, color: diffColors[q.difficulty] }}>
                            {q.difficulty}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{q.language}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>{q.question}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {q.options.map((opt, oi) => {
                            const isCorrect = oi === q.correct_answer;
                            const isUser = oi === q.user_answer;
                            let style = { padding: '8px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', border: '1px solid var(--border)', color: 'var(--text-muted)' };
                            if (isCorrect) style = { ...style, background: 'rgba(0,255,136,0.1)', borderColor: 'var(--neon-green)', color: 'var(--neon-green)' };
                            if (isUser && !isCorrect) style = { ...style, background: 'rgba(255,51,102,0.1)', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' };
                            return (
                                <div key={oi} style={style}>
                                    {String.fromCharCode(65 + oi)}. {opt}
                                    {isCorrect && ' ✓'}
                                    {isUser && !isCorrect && ' ✗ (selected)'}
                                </div>
                            );
                        })}
                    </div>

                    {q.user_answer === null && <p style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Not answered</p>}
                </div>
            ))}
        </div>
    );
}

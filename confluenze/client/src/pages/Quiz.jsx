import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QUESTIONS_PER_PAGE = 5;
const TOTAL_TIME = 1800; // 30 min

function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function Quiz() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [status, setStatus] = useState('loading'); // loading | in_progress | submitted
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const timerRef = useRef(null);
    const saveRef = useRef(null);
    const answersRef = useRef(answers);
    const pageRef = useRef(currentPage);

    // Keep refs in sync
    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { pageRef.current = currentPage; }, [currentPage]);

    const totalPages = Math.ceil(20 / QUESTIONS_PER_PAGE);
    const pageQuestions = questions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

    // ─── Load questions + resume progress ─────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [qRes, pRes] = await Promise.all([
                    axios.get('/api/quiz/questions'),
                    axios.get('/api/quiz/progress')
                ]);

                setQuestions(qRes.data);
                const progress = pRes.data;

                if (progress.status === 'submitted') {
                    navigate('/result');
                    return;
                }

                setAnswers(progress.answers || {});
                setCurrentPage(progress.current_page || 1);
                const serverTime = progress.time_remaining ?? TOTAL_TIME;
                setTimeLeft(serverTime);
                setStatus('in_progress');
                console.log('Quiz initialized. Timer starting at:', serverTime);
            } catch (err) {
                console.error('Init error:', err);
                setStatus('error');
            }
        };
        init();
    }, [navigate]);

    // ─── Countdown timer ───────────────────────────────────────────
    useEffect(() => {
        if (status !== 'in_progress') return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true); // auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [status]);

    // ─── Autosave every 15s ────────────────────────────────────────
    const saveProgress = useCallback(async (silent = true) => {
        if (!silent) setSaving(true);
        try {
            await axios.post('/api/quiz/save', {
                answers: answersRef.current,
                current_page: pageRef.current
            });
        } catch (e) { console.error('Autosave failed:', e); }
        finally { if (!silent) setSaving(false); }
    }, []);

    useEffect(() => {
        if (status !== 'in_progress') return;
        saveRef.current = setInterval(() => saveProgress(true), 15000);
        return () => clearInterval(saveRef.current);
    }, [status, saveProgress]);

    // ─── Select answer ─────────────────────────────────────────────
    const selectAnswer = (qId, optIdx) => {
        const newAnswers = { ...answersRef.current, [qId]: optIdx };
        setAnswers(newAnswers);
        answersRef.current = newAnswers;
        // Instant autosave on selection
        axios.post('/api/quiz/save', { answers: newAnswers, current_page: pageRef.current })
            .catch(() => { });
    };

    // ─── Page navigation ───────────────────────────────────────────
    const goPage = async (page) => {
        await saveProgress(true);
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─── Submit ────────────────────────────────────────────────────
    const handleSubmit = async (auto = false) => {
        if (submitting) return;
        clearInterval(timerRef.current);
        clearInterval(saveRef.current);
        setSubmitting(true);
        try {
            await axios.post('/api/quiz/submit', { answers: answersRef.current });
            setStatus('submitted'); // Show success screen locally first
            setTimeout(() => navigate('/result'), 2500);
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitting(false);
        }
    };

    // ─── Timer color ───────────────────────────────────────────────
    const timerClass = timeLeft > 600 ? 'timer-normal' : timeLeft > 180 ? 'timer-warning' : 'timer-danger';

    // ─── Error state ───────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className="page-center" style={{ flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <h2 style={{ color: 'var(--neon-red)' }}>Connection Error</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Failed to load your quiz progress.<br />
                    Please check your internet and refresh the page.
                </p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>↻ REFRESH PAGE</button>
            </div>
        );
    }

    // ─── Loading state ─────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div className="page-center" style={{ flexDirection: 'column', gap: '16px' }}>
                <div className="spinner" />
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    Loading quiz...
                </p>
            </div>
        );
    }

    // ─── Post-Submission Success State ─────────────────────────────
    if (status === 'submitted') {
        return (
            <div className="page-center">
                <div style={{ textAlign: 'center' }} className="fade-in">
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: 'rgba(0,255,136,0.1)', border: '2px solid var(--neon-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 32px', fontSize: '4rem',
                        boxShadow: 'var(--glow-green)',
                        animation: 'pulse 1.5s infinite'
                    }}>
                        ✓
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '16px' }}>
                        // TRANSMISSION COMPLETE
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>
                        SUBMISSION <span className="neon-text">SUCCESSFUL</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        Redirecting to next phase...
                    </p>
                </div>
            </div>
        );
    }

    const answeredOnPage = pageQuestions.filter(q => answers[q.id] !== undefined).length;
    const totalAnswered = Object.keys(answers).length;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Confirm submit modal */}
            {confirmSubmit && (
                <div className="modal-overlay">
                    <div className="modal" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ marginBottom: '12px' }}>Submit Quiz?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '24px' }}>
                            You have answered <strong style={{ color: 'var(--neon-green)' }}>{totalAnswered}/20</strong> questions.<br />
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setConfirmSubmit(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => { setConfirmSubmit(false); handleSubmit(); }} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Confirm Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Quiz Header */}
            <div style={{
                position: 'sticky', top: '64px', zIndex: 50,
                background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                padding: '12px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px'
            }}>
                {/* Progress */}
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Page {currentPage}/{totalPages} • {totalAnswered}/20 answered
                    </div>
                    <div className="progress-bar-wrapper" style={{ width: '200px' }}>
                        <div className="progress-bar-fill" style={{ width: `${(totalAnswered / 20) * 100}%` }} />
                    </div>
                </div>

                {/* Timer */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                        TIME REMAINING
                    </div>
                    <div className={`timer ${timerClass}`}>{formatTime(timeLeft)}</div>
                </div>

                {/* Save + Submit */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => saveProgress(false)}
                        style={{ padding: '8px 18px', fontSize: '0.78rem' }} disabled={saving}>
                        {saving ? '✓ Saved' : '💾 SAVE'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setConfirmSubmit(true)}
                        style={{ padding: '8px 18px', fontSize: '0.78rem' }} disabled={submitting}>
                        {submitting ? 'Submitting...' : '✓ SUBMIT'}
                    </button>
                </div>
            </div>

            {/* Questions */}
            <div className="container" style={{ maxWidth: '860px', paddingTop: '32px' }}>
                {pageQuestions.map((q, idx) => {
                    const qNum = (currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1;
                    const selected = answers[q.id];

                    const diffColors = {
                        'easy': 'var(--neon-green)',
                        'medium': 'var(--neon-cyan)',
                        'medium-hard': 'var(--neon-orange)',
                        'hard': 'var(--neon-red)'
                    };

                    return (
                        <div key={q.id} className="card fade-in" style={{ marginBottom: '24px', borderColor: selected !== undefined ? 'rgba(0,255,136,0.2)' : 'var(--border)' }}>
                            {/* Q header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    background: selected !== undefined ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${selected !== undefined ? 'rgba(0,255,136,0.4)' : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem',
                                    color: selected !== undefined ? 'var(--neon-green)' : 'var(--text-secondary)'
                                }}>
                                    {qNum}
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    DEBUGGING_{q.language?.toUpperCase()}_TASK
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto', opacity: 0.5 }}>
                                    REF_ID: 0x{q.id.toString(16).padStart(2, '0')}
                                </span>
                            </div>

                            {/* Code block */}
                            {q.code && (
                                <pre className="code-block">{q.code}</pre>
                            )}

                            {/* Question text */}
                            <p style={{ marginBottom: '16px', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 500 }}>
                                {q.question}
                            </p>

                            {/* Options */}
                            <div>
                                {q.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        className={`option-btn ${selected === i ? 'selected' : ''}`}
                                        onClick={() => selectAnswer(q.id, i)}
                                    >
                                        <span className="option-key">{String.fromCharCode(65 + i)}</span>
                                        <span>{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Pagination */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => goPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ← PREVIOUS
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                            const startQ = (p - 1) * QUESTIONS_PER_PAGE;
                            const pageAnswered = questions
                                .slice(startQ, startQ + QUESTIONS_PER_PAGE)
                                .every(q => answers[q.id] !== undefined);

                            return (
                                <button key={p} onClick={() => goPage(p)} style={{
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    border: `1px solid ${p === currentPage ? 'var(--neon-green)' : pageAnswered ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                                    background: p === currentPage ? 'rgba(0,255,136,0.15)' : pageAnswered ? 'rgba(0,255,136,0.05)' : 'transparent',
                                    color: p === currentPage ? 'var(--neon-green)' : pageAnswered ? 'rgba(0,255,136,0.7)' : 'var(--text-muted)',
                                    fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    {currentPage < totalPages ? (
                        <button className="btn btn-secondary" onClick={() => goPage(currentPage + 1)}>
                            NEXT →
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setConfirmSubmit(true)} disabled={submitting}>
                            ✓ SUBMIT QUIZ
                        </button>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {totalAnswered}/20 answered • Auto-saves every 15 seconds
                </p>
            </div>
        </div>
    );
}

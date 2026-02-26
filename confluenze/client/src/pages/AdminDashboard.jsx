import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function formatTime(secs) {
    if (!secs && secs !== 0) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function StatCard({ label, value, color }) {
    return (
        <div className="card" style={{ textAlign: 'center', borderColor: color + '33' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{label}</div>
        </div>
    );
}

export default function AdminDashboard() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const wsRef = useRef(null);

    const fetchParticipants = async () => {
        try {
            const { data } = await axios.get('/api/admin/participants');
            setParticipants(data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();

        // WebSocket for live updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:5000`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => ws.send(JSON.stringify({ type: 'admin_subscribe' }));
        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (['quiz_started', 'quiz_submitted', 'progress_update'].includes(msg.type)) {
                    fetchParticipants(); // Refresh on any event
                }
            } catch (_) { }
        };
        ws.onerror = () => { };

        const interval = setInterval(fetchParticipants, 15000);
        return () => {
            clearInterval(interval);
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const filtered = participants.filter(p =>
        filter === 'all' ? true : p.status === filter
    );

    const stats = {
        total: participants.length,
        in_progress: participants.filter(p => p.status === 'in_progress').length,
        submitted: participants.filter(p => p.status === 'submitted').length,
        not_started: participants.filter(p => p.status === 'not_started').length,
    };

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Live Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '6px' }}>
                        Real-time tracking for CONFLUENZE 2026
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/admin/users" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>👥 PARTICIPANTS</Link>
                    <Link to="/admin/leaderboard" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>🏆 LEADERBOARD</Link>
                    <Link to="/admin/shortlist" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>⭐ SHORTLIST</Link>
                    <button className="btn btn-primary" onClick={fetchParticipants} style={{ padding: '10px 20px', fontSize: '0.8rem' }}>↻ REFRESH</button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <StatCard label="Total Teams" value={stats.total} color="var(--text-primary)" />
                <StatCard label="Not Started" value={stats.not_started} color="var(--text-muted)" />
                <StatCard label="In Progress" value={stats.in_progress} color="var(--neon-cyan)" />
                <StatCard label="Submitted" value={stats.submitted} color="var(--neon-green)" />
            </div>

            {/* Filter tabs */}
            <div className="nav-tabs">
                {['all', 'not_started', 'in_progress', 'submitted'].map(f => (
                    <button key={f} className={`nav-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                        {f.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Loading participants...</p>
                </div>
            ) : (
                <div className="table-wrapper card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Chest</th>
                                <th>Members</th>
                                <th>College</th>
                                <th>Contacts</th>
                                <th>Status</th>
                                <th>Page</th>
                                <th>Answered</th>
                                <th>Time Left</th>
                                <th>Score</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No participants found</td></tr>
                            ) : filtered.map((p, i) => (
                                <tr key={p.id}>
                                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                                    <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{p.chest_number}</span></td>
                                    <td style={{ fontSize: '0.8rem' }}>{p.member1}{p.member2 && <><br /><span style={{ color: 'var(--text-muted)' }}>{p.member2}</span></>}</td>
                                    <td style={{ fontSize: '0.8rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.college}</td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{p.contact1}{p.contact2 && <><br />{p.contact2}</>}</td>
                                    <td>
                                        <span className={`badge badge-${p.status}`}>
                                            <span className="pulse-dot" />
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{p.status !== 'not_started' ? `${p.current_page}/4` : '-'}</td>
                                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{p.status !== 'not_started' ? `${p.answered_count}/20` : '-'}</td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                                        {p.status === 'in_progress' ? (
                                            <span style={{ color: p.time_remaining < 180 ? 'var(--neon-red)' : p.time_remaining < 600 ? 'var(--neon-orange)' : 'var(--neon-cyan)' }}>
                                                {formatTime(p.time_remaining)}
                                            </span>
                                        ) : p.status === 'submitted' ? (
                                            <span style={{ color: 'var(--text-muted)' }}>Done</span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--neon-green)', textAlign: 'center' }}>
                                        {p.status === 'submitted' ? `${p.score}/20` : '-'}
                                    </td>
                                    <td>
                                        {p.status !== 'not_started' && (
                                            <Link to={`/admin/results/${p.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.72rem' }}>
                                                VIEW
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

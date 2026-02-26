import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminLeaderboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/admin/leaderboard')
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleShortlist = async (userId) => {
        try {
            await axios.post('/api/admin/shortlist/toggle', { userId });
            const { data: fresh } = await axios.get('/api/admin/leaderboard');
            setData(fresh);
        } catch (e) { alert('Failed to update shortlist.'); }
    };

    function formatSecs(s) {
        if (!s) return '-';
        const m = Math.floor(s / 60), sec = s % 60;
        return `${m}m ${sec}s`;
    }

    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🏆 Final Leaderboard — 2026</h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Ranked by score, then fastest completion time
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : data.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    No submissions yet.
                </div>
            ) : (
                <div className="table-wrapper card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Chest</th>
                                <th>Members</th>
                                <th>College</th>
                                <th>Score</th>
                                <th>Time Taken</th>
                                <th>Shortlist</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={row.id} style={i < 3 ? { background: `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.04)` } : {}}>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: i < 3 ? medalColors[i] : 'var(--text-muted)' }}>
                                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{row.chest_number}</td>
                                    <td style={{ fontSize: '0.9rem' }}><strong style={{ color: 'var(--text-primary)' }}>{row.member1}</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{row.member2}</span></td>
                                    <td style={{ fontSize: '0.8rem' }}>{row.college}</td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--neon-green)' }}>
                                            {row.score}<span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>/20</span>
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{formatSecs(row.completion_time)}</td>
                                    <td>
                                        <button
                                            className={`btn ${row.shortlisted ? 'btn-primary' : 'btn-secondary'}`}
                                            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                                            onClick={() => handleShortlist(row.id)}
                                        >
                                            {row.shortlisted ? '★ Listed' : '☆ Select'}
                                        </button>
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

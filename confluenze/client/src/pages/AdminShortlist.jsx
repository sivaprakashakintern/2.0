import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminShortlist() {
    const [shortlist, setShortlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShortlist = async () => {
        try {
            const { data } = await axios.get('/api/admin/shortlist');
            setShortlist(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchShortlist(); }, []);

    const handleRemove = async (userId) => {
        try {
            await axios.post('/api/admin/shortlist/toggle', { userId });
            fetchShortlist();
        } catch (e) { alert('Failed to update shortlist.'); }
    };

    const handleCopy = () => {
        const text = shortlist.map((t, i) =>
            `${i + 1}. ${t.member1}${t.member2 ? ` & ${t.member2}` : ''} | ${t.college} | Contacts: ${t.contact1}${t.contact2 ? `, ${t.contact2}` : ''} | Score: ${t.score}/20`
        ).join('\n');
        navigator.clipboard.writeText(text)
            .then(() => alert('Shortlist copied to clipboard!'))
            .catch(() => alert('Copy failed. Please copy manually.'));
    };

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>⭐ Shortlist — Round 2 (2026)</h1>
                    <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '4px' }}>
                        {shortlist.length} team(s) selected for invitation
                    </p>
                </div>
                {shortlist.length > 0 && (
                    <button className="btn btn-primary" onClick={handleCopy} style={{ padding: '12px 24px' }}>
                        📋 COPY CONTACT LIST
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : shortlist.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>☆</div>
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        No teams shortlisted yet.<br />
                        Go to the <a href="/admin/leaderboard" style={{ color: 'var(--neon-green)' }}>Leaderboard</a> to select teams.
                    </p>
                </div>
            ) : (
                <>
                    {/* Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        {shortlist.map((team, i) => (
                            <div key={team.id} className="card"
                                style={{
                                    borderColor: 'rgba(0,255,136,0.3)',
                                    background: 'rgba(0,255,136,0.02)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                                    background: 'var(--neon-green)'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--neon-green)' }}>
                                        #{i + 1}
                                    </span>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge badge-shortlisted" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)' }}>★ SELECTED</span>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--neon-cyan)', marginTop: '4px' }}>
                                            SCORE: {team.score ?? '-'}/20
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>// PARTICIPANTS</div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0' }}>
                                        {team.member1}{team.member2 ? ` & ${team.member2}` : ''}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <span>🏫</span> {team.college}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                    <a href={`tel:${team.contact1}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        📞 CALL M1
                                    </a>
                                    {team.contact2 && (
                                        <a href={`tel:${team.contact2}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            📞 CALL M2
                                        </a>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        ID: {team.chest_number}
                                    </span>
                                    <button className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.7rem', color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}
                                        onClick={() => handleRemove(team.id)}>
                                        REMOVE FROM LIST
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact table */}
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '12px' }}>
              // CONTACT REFERENCE TABLE
                        </h3>
                        <div className="table-wrapper card" style={{ padding: 0 }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Members</th>
                                        <th>College</th>
                                        <th>Contact 1</th>
                                        <th>Contact 2</th>
                                        <th>Score</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shortlist.map((t, i) => (
                                        <tr key={t.id}>
                                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontWeight: 700 }}>{i + 1}</td>
                                            <td><strong style={{ color: 'var(--text-primary)' }}>{t.member1}</strong>{t.member2 && <><br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.member2}</span></>}</td>
                                            <td style={{ fontWeight: 600 }}>{t.college}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>
                                                <a href={`tel:${t.contact1}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>{t.contact1}</a>
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>
                                                {t.contact2 ? <a href={`tel:${t.contact2}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>{t.contact2}</a> : '-'}
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--neon-green)' }}>{t.score ?? '-'}/20</td>
                                            <td>
                                                <a href={`tel:${t.contact1}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>CALL</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

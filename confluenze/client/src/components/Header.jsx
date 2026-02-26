import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
    const { user, logout, isAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.is_admin;

    return (
        <header className="header" style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <div className="header-inner" style={{ position: 'relative', height: '100px', padding: '0 32px' }}>

                {/* Brand Side (Left Placeholder to balance flex) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {isAuth && (
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAdmin ? (
                                <>
                                    <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>DASHBOARD</Link>
                                    <Link to="/admin/users" className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}>PARTICIPANTS</Link>
                                    <Link to="/admin/leaderboard" className={`nav-link ${location.pathname === '/admin/leaderboard' ? 'active' : ''}`}>LEADERBOARD</Link>
                                    <Link to="/admin/shortlist" className={`nav-link ${location.pathname === '/admin/shortlist' ? 'active' : ''}`}>SHORTLIST</Link>
                                </>
                            ) : null}
                        </nav>
                    )}
                </div>

                {/* CENTERED BRANDING */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    width: 'auto',
                    minWidth: '400px'
                }}>
                    <Link to={isAuth ? (isAdmin ? '/admin' : '/welcome') : '/login'} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                            <span className="logo logo-glitch" style={{ fontSize: '2rem', letterSpacing: '8px', marginBottom: '4px' }}>CONFLUENZE</span>

                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                color: 'var(--neon-green)',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                marginBottom: '8px'
                            }}>
                                DEBUGGING QUIZ 2026
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '4px 20px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>INSTITUTION:</span>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-primary)',
                                    fontWeight: 700,
                                    letterSpacing: '1px'
                                }}>
                                    NIITM <span style={{ color: 'var(--neon-cyan)' }}>(MCA)</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Side (User Info & Logout) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                    {isAuth && !isAdmin && (
                        <div style={{
                            background: 'rgba(0, 255, 136, 0.05)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)' }}></span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {user?.member1}
                            </span>
                        </div>
                    )}

                    {isAuth && (
                        <button className="btn btn-secondary" onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.7rem',
                                border: '1px solid rgba(255,51,102,0.3)',
                                color: '#ff6688',
                                background: 'rgba(255,51,102,0.05)'
                            }}>
                            LOGOUT
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

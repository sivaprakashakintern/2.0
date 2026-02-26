import { useEffect } from 'react';

export default function Result() {
    useEffect(() => {
        // Exit fullscreen on result page
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
    }, []);

    return (
        <div className="page-center">
            <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 16px' }} className="fade-in">

                {/* Animated check */}
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'rgba(0,255,136,0.1)', border: '2px solid var(--neon-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 32px', fontSize: '3rem',
                    boxShadow: 'var(--glow-green)',
                    animation: 'pulse 2s infinite'
                }}>
                    ✓
                </div>

                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '12px' }}>
                    Thank You for <span className="neon-text">Participating</span>
                </h1>

                <div className="neon-divider" />

                <div className="card" style={{ textAlign: 'left', background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.2)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.7rem', letterSpacing: '3px', marginBottom: '16px' }}>
            // SUBMISSION CONFIRMED
                    </div>
                    <p style={{ lineHeight: 1.9, color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Your responses have been recorded. Our team will review all submissions and announce the results shortly.
                    </p>
                    <div className="neon-divider" style={{ margin: '20px 0' }} />
                    <div style={{
                        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
                        borderRadius: '10px', padding: '20px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                        color: 'var(--neon-cyan)', lineHeight: 1.8, textAlign: 'center'
                    }}>
                        ⏳ Wait for the next round.<br />
                        <strong>Selected teams will be contacted.</strong>
                    </div>
                </div>


            </div>
        </div>
    );
}

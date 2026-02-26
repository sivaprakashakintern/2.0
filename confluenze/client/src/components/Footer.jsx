export default function Footer() {
    return (
        <footer style={{
            padding: '30px 20px',
            marginTop: 'auto',
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(5, 5, 8, 0.5)'
        }}>
            <div className="container">
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    © 2026 <span style={{ color: 'var(--text-secondary)' }}>NIITM MCA</span> • <span style={{ color: 'var(--neon-green)' }}>CONFLUENZE</span>
                </p>
            </div>
        </footer>
    );
}

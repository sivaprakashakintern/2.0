import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FIELDS = [
    { name: 'username', label: 'Username', placeholder: 'your_username', required: true },
    { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password', required: true },
    { name: 'member1', label: 'Team Member 1', placeholder: 'Full name', required: true },
    { name: 'member2', label: 'Team Member 2', placeholder: 'Optional (Full name)', required: false },
    { name: 'contact1', label: 'Member 1 Contact', placeholder: '+91 9876543210', required: true },
    { name: 'contact2', label: 'Member 2 Contact', placeholder: 'Optional (+91...)', required: false },
    { name: 'chest_number', label: 'Chest Number', placeholder: 'e.g. CS-042', required: true },
    { name: 'college', label: 'College Name', placeholder: 'Your college', required: true },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '', password: '',
        member1: '', member2: '', contact1: '', contact2: '',
        chest_number: '', college: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/register', form);
            setSuccess(data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div style={{ width: '100%', maxWidth: '600px' }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.75rem', letterSpacing: '4px', marginBottom: '12px' }}>
                        // EVENT REGISTRATION
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                        Join <span className="neon-text">CONFLUENZE</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        Fill the required fields to register your team
                    </p>
                </div>

                <div className="card fade-in">
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">✓ {success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {FIELDS.map(field => (
                                <div key={field.name} style={{ gridColumn: ['college'].includes(field.name) ? 'span 2' : 'span 1' }}>
                                    <label className="label">
                                        {field.label} {field.required && <span style={{ color: 'var(--neon-red)', fontSize: '0.6rem' }}>* REQUIRED</span>}
                                    </label>
                                    <input
                                        className="input"
                                        type={field.type || 'text'}
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="neon-divider" style={{ margin: '24px 0' }} />

                        <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Registering...' : '→ REGISTER TEAM'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            Already registered?{' '}
                            <Link to="/login" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

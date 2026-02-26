import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state for adding/editing
    const [formData, setFormData] = useState({
        member1: '', member2: '', contact1: '', contact2: '',
        chest_number: '', college: '', username: '', password: ''
    });

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/admin/participants');
            setUsers(data);
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const resetForm = () => {
        setFormData({
            member1: '', member2: '', contact1: '', contact2: '',
            chest_number: '', college: '', username: '', password: ''
        });
        setEditingUser(null);
    };

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setShowAddForm(false);
        setFormData({
            member1: user.member1,
            member2: user.member2 || '',
            contact1: user.contact1,
            contact2: user.contact2 || '',
            chest_number: user.chest_number,
            college: user.college,
            username: user.username,
            password: '' // Don't show password hash
        });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.member1 || !formData.chest_number) {
            alert('Please fill all required fields (Username, Password, Member 1, Chest Number)');
            return;
        }

        try {
            await axios.post('/api/auth/register', formData);
            setShowAddForm(false);
            resetForm();
            fetchUsers();
            alert('Participant added successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add participant');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/admin/users/${editingUser}`, formData);
            setEditingUser(null);
            resetForm();
            fetchUsers();
            alert('Participant updated successfully');
        } catch (err) {
            alert('Failed to update participant');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this participant?')) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete participant');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('⚠️ WARNING: This will delete ALL participant accounts, their progress, and results. This action cannot be undone. Proceed?')) return;

        const secondConfirm = window.prompt('Type "DELETE ALL" to confirm:');
        if (secondConfirm !== 'DELETE ALL') return;

        try {
            await axios.delete('/api/admin/users');
            fetchUsers();
            alert('All accounts cleared successfully');
        } catch (err) {
            alert('Failed to clear accounts');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Participant Details</h1>
                    <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '6px' }}>
                        Manage participant accounts and registration data
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setShowAddForm(!showAddForm); setEditingUser(null); }}
                        style={{ padding: '10px 20px', fontSize: '0.8rem' }}
                    >
                        {showAddForm ? '✕ CLOSE' : '＋ ADD PARTICIPANT'}
                    </button>
                    <Link to="/admin" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>← BACK TO LIVE</Link>
                </div>
            </div>

            {/* ADD / EDIT FORM */}
            {(showAddForm || editingUser) && (
                <div className="card" style={{ marginBottom: '32px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                        {editingUser ? 'Edit Participant' : 'Add New Participant'}
                    </h3>
                    <form onSubmit={editingUser ? handleUpdate : handleAddUser}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label className="label">Username *</label>
                                <input className="input" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">{editingUser ? 'New Password ' : 'Password *'}</label>
                                <input className="input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
                            </div>
                            <div>
                                <label className="label">Chest Number *</label>
                                <input className="input" value={formData.chest_number} onChange={e => setFormData({ ...formData, chest_number: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">College *</label>
                                <input className="input" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label className="label">Member 1 Name *</label>
                                <input className="input" value={formData.member1} onChange={e => setFormData({ ...formData, member1: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Member 1 Contact *</label>
                                <input className="input" value={formData.contact1} onChange={e => setFormData({ ...formData, contact1: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Member 2 Name</label>
                                <input className="input" value={formData.member2} onChange={e => setFormData({ ...formData, member2: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Member 2 Contact</label>
                                <input className="input" value={formData.contact2} onChange={e => setFormData({ ...formData, contact2: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>
                                {editingUser ? 'UPDATE' : 'REGISTER'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowAddForm(false); setEditingUser(null); }} style={{ padding: '8px 24px' }}>
                                CANCEL
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                    <p>Loading participants...</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper card" style={{ padding: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Chest</th>
                                    <th>Username</th>
                                    <th>Password</th>
                                    <th>Member 1</th>
                                    <th>Member 2</th>
                                    <th>College</th>
                                    <th>Contacts</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>No participants found</td></tr>
                                ) : users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{u.chest_number}</td>
                                        <td style={{ fontSize: '0.8rem' }}>{u.username}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>********</td>
                                        <td style={{ fontSize: '0.8rem' }}>{u.member1}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.member2 || '-'}</td>
                                        <td style={{ fontSize: '0.8rem' }}>{u.college}</td>
                                        <td style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>{u.contact1}<br />{u.contact2}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleEdit(u)}>EDIT</button>
                                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--neon-red)' }} onClick={() => handleDelete(u.id)}>DEL</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '24px', textAlign: 'right' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleClearAll}
                            style={{ padding: '10px 20px', fontSize: '0.8rem', color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}
                        >
                            🗑️ CLEAR ALL PARTICIPANTS
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cf_user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('cf_token') || null);

    const login = useCallback((tokenData, userData) => {
        localStorage.setItem('cf_token', tokenData);
        localStorage.setItem('cf_user', JSON.stringify(userData));
        setToken(tokenData);
        setUser(userData);
        // Attach token to all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('cf_token');
        localStorage.removeItem('cf_user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    }, []);

    // Restore axios header on mount
    React.useEffect(() => {
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

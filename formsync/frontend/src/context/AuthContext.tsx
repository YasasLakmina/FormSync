import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthUser } from '../services/authService';

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'formsync_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(true);

    // On mount, try to restore session from localStorage token
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            authService
                .getMe(savedToken)
                .then((u) => {
                    setUser(u);
                    setToken(savedToken);
                })
                .catch(() => {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const result = await authService.login(email, password);
        localStorage.setItem(TOKEN_KEY, result.access_token);
        setToken(result.access_token);
        setUser(result.user);
    }, []);

    const register = useCallback(async (email: string, password: string, name?: string) => {
        await authService.register(email, password, name);
        // Auto-login after register
        await login(email, password);
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
};

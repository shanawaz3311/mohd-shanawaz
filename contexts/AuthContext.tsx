
import React, { createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { USER_CREDENTIALS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextType {
    user: User | null;
    login: (role: UserRole, id: string, pass: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useLocalStorage<User | null>('user', null);

    const login = (role: UserRole, id: string, pass: string): boolean => {
        const credentials = USER_CREDENTIALS[role];
        if (credentials && credentials.id === id && credentials.password === pass) {
            const loggedInUser: User = { id, role };
            setUser(loggedInUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

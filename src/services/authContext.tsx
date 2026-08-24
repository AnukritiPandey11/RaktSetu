import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, BloodGroup } from '../types';
import { dbUsers, initDatabase } from './db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password_hash: string) => boolean;
  loginAsRole: (role: UserRole) => void;
  signup: (data: {
    name: string;
    role: UserRole;
    email: string;
    contact: string;
    location: string;
    password: string;
    entity_id?: string;
    blood_group?: BloodGroup;
  }) => User;
  logout: () => void;
  updateCurrentUserProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'raktsetu_session_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initDatabase();
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Refresh with latest from DB if exists
        const fresh = dbUsers.getById(parsed.id) || parsed;
        setUser(fresh);
      } catch (e) {
        console.error('Failed to parse stored session', e);
      }
    } else {
      // Default to Admin in demo mode if nothing selected, or leave null for Landing page
      // Let's leave null so user sees the Landing Page initially
    }
  }, []);

  const login = (email: string, password_hash: string): boolean => {
    const found = dbUsers.getByEmail(email);
    if (found && (found.password_hash === password_hash || password_hash === 'demo123')) {
      setUser(found);
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const loginAsRole = (role: UserRole): void => {
    const users = dbUsers.getAll();
    const found = users.find(u => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    }
  };

  const signup = (data: {
    name: string;
    role: UserRole;
    email: string;
    contact: string;
    location: string;
    password: string;
    entity_id?: string;
    blood_group?: BloodGroup;
  }): User => {
    const newUser: User = {
      id: `usr-${data.role.slice(0, 4)}-${Date.now()}`,
      name: data.name,
      role: data.role,
      email: data.email,
      password_hash: data.password || 'demo123',
      location: data.location,
      contact: data.contact,
      entity_id: data.entity_id || (data.role === 'blood_bank' ? 'bb-1' : data.role === 'hospital' ? 'hosp-1' : undefined),
      blood_group: data.blood_group,
      available_for_donation: data.role === 'donor' ? true : undefined,
      last_donation_date: data.role === 'donor' ? new Date().toISOString().split('T')[0] : undefined
    };

    dbUsers.add(newUser);
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateCurrentUserProfile = (updated: Partial<User>): void => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    dbUsers.update(merged);
    localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsRole,
        signup,
        logout,
        updateCurrentUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

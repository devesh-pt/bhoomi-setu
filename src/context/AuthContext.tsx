import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { BhoomiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  loginWithCredentials: (identifier: string, pass: string, role: UserRole) => boolean;
  registerUser: (name: string, phone: string, email: string, pass: string, role: UserRole) => User;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  toggleSavedResearch: (researchId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS[1]); // Default to User for clear demonstration

  const loginAsRole = (role: UserRole) => {
    const found = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setUser({ ...found, role });
  };

  const loginWithCredentials = (identifier: string, pass: string, role: UserRole): boolean => {
    const idClean = identifier.trim().toLowerCase();
    const registered = BhoomiService.getUsers() || DEMO_USERS;
    const found = registered.find(
      (u: User) =>
        (u.email.toLowerCase() === idClean || u.phone === idClean || u.id === idClean) &&
        (u.password === pass || pass === 'admin123' || pass === 'user123' || pass.length >= 4)
    );

    if (found) {
      setUser(found);
      return true;
    } else {
      // Fallback matching by role for demo convenience
      const roleMatch = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
      setUser({ ...roleMatch, phone: identifier, email: identifier.includes('@') ? identifier : `${identifier}@bhoomi.gov.in` });
      return true;
    }
  };

  const registerUser = (name: string, phone: string, email: string, pass: string, role: UserRole): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || 'Registered Portal User',
      email: email || `${phone}@bhoomi.gov.in`,
      phone,
      password: pass,
      role,
      organization: role === 'admin' ? 'Ministry of Land Resources Admin' : 'Public Registered Citizen',
      department: role === 'admin' ? 'Authorized Officer Division' : 'Citizen Access',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      savedResearchIds: [],
    };

    setUser(newUser);
    return newUser;
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) {
      setUser(found);
    } else {
      setUser({ ...user, role });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const toggleSavedResearch = (researchId: string) => {
    if (!user) return;
    const saved = user.savedResearchIds || [];
    const isSaved = saved.includes(researchId);
    const updated = isSaved
      ? saved.filter((id) => id !== researchId)
      : [...saved, researchId];
    setUser({ ...user, savedResearchIds: updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAsRole,
        loginWithCredentials,
        registerUser,
        logout,
        switchRole,
        toggleSavedResearch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

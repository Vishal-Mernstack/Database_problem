import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers, initializeMockData } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
    
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email (password is 'password123' for all demo users)
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Demo password check (in real app, this would be hashed)
    if (password !== 'password123') {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Check for saved profile data
    const savedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    const savedProfile = savedProfiles[foundUser.id];
    const userWithProfile = savedProfile ? { ...foundUser, ...savedProfile } : foundUser;
    
    setUser(userWithProfile);
    localStorage.setItem('currentUser', JSON.stringify(userWithProfile));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Also persist to userProfiles for future logins
      const savedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      savedProfiles[user.id] = { ...savedProfiles[user.id], ...updates };
      localStorage.setItem('userProfiles', JSON.stringify(savedProfiles));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based access helper
export function hasAccess(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

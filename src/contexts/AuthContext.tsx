import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Patient, Provider } from '@/types';
import { mockPatient, mockDoctors } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  logout: () => void;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production, this would call Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo: set as patient
    setUser(mockPatient);
    return true;
  };

  const signup = async (data: any): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      role: data.role,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const setDemoUser = (role: UserRole) => {
    if (role === 'patient') {
      setUser(mockPatient);
    } else if (role === 'doctor') {
      setUser(mockDoctors[0] as unknown as User);
    } else if (role === 'admin') {
      setUser({
        id: 'admin1',
        email: 'admin@medical.sy',
        name: 'مدير النظام',
        role: 'admin',
        createdAt: new Date(),
      });
    } else {
      setUser({
        id: crypto.randomUUID(),
        email: `${role}@medical.sy`,
        name: `مستخدم ${role}`,
        role,
        createdAt: new Date(),
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      setDemoUser,
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

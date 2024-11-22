import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '../types';

interface AuthContext {
  user: User | null;
  loading: boolean;
  login: (omsNumber: string, password: string) => Promise<void>;
  register: (omsNumber: string, password: string, name: string, role: 'patient' | 'doctor') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (omsNumber: string, password: string) => Promise<void>;
  register: (omsNumber: string, password: string, name: string, role: 'patient' | 'doctor') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (omsNumber: string, password: string) => {
    try {
      const email = `${omsNumber}@medportal.com`;
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      }
    } catch (error) {
      throw new Error('Ошибка входа');
    }
  };

  const register = async (omsNumber: string, password: string, name: string, role: 'patient' | 'doctor') => {
    try {
      const email = `${omsNumber}@medportal.com`;
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: Omit<User, 'id'> = {
        omsNumber,
        name,
        role
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser({ id: firebaseUser.uid, ...userData });
    } catch (error) {
      throw new Error('Ошибка регистрации');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw new Error('Ошибка выхода');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
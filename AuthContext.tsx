import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useUsers } from './UsersContext';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateUser } = useUsers();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/register', { name, email, password });
      // Auto-login after register
      return await login(email, password);
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const updateUserFn = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    updateUser(updatedUser.id, updatedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const addToWishlist = (productId: string) => {
    if (!user) return;
    if (user.wishlist && user.wishlist.includes(productId)) return;
    const updatedUser = {
      ...user,
      wishlist: user.wishlist ? [...user.wishlist, productId] : [productId]
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    updateUser(updatedUser.id, updatedUser);
  };

  const removeFromWishlist = (productId: string) => {
    if (!user || !user.wishlist) return;
    const updatedUser = {
      ...user,
      wishlist: user.wishlist.filter(id => id !== productId)
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    updateUser(updatedUser.id, updatedUser);
  };

  // Attach JWT to all axios requests
  axios.defaults.baseURL = 'http://localhost:5000';
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser: updateUserFn, isLoading, addToWishlist, removeFromWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};
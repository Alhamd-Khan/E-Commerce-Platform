import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import axios from 'axios';

interface UsersContextType {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (userId: string, updatedUser: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getUserById: (userId: string) => User | undefined;
  getUsersByRole: (isAdmin: boolean) => User[];
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};

interface UsersProviderProps {
  children: ReactNode;
}

const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@shop.com',
    name: 'Admin User',
    isAdmin: true,
    avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
    joinedDate: '2023-01-15',
    password: 'admin123',
  },
  {
    id: '2',
    email: 'user@shop.com',
    name: 'John Doe',
    isAdmin: false,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    joinedDate: '2023-06-20',
    password: 'user123',
  }
];

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get('/api/auth/all');
        const backendUsers = res.data.map((u: any) => ({
          ...u,
          id: u._id || u.id,
        }));
        setUsers(backendUsers);
        localStorage.setItem('users', JSON.stringify(backendUsers));
      } catch (err) {
        // fallback to localStorage/demo users if backend fails
        let savedUsers: User[] = [];
        const saved = localStorage.getItem('users');
        if (saved) {
          savedUsers = JSON.parse(saved);
        } else {
          savedUsers = DEMO_USERS;
          localStorage.setItem('users', JSON.stringify(savedUsers));
        }
        setUsers(savedUsers);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const addUser = (user: User) => {
    setUsers(prevUsers => {
      // Ensure id is set to _id if present
      const id = user.id || user._id || (user._id ? user._id.toString() : Math.random().toString(36).substr(2, 9));
      const mergedUser = { ...user, id };
      // Merge by email (update if exists, add if not)
      const updated = prevUsers.some(u => u.email === mergedUser.email)
        ? prevUsers.map(u => u.email === mergedUser.email ? mergedUser : u)
        : [...prevUsers, mergedUser];
      localStorage.setItem('users', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUser = (userId: string, updatedUser: Partial<User>) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          // Deep merge for wishlist
          return {
            ...user,
            ...updatedUser,
            wishlist: updatedUser.wishlist !== undefined ? updatedUser.wishlist : user.wishlist
          };
        }
        return user;
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const getUsersByRole = (isAdmin: boolean): User[] => {
    return users.filter(user => user.isAdmin === isAdmin);
  };

  return (
    <UsersContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      getUserById,
      getUsersByRole
    }}>
      {children}
    </UsersContext.Provider>
  );
}; 
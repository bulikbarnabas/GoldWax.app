import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types/salon';

const STORAGE_KEY = '@salon_auth';
const USERS_KEY = '@salon_users';

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@goldwax.hu',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: 'emp-1',
    name: 'Dolgozó 1',
    email: 'dolgozo1@goldwax.hu',
    role: 'employee',
    password: 'dolgozo123'
  },
  {
    id: 'emp-2',
    name: 'Dolgozó 2',
    email: 'dolgozo2@goldwax.hu',
    role: 'employee',
    password: 'dolgozo456'
  }
];

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Felhasználók listája és mentett bejelentkezés betöltése
    const initAuth = async () => {
      await loadUsers();
      await loadAuthState();
    };
    initAuth();
  }, []);

  const loadAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedAuth = JSON.parse(stored);
        setAuthState(parsedAuth);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const loadUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        setUsers(parsedUsers);
      } else {
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { email, password });
    console.log('Available users:', users);
    
    const user = users.find(u => u.email === email && u.password === password);
    console.log('Found user:', user);
    
    if (user) {
      const newAuthState = {
        user,
        isAuthenticated: true
      };
      console.log('Setting auth state:', newAuthState);
      setAuthState(newAuthState);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
      return true;
    }
    
    console.log('Login failed - user not found');
    return false;
  }, [users]);

  const logout = useCallback(async () => {
    const newAuthState = {
      user: null,
      isAuthenticated: false
    };
    setAuthState(newAuthState);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const addUser = useCallback(async (user: User): Promise<boolean> => {
    if (authState.user?.role !== 'admin') {
      return false;
    }

    const exists = users.some(u => u.email === user.email);
    if (exists) {
      return false;
    }

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return true;
  }, [authState.user?.role, users]);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>): Promise<boolean> => {
    if (authState.user?.role !== 'admin') {
      return false;
    }

    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    if (authState.user?.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        const newAuthState = { ...authState, user: updatedUser };
        setAuthState(newAuthState);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
      }
    }
    
    return true;
  }, [authState, users]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    if (authState.user?.role !== 'admin' || userId === authState.user.id) {
      return false;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return true;
  }, [authState.user?.role, authState.user?.id, users]);

  const contextValue = useMemo(() => ({
    ...authState,
    users,
    isLoading,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser
  }), [authState, users, isLoading, login, logout, addUser, updateUser, deleteUser]);

  return contextValue;
});
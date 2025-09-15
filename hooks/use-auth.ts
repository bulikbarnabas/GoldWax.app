import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load auth state only once on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Load users
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            const storedUsers = window.localStorage.getItem(USERS_KEY);
            if (storedUsers) {
              try {
                const parsedUsers = JSON.parse(storedUsers);
                setUsers(parsedUsers);
              } catch {
                setUsers(defaultUsers);
              }
            }
          }
        } else {
          try {
            const storedUsers = await AsyncStorage.getItem(USERS_KEY);
            if (storedUsers) {
              const parsedUsers = JSON.parse(storedUsers);
              setUsers(parsedUsers);
            }
          } catch {
            setUsers(defaultUsers);
          }
        }
        
        // Load auth state
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && stored !== 'undefined') {
              try {
                const parsedAuth = JSON.parse(stored);
                if (parsedAuth.user && parsedAuth.isAuthenticated) {
                  setAuthState(parsedAuth);
                }
              } catch {
                // Invalid data, ignore
              }
            }
          }
        } else {
          try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsedAuth = JSON.parse(stored);
              if (parsedAuth.user && parsedAuth.isAuthenticated) {
                setAuthState(parsedAuth);
              }
            }
          } catch {
            // Invalid data, ignore
          }
        }
      } catch (error) {
        console.error('Init auth error:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, [isInitialized]);



  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        return false;
      }
      
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      
      const user = users.find(u => 
        u.email.toLowerCase() === normalizedEmail && 
        u.password === normalizedPassword
      );
      
      if (user) {
        const newAuthState = {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password
          },
          isAuthenticated: true
        };
        
        setAuthState(newAuthState);
        
        // Save to storage
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [users]);

  const logout = useCallback(async () => {
    try {
      setAuthState({
        user: null,
        isAuthenticated: false
      });
      
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
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
    
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }
    } else {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    }
    
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
    
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }
    } else {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    }
    
    if (authState.user?.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        const newAuthState = { ...authState, user: updatedUser };
        setAuthState(newAuthState);
        
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
        }
      }
    }
    
    return true;
  }, [authState, users]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (authState.user?.role !== 'admin' || userId === authState.user.id) {
        return false;
      }

      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        }
      } else {
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }
      
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
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
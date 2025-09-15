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

// Universal storage that works across all browsers and platforms
const universalStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use only localStorage for consistency
        if (typeof window !== 'undefined' && window.localStorage) {
          const value = window.localStorage.getItem(key);
          return value && value !== 'undefined' ? value : null;
        }
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          // Trigger storage event for other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: value,
            url: window.location.href
          }));
        }
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          // Trigger storage event for other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: null,
            url: window.location.href
          }));
        }
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthState = useCallback(async () => {
    try {
      const stored = await universalStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedAuth = JSON.parse(stored);
        // Validate that the user still exists in the users list
        if (parsedAuth.user) {
          const userExists = users.some(u => u.id === parsedAuth.user.id);
          if (userExists) {
            setAuthState(parsedAuth);
          } else {
            // User no longer exists, clear auth
            await universalStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      // Clear potentially corrupted auth state
      await universalStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [users]);

  const loadUsers = useCallback(async () => {
    try {
      const stored = await universalStorage.getItem(USERS_KEY);
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        // Ensure default users are always present
        const mergedUsers = [...defaultUsers];
        parsedUsers.forEach((user: User) => {
          const existingIndex = mergedUsers.findIndex(u => u.id === user.id);
          if (existingIndex >= 0) {
            mergedUsers[existingIndex] = user;
          } else {
            mergedUsers.push(user);
          }
        });
        setUsers(mergedUsers);
        await universalStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
      } else {
        setUsers(defaultUsers);
        await universalStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to default users
      setUsers(defaultUsers);
    }
  }, []);

  useEffect(() => {
    // Felhasználók listája és mentett bejelentkezés betöltése
    const initAuth = async () => {
      await loadUsers();
    };
    initAuth();
  }, [loadUsers]);

  useEffect(() => {
    if (users.length > 0) {
      loadAuthState();
    }
  }, [users, loadAuthState]);



  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt started for:', email);
      
      // Input validation
      if (!email || !password) {
        console.log('Login failed: Missing email or password');
        return false;
      }
      
      // Trim whitespace and normalize email
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      
      // Additional validation
      if (normalizedEmail.length === 0 || normalizedPassword.length === 0) {
        console.log('Login failed: Empty email or password after trim');
        return false;
      }
      
      console.log('Searching for user with email:', normalizedEmail);
      console.log('Available users:', users.map(u => ({ email: u.email.toLowerCase(), role: u.role })));
      
      const user = users.find(u => {
        const userEmailNormalized = u.email.toLowerCase().trim();
        const passwordMatch = u.password === normalizedPassword;
        console.log(`Checking user ${userEmailNormalized} vs ${normalizedEmail}, password match: ${passwordMatch}`);
        return userEmailNormalized === normalizedEmail && passwordMatch;
      });
      
      if (user) {
        console.log('User found, creating auth state for:', user.email);
        
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
        
        // Update state immediately
        setAuthState(newAuthState);
        
        // Save to storage with error handling
        try {
          await universalStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
          console.log('Auth state saved to storage successfully');
        } catch (storageError) {
          console.warn('Failed to save auth state to storage:', storageError);
          // Continue anyway, the in-memory state is set
        }
        
        console.log('Login successful for user:', user.email, 'Role:', user.role);
        
        // Force a delay to ensure all state updates are processed
        await new Promise(resolve => setTimeout(resolve, 150));
        return true;
      }
      
      console.log('Login failed: No matching user found for:', normalizedEmail);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [users]);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out user');
      const newAuthState = {
        user: null,
        isAuthenticated: false
      };
      setAuthState(newAuthState);
      await universalStorage.removeItem(STORAGE_KEY);
      
      console.log('Logout successful');
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
    await universalStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
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
    await universalStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    if (authState.user?.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        const newAuthState = { ...authState, user: updatedUser };
        setAuthState(newAuthState);
        await universalStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
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
      await universalStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      
      // Force a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
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
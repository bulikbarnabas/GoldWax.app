import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  // Clear any existing auth state when component mounts and add web-specific handlers
  React.useEffect(() => {
    logout();
    
    // Add web-specific event listeners for better compatibility
    if (Platform.OS === 'web') {
      const handleBeforeUnload = () => {
        // Clear any pending navigation timeouts
        const highestTimeoutId = setTimeout(() => {}, 0) as unknown as number;
        for (let i = 0; i < highestTimeoutId; i++) {
          clearTimeout(i);
        }
      };
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // Page became visible, check if we should redirect
          const currentPath = window.location.pathname;
          if (currentPath === '/login' && localStorage.getItem('@salon_auth')) {
            console.log('User appears to be logged in, redirecting...');
            window.location.href = '/services';
          }
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [logout]);





  const handleLogin = async () => {
    setErrorMessage('');
    
    // Input validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Kérjük töltse ki az összes mezőt!');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Kérjük adjon meg egy érvényes email címet!');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting login process for:', trimmedEmail);
      
      // Add a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const success = await login(trimmedEmail, trimmedPassword);
      
      if (success) {
        console.log('Login successful, preparing navigation...');
        
        // Enhanced navigation with better error handling
        if (Platform.OS === 'web') {
          // Multiple fallback navigation methods for web
          try {
            // Method 1: Try router first
            router.replace('/(tabs)/services');
            
            // Method 2: Fallback with window.location after delay
            setTimeout(() => {
              if (window.location.pathname === '/login') {
                console.log('Router navigation may have failed, using window.location');
                window.location.href = '/services';
              }
            }, 200);
            
            // Method 3: Ultimate fallback
            setTimeout(() => {
              if (window.location.pathname === '/login') {
                console.log('All navigation methods failed, forcing reload');
                window.location.reload();
              }
            }, 1000);
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Direct navigation as last resort
            window.location.href = '/services';
          }
        } else {
          // Native navigation with error handling
          try {
            router.replace('/(tabs)/services');
          } catch (navError) {
            console.error('Native navigation error:', navError);
            // Try alternative navigation
            router.push('/(tabs)/services');
          }
        }
      } else {
        console.log('Login failed: Invalid credentials');
        setErrorMessage('Hibás email vagy jelszó!');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Bejelentkezési hiba történt! Kérjük próbálja újra.');
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[Colors.gold.light, Colors.background]}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>GW</Text>
              </View>
              <Text style={styles.title}>GoldWax Szalon</Text>
              <Text style={styles.subtitle}>Bejelentkezés</Text>
            </View>
          </LinearGradient>

          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
            <View style={styles.inputContainer}>
              <User size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email cím"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Jelszó"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              testID="login-button"
            >
              <LinearGradient
                colors={[Colors.gold.main, Colors.gold.dark]}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Bejelentkezés</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>


          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 40,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: Colors.text,
  },
  loginButton: {
    borderRadius: 12,
    height: 52,
    marginTop: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  eyeButton: {
    padding: 8,
  },

});
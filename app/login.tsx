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

  // Clear any existing auth state when component mounts
  React.useEffect(() => {
    logout();
  }, [logout]);





  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Kérjük töltse ki az összes mezőt!');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting login process...');
      const success = await login(email.trim(), password.trim());
      
      if (success) {
        console.log('Login successful, navigating...');
        
        // Enhanced web navigation with multiple fallback strategies
        if (Platform.OS === 'web') {
          // Strategy 1: Use Expo Router
          try {
            console.log('Attempting router.replace...');
            router.replace('/(tabs)/services');
            
            // Strategy 2: Fallback with window.location after delay
            const fallbackTimer = setTimeout(() => {
              console.log('Router fallback triggered, checking current path:', window.location.pathname);
              if (window.location.pathname === '/login' || window.location.pathname === '/') {
                console.log('Using window.location.href fallback');
                try {
                  window.location.href = '/services';
                } catch (e) {
                  console.log('href failed, trying replace:', e);
                  window.location.replace('/services');
                }
              }
            }, 300);
            
            // Strategy 3: Force navigation after longer delay if still on login
            const forceTimer = setTimeout(() => {
              if (window.location.pathname === '/login' || window.location.pathname === '/') {
                console.log('Force navigation triggered');
                try {
                  // Try multiple approaches
                  window.history.pushState(null, '', '/services');
                  window.location.reload();
                } catch (e) {
                  console.log('History API failed:', e);
                  window.location.replace('/services');
                }
              }
            }, 1000);
            
            // Cleanup timers if navigation succeeds
            const checkNavigation = () => {
              if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                clearTimeout(fallbackTimer);
                clearTimeout(forceTimer);
              }
            };
            setTimeout(checkNavigation, 100);
            
          } catch (e) {
            console.error('Router navigation failed:', e);
            // Immediate fallback
            try {
              window.location.href = '/services';
            } catch (locationError) {
              console.error('All navigation methods failed:', locationError);
              window.location.replace('/services');
            }
          }
        } else {
          // Native navigation
          router.replace('/(tabs)/services');
        }
      } else {
        setErrorMessage('Hibás email vagy jelszó!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Bejelentkezési hiba történt!');
    } finally {
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
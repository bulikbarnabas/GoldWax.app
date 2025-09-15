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
import { User, Lock, Eye, EyeOff, Info } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const router = useRouter();
  const { login, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  // Clear any existing auth state when component mounts
  React.useEffect(() => {
    logout();
  }, [logout]);

  const testCredentials = [
    { id: 'admin', email: 'admin@goldwax.hu', password: 'admin123', role: 'Admin' },
    { id: 'emp1', email: 'dolgozo1@goldwax.hu', password: 'dolgozo123', role: 'Dolgozó 1' },
    { id: 'emp2', email: 'dolgozo2@goldwax.hu', password: 'dolgozo456', role: 'Dolgozó 2' }
  ];

  const fillCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setShowTestCredentials(false);
  };

  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Kérjük töltse ki az összes mezőt!');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      // Mindig a szolgáltatások oldalra irányítunk
      router.replace('/(tabs)/services');
    } else {
      setErrorMessage('Hibás email vagy jelszó!');
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

            <TouchableOpacity
              style={styles.testCredentialsButton}
              onPress={() => setShowTestCredentials(!showTestCredentials)}
            >
              <Info size={16} color={Colors.primary} />
              <Text style={styles.testCredentialsButtonText}>
                {showTestCredentials ? 'Teszt adatok elrejtése' : 'Teszt bejelentkezési adatok'}
              </Text>
            </TouchableOpacity>

            {showTestCredentials && (
              <View style={styles.testCredentialsContainer}>
                <Text style={styles.testCredentialsTitle}>Teszt fiókok:</Text>
                {testCredentials.map((cred) => (
                  <TouchableOpacity
                    key={cred.id}
                    style={styles.testCredentialItem}
                    onPress={() => fillCredentials(cred.email, cred.password)}
                  >
                    <View style={styles.testCredentialInfo}>
                      <Text style={styles.testCredentialRole}>{cred.role}</Text>
                      <Text style={styles.testCredentialEmail}>{cred.email}</Text>
                      <Text style={styles.testCredentialPassword}>Jelszó: {cred.password}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  testCredentialsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.gold.light,
  },
  testCredentialsButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  testCredentialsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testCredentialsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  testCredentialItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testCredentialInfo: {
    gap: 4,
  },
  testCredentialRole: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  testCredentialEmail: {
    fontSize: 13,
    color: Colors.text,
  },
  testCredentialPassword: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
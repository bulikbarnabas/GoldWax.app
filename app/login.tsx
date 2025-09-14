import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { User, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  const handleLogin = async () => {
    if (!email || !pin) {
      Alert.alert('Hiba', 'Kérjük töltse ki az összes mezőt!');
      return;
    }

    setIsLoading(true);
    const success = await login(email, pin);
    setIsLoading(false);
    
    if (success) {
      // Kis késleltetés, hogy a context frissüljön
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } else {
      Alert.alert('Hiba', 'Hibás email vagy PIN kód!');
    }
  };

  const quickLogin = async (userEmail: string, userPin: string) => {
    setIsLoading(true);
    const success = await login(userEmail, userPin);
    setIsLoading(false);
    
    if (success) {
      // Kis késleltetés, hogy a context frissüljön
      setTimeout(() => {
        router.replace('/');
      }, 100);
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
                placeholder="PIN kód"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                editable={!isLoading}
              />
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

          <View style={styles.quickAccess}>
            <Text style={styles.quickAccessTitle}>Gyors belépés (fejlesztéshez)</Text>
            
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => quickLogin('admin@goldwax.hu', '1234')}
              disabled={isLoading}
            >
              <Text style={styles.quickButtonText}>Admin (1234)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => quickLogin('dolgozo1@goldwax.hu', '0000')}
              disabled={isLoading}
            >
              <Text style={styles.quickButtonText}>Dolgozó 1 (0000)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => quickLogin('dolgozo2@goldwax.hu', '1111')}
              disabled={isLoading}
            >
              <Text style={styles.quickButtonText}>Dolgozó 2 (1111)</Text>
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
  quickAccess: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAccessTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  quickButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
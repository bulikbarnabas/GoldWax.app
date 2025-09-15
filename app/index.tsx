import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Users, Star, MapPin, Phone, ChevronRight, Sparkles, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleEnter = () => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      const targetRoute = user?.role === 'admin' ? '/(tabs)/dashboard' : '/(tabs)/services';
      router.push(targetRoute);
    }
  };

  // Auto-navigate if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetRoute = user.role === 'admin' ? '/(tabs)/dashboard' : '/(tabs)/services';
      router.replace(targetRoute);
    }
  }, [isAuthenticated, user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.gold.light, Colors.background]}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>GW</Text>
            </View>
            <Text style={styles.brandName}>GoldWax</Text>
            <Text style={styles.tagline}>Prémium Szépségszalon</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Sparkles size={32} color={Colors.primary} />
            <Text style={styles.welcomeTitle}>Időpont nélkül is fogadjuk!</Text>
            <Text style={styles.welcomeText}>
              Nincs szükség előzetes bejelentkezésre. Jöjjön, amikor Önnek megfelelő!
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Miért válasszon minket?</Text>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Clock size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Időpont nélküli kiszolgálás</Text>
                <Text style={styles.featureText}>Rugalmas nyitvatartás, várakozás nélkül</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Users size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Szakképzett csapat</Text>
                <Text style={styles.featureText}>Tapasztalt kozmetikusok és fodrászok</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Star size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Prémium szolgáltatások</Text>
                <Text style={styles.featureText}>Minőségi termékek és kezelések</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Elérhetőségek</Text>
            
            <TouchableOpacity style={styles.infoCard}>
              <MapPin size={20} color={Colors.secondary} />
              <Text style={styles.infoText}>Budapest, Arany János u. 10.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoCard}>
              <Phone size={20} color={Colors.secondary} />
              <Text style={styles.infoText}>+36 30 123 4567</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoCard}>
              <Clock size={20} color={Colors.secondary} />
              <Text style={styles.infoText}>H-P: 9:00-20:00, Szo: 9:00-18:00</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.enterButton}
            onPress={handleEnter}
          >
            <LinearGradient
              colors={[Colors.gold.main, Colors.gold.dark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.enterButtonText}>
                {isAuthenticated ? 'Alkalmazás megnyitása' : 'Bejelentkezés'}
              </Text>
              <ChevronRight size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Kövessen minket</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.resetLink}
            onPress={() => router.push('/reset-storage')}
          >
            <Settings size={16} color={Colors.textSecondary} />
            <Text style={styles.resetLinkText}>Adatok törlése</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  enterButton: {
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
    marginRight: 8,
  },
  socialSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  socialTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 20,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statusContainer: {
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusSuccess: {
    backgroundColor: '#10b98120',
  },
  statusError: {
    backgroundColor: '#ef444420',
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusSuccessText: {
    color: '#10b981',
  },
  statusErrorText: {
    color: '#ef4444',
  },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  resetLinkText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});


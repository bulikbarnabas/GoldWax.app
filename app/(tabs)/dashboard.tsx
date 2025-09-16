import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Scissors,
  Calendar,
  Activity,
  Settings,
  Package
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();

  const stats = [
    {
      id: '1',
      title: 'Mai bevétel',
      value: '125,000 Ft',
      icon: DollarSign,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      id: '2',
      title: 'Heti bevétel',
      value: '850,000 Ft',
      icon: TrendingUp,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      id: '3',
      title: 'Mai vendégek',
      value: '24',
      icon: Users,
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
    {
      id: '4',
      title: 'Mai időpontok',
      value: '18',
      icon: Clock,
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Új foglalás',
      subtitle: 'Időpont rögzítése',
      icon: Calendar,
      color: '#FF1493',
      onPress: () => router.push('/(tabs)/services'),
    },
    {
      id: '2',
      title: 'Szolgáltatások',
      subtitle: 'Árak és kezelések',
      icon: Scissors,
      color: '#6366F1',
      onPress: () => router.push('/(tabs)/services'),
    },
    {
      id: '3',
      title: 'Ügyfelek',
      subtitle: 'Vendég adatok',
      icon: Users,
      color: '#10B981',
      onPress: () => router.push('/clients'),
    },
    {
      id: '4',
      title: 'Készlet',
      subtitle: 'Termékek kezelése',
      icon: Package,
      color: '#F59E0B',
      onPress: () => router.push('/inventory'),
    },
    {
      id: '5',
      title: 'Jelentések',
      subtitle: 'Statisztikák',
      icon: Activity,
      color: '#EF4444',
      onPress: () => router.push('/reports'),
    },
    {
      id: '6',
      title: 'Beállítások',
      subtitle: 'Rendszer konfiguráció',
      icon: Settings,
      color: '#6B7280',
      onPress: () => router.push('/settings'),
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Jó reggelt';
    if (hour < 18) return 'Jó napot';
    return 'Jó estét';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}!</Text>
          <Text style={styles.subtitle}>Szépségszalon Dashboard</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Gyors műveletek</Text>

      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
              <action.icon size={24} color={action.color} />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsScroll: {
    marginTop: -10,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});
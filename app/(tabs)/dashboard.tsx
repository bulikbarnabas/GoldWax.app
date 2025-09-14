import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Activity,
  UserPlus,
  Settings,
  Package
} from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useClientStats } from '@/hooks/use-clients';
import { useInventory } from '@/hooks/use-inventory';

import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getTodayRevenue, getWeekRevenue, getTodayTransactions } = useCart();
  const { getLowStockItems } = useInventory();

  const clientStats = useClientStats();

  const todayRevenue = useMemo(() => getTodayRevenue(), [getTodayRevenue]);
  const weekRevenue = useMemo(() => getWeekRevenue(), [getWeekRevenue]);
  const todayTransactions = useMemo(() => getTodayTransactions(), [getTodayTransactions]);
  const lowStockCount = useMemo(() => getLowStockItems().length, [getLowStockItems]);


  const stats = [
    {
      id: '1',
      title: 'Mai bevétel',
      value: `${todayRevenue.toLocaleString('hu-HU')} Ft`,
      icon: DollarSign,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      id: '2',
      title: 'Heti bevétel',
      value: `${weekRevenue.toLocaleString('hu-HU')} Ft`,
      icon: TrendingUp,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      id: '3',
      title: 'Mai tranzakciók',
      value: todayTransactions.toString(),
      icon: Activity,
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },

    {
      id: '5',
      title: 'Összes ügyfél',
      value: clientStats.totalClients.toString(),
      icon: Users,
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
    {
      id: '6',
      title: 'Alacsony készlet',
      value: lowStockCount.toString(),
      icon: Activity,
      color: lowStockCount > 0 ? '#EF4444' : '#10B981',
      bgColor: lowStockCount > 0 ? '#FEE2E2' : '#D1FAE5',
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Új vásárlás',
      subtitle: 'Szolgáltatás hozzáadása',
      icon: ShoppingCart,
      color: Colors.primary,
      onPress: () => router.push('/(tabs)/services'),
    },
    {
      id: '2',
      title: 'Előzmények',
      subtitle: 'Korábbi tranzakciók',
      icon: Clock,
      color: '#6366F1',
      onPress: () => router.push('/(tabs)/history'),
    },
    {
      id: '3',
      title: 'Statisztikák',
      subtitle: 'Részletes jelentések',
      icon: BarChart3,
      color: '#10B981',
      onPress: () => router.push('/reports'),
    },

    {
      id: '5',
      title: 'Ügyfelek',
      subtitle: 'Ügyfélkezelés',
      icon: Users,
      color: '#EC4899',
      onPress: () => router.push('/clients'),
    },
    {
      id: '6',
      title: 'Készlet',
      subtitle: 'Készletnyilvántartás',
      icon: Activity,
      color: '#EF4444',
      onPress: () => router.push('/inventory'),
    },
  ];

  const adminActions = [
    {
      id: '1',
      title: 'Szolgáltatások',
      subtitle: 'Árak és szolgáltatások kezelése',
      icon: Package,
      color: '#8B5CF6',
      onPress: () => router.push('/service-management'),
    },
    {
      id: '2',
      title: 'Felhasználók',
      subtitle: 'Dolgozók kezelése',
      icon: UserPlus,
      color: '#EC4899',
      onPress: () => router.push('/admin'),
    },
    {
      id: '3',
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
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name}!</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.roleBadgeText}>
            {user?.role === 'admin' ? 'Adminisztrátor' : 'Dolgozó'}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <TouchableOpacity key={stat.id} style={styles.statCard} activeOpacity={0.8}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
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

      {user?.role === 'admin' && (
        <View style={styles.adminContainer}>
          <Text style={styles.sectionTitle}>Adminisztráció</Text>
          <View style={styles.adminGrid}>
            {adminActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.adminCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.adminIconContainer, { backgroundColor: `${action.color}15` }]}>
                  <action.icon size={20} color={action.color} />
                </View>
                <View style={styles.adminTextContainer}>
                  <Text style={styles.adminTitle}>{action.title}</Text>
                  <Text style={styles.adminSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.gold.light,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 20,
  },

  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  adminContainer: {
    paddingHorizontal: 20,
  },
  adminGrid: {
    gap: 12,
  },
  adminCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  adminIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminTextContainer: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  adminSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomSpacing: {
    height: 20,
  },
});
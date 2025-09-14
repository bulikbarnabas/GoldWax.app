import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  ArrowLeft,
  Download,
  Filter
} from 'lucide-react-native';
import { useCart } from '@/hooks/use-cart';
import { router } from 'expo-router';

export default function ReportsScreen() {
  const { payments, getTodayRevenue, getWeekRevenue, getMonthlyRevenue } = useCart();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  const stats = useMemo(() => {
    const todayRevenue = getTodayRevenue();
    const weekRevenue = getWeekRevenue();
    const monthRevenue = getMonthlyRevenue();

    const todayCount = payments.filter(p => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const paymentDate = new Date(p.timestamp);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() === today.getTime();
    }).length;

    const weekCount = payments.filter(p => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(p.timestamp) >= weekAgo;
    }).length;

    const monthCount = payments.filter(p => {
      const today = new Date();
      const paymentDate = new Date(p.timestamp);
      return paymentDate.getMonth() === today.getMonth() && 
             paymentDate.getFullYear() === today.getFullYear();
    }).length;

    return {
      today: { revenue: todayRevenue, count: todayCount },
      week: { revenue: weekRevenue, count: weekCount },
      month: { revenue: monthRevenue, count: monthCount },
    };
  }, [payments, getTodayRevenue, getWeekRevenue, getMonthlyRevenue]);

  const topServices = useMemo(() => {
    const serviceCount = new Map<string, { name: string; count: number; revenue: number }>();
    
    payments.forEach(payment => {
      payment.items.forEach(item => {
        const key = item.service.id;
        const existing = serviceCount.get(key) || { 
          name: item.service.name, 
          count: 0, 
          revenue: 0 
        };
        serviceCount.set(key, {
          name: item.service.name,
          count: existing.count + item.quantity,
          revenue: existing.revenue + (item.service.price * item.quantity),
        });
      });
    });

    return Array.from(serviceCount.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [payments]);

  const paymentMethodStats = useMemo(() => {
    const methods = { cash: 0, card: 0, transfer: 0 };
    payments.forEach(p => {
      methods[p.paymentMethod] += p.total;
    });
    return methods;
  }, [payments]);

  const currentStats = stats[selectedPeriod];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Jelentések és Statisztikák</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={20} color="#8B4B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {(['today', 'week', 'month'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {period === 'today' ? 'Ma' : period === 'week' ? 'Hét' : 'Hónap'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <View style={styles.statHeader}>
              <DollarSign size={24} color="#fff" />
              <Text style={styles.statLabel}>Bevétel</Text>
            </View>
            <Text style={styles.statValueLarge}>
              {currentStats.revenue.toLocaleString('hu-HU')} Ft
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <BarChart3 size={20} color="#8B4B6B" />
              <Text style={styles.statLabel}>Tranzakciók</Text>
            </View>
            <Text style={styles.statValue}>{currentStats.count}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.statLabel}>Átlag</Text>
            </View>
            <Text style={styles.statValue}>
              {currentStats.count > 0 
                ? Math.round(currentStats.revenue / currentStats.count).toLocaleString('hu-HU')
                : 0} Ft
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Szolgáltatás</Text>
          {topServices.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceStats}>
                  {service.count} alkalommal • {service.revenue.toLocaleString('hu-HU')} Ft
                </Text>
              </View>
            </View>
          ))}
          {topServices.length === 0 && (
            <Text style={styles.emptyText}>Még nincs adat</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fizetési módok</Text>
          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentLabel}>Készpénz</Text>
              <Text style={styles.paymentValue}>
                {paymentMethodStats.cash.toLocaleString('hu-HU')} Ft
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentLabel}>Kártya</Text>
              <Text style={styles.paymentValue}>
                {paymentMethodStats.card.toLocaleString('hu-HU')} Ft
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentLabel}>Átutalás</Text>
              <Text style={styles.paymentValue}>
                {paymentMethodStats.transfer.toLocaleString('hu-HU')} Ft
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  exportButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#8B4B6B',
    borderColor: '#8B4B6B',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryCard: {
    backgroundColor: '#8B4B6B',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceStats: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
});
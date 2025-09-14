import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, CreditCard, Banknote, Smartphone } from 'lucide-react-native';
import { Payment } from '@/types/salon';
import { router } from 'expo-router';

const useStorage = () => {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem(key);
    } catch {
      return null;
    }
  };

  return { getItem };
};

export default function HistoryScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const insets = useSafeAreaInsets();
  const storage = useStorage();

  const loadPayments = async () => {
    try {
      const paymentsData = await storage.getItem('payments');
      if (paymentsData) {
        const parsedPayments: Payment[] = JSON.parse(paymentsData);
        const sortedPayments = parsedPayments.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setPayments(sortedPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('hu-HU')} Ft`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote color="#8B4B6B" size={16} />;
      case 'card': return <CreditCard color="#8B4B6B" size={16} />;
      case 'transfer': return <Smartphone color="#8B4B6B" size={16} />;
      default: return <CreditCard color="#8B4B6B" size={16} />;
    }
  };

  const getTotalStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayPayments = payments.filter(p => new Date(p.timestamp) >= todayStart);
    const todayTotal = todayPayments.reduce((sum, p) => sum + p.total, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthPayments = payments.filter(p => new Date(p.timestamp) >= monthStart);
    const monthTotal = monthPayments.reduce((sum, p) => sum + p.total, 0);

    return {
      todayCount: todayPayments.length,
      todayTotal,
      monthCount: monthPayments.length,
      monthTotal,
    };
  };

  const stats = getTotalStats();

  if (payments.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Előzmények</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Calendar color="#ccc" size={64} />
          <Text style={styles.emptyText}>Még nincsenek tranzakciók</Text>
          <Text style={styles.emptySubtext}>
            Az első fizetés után itt jelennek meg az előzmények
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Előzmények</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ma</Text>
            <Text style={styles.statValue}>{formatPrice(stats.todayTotal)}</Text>
            <Text style={styles.statCount}>{stats.todayCount} tranzakció</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hónap</Text>
            <Text style={styles.statValue}>{formatPrice(stats.monthTotal)}</Text>
            <Text style={styles.statCount}>{stats.monthCount} tranzakció</Text>
          </View>
        </View>

        <View style={styles.paymentsContainer}>
          {payments.map(payment => (
            <TouchableOpacity
              key={payment.id}
              style={styles.paymentCard}
              onPress={() => router.push({
                pathname: '/receipt',
                params: { paymentId: payment.id }
              })}
            >
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.customerName}>{payment.customer.name}</Text>
                  <Text style={styles.receiptNumber}>{payment.receiptNumber}</Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.amount}>{formatPrice(payment.total)}</Text>
                  <View style={styles.paymentMethod}>
                    {getPaymentIcon(payment.paymentMethod)}
                  </View>
                </View>
              </View>
              
              <View style={styles.paymentDetails}>
                <Text style={styles.itemCount}>
                  {payment.items.length} szolgáltatás
                </Text>
                <Text style={styles.paymentDate}>
                  {formatDate(payment.timestamp)}
                </Text>
              </View>

              <View style={styles.servicesList}>
                {payment.items.slice(0, 2).map((item, index) => (
                  <Text key={index} style={styles.serviceName}>
                    {item.quantity}x {item.service.name}
                  </Text>
                ))}
                {payment.items.length > 2 && (
                  <Text style={styles.moreServices}>
                    +{payment.items.length - 2} további
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4B6B',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4B6B',
    marginBottom: 4,
  },
  statCount: {
    fontSize: 12,
    color: '#999',
  },
  paymentsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 12,
    color: '#8B4B6B',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4B6B',
    marginBottom: 4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  servicesList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  serviceName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  moreServices: {
    fontSize: 12,
    color: '#8B4B6B',
    fontStyle: 'italic',
  },
});
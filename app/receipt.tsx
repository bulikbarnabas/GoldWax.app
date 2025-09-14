import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Check, Home, Share } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment } from '@/types/salon';

export default function ReceiptScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      const paymentsData = await AsyncStorage.getItem('payments');
      if (paymentsData) {
        const payments: Payment[] = JSON.parse(paymentsData);
        const foundPayment = payments.find(p => p.id === paymentId);
        if (foundPayment) {
          setPayment(foundPayment);
        }
      }
    } catch (error) {
      console.error('Error loading payment:', error);
      Alert.alert('Hiba', 'Nem sikerült betölteni a számlát');
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('hu-HU')} Ft`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Készpénz';
      case 'card': return 'Kártya';
      case 'transfer': return 'Átutalás';
      default: return method;
    }
  };

  const handleShare = () => {
    Alert.alert('Megosztás', 'A megosztás funkció hamarosan elérhető lesz!');
  };

  if (!payment) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Számla', headerBackTitle: 'Vissza' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Számla betöltése...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Számla', headerBackTitle: 'Vissza' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Check color="#fff" size={32} />
          </View>
          <Text style={styles.successTitle}>Fizetés sikeres!</Text>
          <Text style={styles.receiptNumber}>Számla: {payment.receiptNumber}</Text>
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.businessHeader}>
            <Text style={styles.businessName}>Gyantaszalon</Text>
            <Text style={styles.receiptDate}>{formatDate(payment.timestamp)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>Vásárló</Text>
            <Text style={styles.customerName}>{payment.customer.name}</Text>
            {payment.customer.phone && (
              <Text style={styles.customerDetail}>{payment.customer.phone}</Text>
            )}
            {payment.customer.email && (
              <Text style={styles.customerDetail}>{payment.customer.email}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Szolgáltatások</Text>
            {payment.items.map((item, index) => (
              <View key={index} style={styles.receiptItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.service.name}</Text>
                  <Text style={styles.itemCategory}>{item.service.category.name}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.service.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Fizetési mód:</Text>
              <Text style={styles.totalValue}>{getPaymentMethodText(payment.paymentMethod)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Összesen:</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(payment.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Köszönjük, hogy minket választott!</Text>
          <Text style={styles.footerSubtext}>
            Kérjük, őrizze meg ezt a számlát a garancia érvényesítéséhez.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share color="#8B4B6B" size={20} />
          <Text style={styles.shareButtonText}>Megosztás</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.push('/')}
        >
          <Home color="#fff" size={20} />
          <Text style={styles.homeButtonText}>Főoldal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  receiptNumber: {
    fontSize: 16,
    color: '#8B4B6B',
    fontWeight: '500',
  },
  receiptCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  businessHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4B6B',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 16,
  },
  customerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemsSection: {
    marginBottom: 16,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#8B4B6B',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalSection: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4B6B',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B4B6B',
    backgroundColor: '#fff',
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4B6B',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B4B6B',
  },
  homeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
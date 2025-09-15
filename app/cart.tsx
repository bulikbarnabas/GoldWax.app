import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Minus, Plus, Trash2, CreditCard, Banknote, Smartphone, Share2 } from 'lucide-react-native';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { Colors } from '@/constants/colors';
import SocialShare from '@/components/SocialShare';

export default function CartScreen() {
  const { items, customer, total, totalDuration, updateQuantity, removeFromCart, setCustomer, processPayment } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSocialShare, setShowSocialShare] = useState(false);
  const insets = useSafeAreaInsets();

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('hu-HU')} Ft`;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}ó ${minutes}p`;
    }
    return `${minutes} perc`;
  };

  const handlePayment = async () => {
    setErrorMessage('');
    
    if (items.length === 0) {
      setErrorMessage('A kosár üres!');
      return;
    }

    if (!customer.name.trim()) {
      setErrorMessage('Kérjük, adja meg a vásárló nevét!');
      return;
    }

    try {
      const payment = await processPayment(paymentMethod, user?.id, user?.name);
      
      // Azonnal navigálunk a nyugtához
      router.push({
        pathname: '/receipt',
        params: { paymentId: payment.id }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Fizetés feldolgozása sikertelen!');
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ title: 'Kosár', headerBackTitle: 'Vissza' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>A kosár üres</Text>
          <TouchableOpacity style={styles.continueButton} onPress={() => router.back()}>
            <Text style={styles.continueButtonText}>Szolgáltatások böngészése</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Kosár', headerBackTitle: 'Vissza' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vásárló adatok</Text>
          <TextInput
            style={styles.input}
            placeholder="Név *"
            value={customer.name}
            onChangeText={(name) => setCustomer({ ...customer, name })}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefonszám (opcionális)"
            value={customer.phone || ''}
            onChangeText={(phone) => setCustomer({ ...customer, phone })}
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email (opcionális)"
            value={customer.email || ''}
            onChangeText={(email) => setCustomer({ ...customer, email })}
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Szolgáltatások</Text>
          {items.map(item => (
            <View key={item.service.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.service.name}</Text>
                <Text style={styles.itemCategory}>{item.service.category.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.service.price)}</Text>
              </View>
              <View style={styles.itemControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.service.id, item.quantity - 1)}
                >
                  <Minus color="#8B4B6B" size={16} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.service.id, item.quantity + 1)}
                >
                  <Plus color="#8B4B6B" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.service.id)}
                >
                  <Trash2 color="#E74C3C" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fizetési mód</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[styles.paymentMethod, paymentMethod === 'cash' && styles.paymentMethodActive]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Banknote color={paymentMethod === 'cash' ? '#fff' : '#8B4B6B'} size={20} />
              <Text style={[styles.paymentMethodText, paymentMethod === 'cash' && styles.paymentMethodTextActive]}>
                Készpénz
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentMethod, paymentMethod === 'card' && styles.paymentMethodActive]}
              onPress={() => setPaymentMethod('card')}
            >
              <CreditCard color={paymentMethod === 'card' ? '#fff' : '#8B4B6B'} size={20} />
              <Text style={[styles.paymentMethodText, paymentMethod === 'card' && styles.paymentMethodTextActive]}>
                Kártya
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentMethod, paymentMethod === 'transfer' && styles.paymentMethodActive]}
              onPress={() => setPaymentMethod('transfer')}
            >
              <Smartphone color={paymentMethod === 'transfer' ? '#fff' : '#8B4B6B'} size={20} />
              <Text style={[styles.paymentMethodText, paymentMethod === 'transfer' && styles.paymentMethodTextActive]}>
                Átutalás
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Időtartam:</Text>
            <Text style={styles.summaryValue}>{formatDuration(totalDuration)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Összesen:</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <Text style={styles.payButtonText}>Fizetés</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => setShowSocialShare(true)}
          >
            <Share2 size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <SocialShare
        visible={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        serviceCompleted={items.map(i => i.service.name).join(', ')}
        clientName={customer.name}
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#8B4B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#8B4B6B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 12,
    padding: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
  },
  paymentMethodActive: {
    backgroundColor: '#8B4B6B',
    borderColor: '#8B4B6B',
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4B6B',
  },
  paymentMethodTextActive: {
    color: '#fff',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  summary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4B6B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  payButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButton: {
    width: 56,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    textAlign: 'center',
  },
});
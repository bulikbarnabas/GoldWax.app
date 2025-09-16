import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, ShoppingCart, Plus, Clock, DollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const SERVICES = [
  {
    id: '1',
    name: 'Női hajvágás',
    price: 8500,
    duration: 60,
    category: 'Fodrászat',
    description: 'Mosás, vágás, szárítás',
  },
  {
    id: '2',
    name: 'Férfi hajvágás',
    price: 5500,
    duration: 30,
    category: 'Fodrászat',
    description: 'Mosás, vágás, szárítás',
  },
  {
    id: '3',
    name: 'Hajfestés',
    price: 12000,
    duration: 120,
    category: 'Fodrászat',
    description: 'Teljes hajfestés',
  },
  {
    id: '4',
    name: 'Manikűr',
    price: 4500,
    duration: 45,
    category: 'Körmök',
    description: 'Klasszikus manikűr',
  },
  {
    id: '5',
    name: 'Gél lakk',
    price: 6500,
    duration: 60,
    category: 'Körmök',
    description: 'Tartós gél lakk',
  },
  {
    id: '6',
    name: 'Arckezelés',
    price: 9500,
    duration: 60,
    category: 'Kozmetika',
    description: 'Tisztító arckezelés',
  },
  {
    id: '7',
    name: 'Smink',
    price: 7500,
    duration: 45,
    category: 'Kozmetika',
    description: 'Alkalmi smink',
  },
  {
    id: '8',
    name: 'Svéd masszázs',
    price: 11000,
    duration: 60,
    category: 'Masszázs',
    description: 'Teljes test masszázs',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Összes', icon: '🎯' },
  { id: 'hair', name: 'Fodrászat', icon: '💇‍♀️' },
  { id: 'nails', name: 'Körmök', icon: '💅' },
  { id: 'cosmetics', name: 'Kozmetika', icon: '✨' },
  { id: 'massage', name: 'Masszázs', icon: '💆‍♀️' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<string[]>([]);

  const filteredServices = SERVICES.filter(service => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'hair' && service.category === 'Fodrászat') ||
      (selectedCategory === 'nails' && service.category === 'Körmök') ||
      (selectedCategory === 'cosmetics' && service.category === 'Kozmetika') ||
      (selectedCategory === 'massage' && service.category === 'Masszázs');
    
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const addToCart = (serviceId: string) => {
    setCartItems([...cartItems, serviceId]);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('hu-HU')} Ft`;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}ó ${minutes}p`;
    }
    return `${duration} perc`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Keresés szolgáltatások között..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <ShoppingCart color="#fff" size={22} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.servicesContainer} showsVerticalScrollIndicator={false}>
        {filteredServices.map(service => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <DollarSign size={14} color="#FF1493" />
                  <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={14} color="#999" />
                  <Text style={styles.serviceDuration}>{formatDuration(service.duration)}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => addToCart(service.id)}
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  cartButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 80,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#FF1493',
    borderColor: '#FF1493',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  servicesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF1493',
  },
  serviceDuration: {
    fontSize: 13,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#FF1493',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SectionList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ShoppingCart, Plus, Filter, Clock, DollarSign, Settings, Users } from 'lucide-react-native';
import { services, serviceCategories } from '@/constants/services';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { Service } from '@/types/salon';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function ServicesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { addToCart, items } = useCart();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'all' || service.category.id === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const groupedServices = useMemo(() => {
    const groups: { title: string; data: Service[] }[] = [];
    const categoryMap = new Map<string, Service[]>();

    filteredServices.forEach(service => {
      const categoryId = service.category.id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, []);
      }
      categoryMap.get(categoryId)?.push(service);
    });

    categoryMap.forEach((services, categoryId) => {
      const category = serviceCategories.find(c => c.id === categoryId);
      if (category) {
        groups.push({
          title: `${category.icon} ${category.name}`,
          data: services
        });
      }
    });

    return groups;
  }, [filteredServices]);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (service: Service) => {
    if (!service?.id || !service?.name?.trim()) return;
    addToCart(service);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Szolgáltatások</Text>
          <Text style={styles.subtitle}>Időpont nélkül is fogadjuk!</Text>
          <View style={styles.walkInBadge}>
            <Users size={14} color={Colors.gold.dark} />
            <Text style={styles.walkInText}>Várakozás nélkül</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push('/service-management')}
            >
              <Settings color={Colors.primary} size={20} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Filter color={Colors.primary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <ShoppingCart color="#fff" size={22} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search color={Colors.primary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Keresés szolgáltatások között..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>Kategóriák</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>🎯</Text>
            </View>
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              Összes
            </Text>
          </TouchableOpacity>
          {serviceCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={styles.categoryIconContainer}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </View>
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {viewMode === 'list' ? (
        <SectionList
          sections={groupedServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onAdd={() => handleAddToCart(item)}
              viewMode={viewMode}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <ScrollView style={styles.servicesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onAdd={() => handleAddToCart(service)}
                viewMode={viewMode}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

interface ServiceCardProps {
  service: Service;
  onAdd: () => void;
  viewMode: 'grid' | 'list';
}

function ServiceCard({ service, onAdd, viewMode }: ServiceCardProps) {
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

  if (viewMode === 'grid') {
    return (
      <View style={styles.serviceCardGrid}>
        <View style={styles.gridCardHeader}>
          <Text style={styles.gridCategoryIcon}>{service.category.icon}</Text>
        </View>
        <Text style={styles.gridServiceName} numberOfLines={2}>{service.name}</Text>
        <View style={styles.gridPriceContainer}>
          <Text style={styles.gridPrice}>{formatPrice(service.price)}</Text>
          <View style={styles.gridDuration}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.gridDurationText}>{formatDuration(service.duration)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.gridAddButton} onPress={onAdd}>
          <Plus color="#fff" size={16} />
          <Text style={styles.gridAddText}>Hozzáad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{service.category.icon} {service.category.name}</Text>
          </View>
        </View>
        {service.description && (
          <Text style={styles.serviceDescription}>{service.description}</Text>
        )}
        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <DollarSign size={14} color={Colors.primary} />
            <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.serviceDuration}>{formatDuration(service.duration)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Plus color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walkInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    gap: 4,
  },
  walkInText: {
    fontSize: 12,
    color: Colors.gold.dark,
    fontWeight: '600' as const,
  },
  adminButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  categoriesContainer: {
    maxHeight: 100,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 90,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    transform: [{ scale: 1.02 }],
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryTextActive: {
    color: '#fff',
  },
  servicesContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  serviceCardGrid: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: '48%',
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
  gridCardHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  gridCategoryIcon: {
    fontSize: 24,
  },
  gridServiceName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
    minHeight: 40,
    lineHeight: 20,
  },
  gridPriceContainer: {
    marginBottom: 8,
  },
  gridPrice: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 6,
  },
  gridDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridDurationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  gridAddButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  gridAddText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  categoryBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  serviceDuration: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  serviceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 6,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
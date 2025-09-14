import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  SectionList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { Service, ServiceCategory } from '@/types/salon';
import { services as initialServices, serviceCategories as initialCategories } from '@/constants/services';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Search,
  DollarSign,
  Clock,
  FolderOpen,
  Settings
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ServiceManagementScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    categoryId: categories[0]?.id || ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    icon: ''
  });

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'all' || service.category.id === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

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
      const category = categories.find((c: ServiceCategory) => c.id === categoryId);
      if (category) {
        groups.push({
          title: `${category.icon} ${category.name}`,
          data: services
        });
      }
    });

    return groups;
  }, [filteredServices, categories]);

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccess}>
          <Text style={styles.noAccessText}>Csak adminisztrátorok férhetnek hozzá ehhez az oldalhoz!</Text>
          <TouchableOpacity style={styles.noAccessButton} onPress={() => router.back()}>
            <Text style={styles.noAccessButtonText}>Vissza</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddService = async () => {
    if (!formData.name.trim() || !formData.price || !formData.duration) {
      Alert.alert('Hiba', 'Minden kötelező mező kitöltése szükséges!');
      return;
    }

    const price = parseFloat(formData.price);
    const duration = parseInt(formData.duration);

    if (isNaN(price) || price <= 0) {
      Alert.alert('Hiba', 'Az ár érvényes szám kell legyen!');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Hiba', 'Az időtartam érvényes szám kell legyen!');
      return;
    }

    setIsLoading(true);
    
    const category = categories.find((c: ServiceCategory) => c.id === formData.categoryId);
    if (!category) {
      Alert.alert('Hiba', 'Érvénytelen kategória!');
      setIsLoading(false);
      return;
    }

    const newService: Service = {
      id: `service-${Date.now()}`,
      name: formData.name.trim(),
      category,
      price,
      duration,
      description: formData.description.trim() || undefined
    };

    setServices(prev => [...prev, newService]);
    setShowAddModal(false);
    resetForm();
    setIsLoading(false);
    Alert.alert('Siker', 'Szolgáltatás sikeresen hozzáadva!');
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    if (!formData.name.trim() || !formData.price || !formData.duration) {
      Alert.alert('Hiba', 'Minden kötelező mező kitöltése szükséges!');
      return;
    }

    const price = parseFloat(formData.price);
    const duration = parseInt(formData.duration);

    if (isNaN(price) || price <= 0) {
      Alert.alert('Hiba', 'Az ár érvényes szám kell legyen!');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Hiba', 'Az időtartam érvényes szám kell legyen!');
      return;
    }

    setIsLoading(true);
    
    const category = categories.find((c: ServiceCategory) => c.id === formData.categoryId);
    if (!category) {
      Alert.alert('Hiba', 'Érvénytelen kategória!');
      setIsLoading(false);
      return;
    }

    const updatedService: Service = {
      ...editingService,
      name: formData.name.trim(),
      category,
      price,
      duration,
      description: formData.description.trim() || undefined
    };

    setServices(prev => prev.map(s => s.id === editingService.id ? updatedService : s));
    setEditingService(null);
    resetForm();
    setIsLoading(false);
    Alert.alert('Siker', 'Szolgáltatás sikeresen módosítva!');
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    Alert.alert(
      'Törlés megerősítése',
      `Biztosan törölni szeretné a "${serviceName}" szolgáltatást?`,
      [
        { text: 'Mégse', style: 'cancel' },
        {
          text: 'Törlés',
          style: 'destructive',
          onPress: () => {
            setServices(prev => prev.filter(s => s.id !== serviceId));
            Alert.alert('Siker', 'Szolgáltatás sikeresen törölve!');
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      description: '',
      categoryId: categories[0]?.id || ''
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      icon: ''
    });
  };

  const handleAddCategory = async () => {
    if (!categoryFormData.name.trim() || !categoryFormData.icon.trim()) {
      Alert.alert('Hiba', 'Minden mező kitöltése szükséges!');
      return;
    }

    setIsLoading(true);
    
    const newCategory: ServiceCategory = {
      id: `category-${Date.now()}`,
      name: categoryFormData.name.trim(),
      icon: categoryFormData.icon.trim()
    };

    setCategories(prev => [...prev, newCategory]);
    setShowCategoryModal(false);
    resetCategoryForm();
    setIsLoading(false);
    Alert.alert('Siker', 'Kategória sikeresen hozzáadva!');
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    if (!categoryFormData.name.trim() || !categoryFormData.icon.trim()) {
      Alert.alert('Hiba', 'Minden mező kitöltése szükséges!');
      return;
    }

    setIsLoading(true);
    
    const updatedCategory: ServiceCategory = {
      ...editingCategory,
      name: categoryFormData.name.trim(),
      icon: categoryFormData.icon.trim()
    };

    setCategories(prev => prev.map(c => c.id === editingCategory.id ? updatedCategory : c));
    
    // Update services that use this category
    setServices(prev => prev.map(s => 
      s.category.id === editingCategory.id 
        ? { ...s, category: updatedCategory }
        : s
    ));
    
    setEditingCategory(null);
    resetCategoryForm();
    setIsLoading(false);
    Alert.alert('Siker', 'Kategória sikeresen módosítva!');
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const servicesInCategory = services.filter(s => s.category.id === categoryId);
    
    if (servicesInCategory.length > 0) {
      Alert.alert(
        'Nem törölhető',
        `A "${categoryName}" kategóriában ${servicesInCategory.length} szolgáltatás található. Először törölje vagy helyezze át ezeket a szolgáltatásokat.`
      );
      return;
    }

    Alert.alert(
      'Törlés megerősítése',
      `Biztosan törölni szeretné a "${categoryName}" kategóriát?`,
      [
        { text: 'Mégse', style: 'cancel' },
        {
          text: 'Törlés',
          style: 'destructive',
          onPress: () => {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
            Alert.alert('Siker', 'Kategória sikeresen törölve!');
          }
        }
      ]
    );
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || '',
      categoryId: service.category.id
    });
  };

  const openEditCategoryModal = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      icon: category.icon
    });
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Kezelés</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'services' 
              ? `${filteredServices.length} szolgáltatás` 
              : `${categories.length} kategória`
            }
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => activeTab === 'services' ? setShowAddModal(true) : setShowCategoryModal(true)}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
        >
          <Settings size={18} color={activeTab === 'services' ? '#8B4B6B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Szolgáltatások
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <FolderOpen size={18} color={activeTab === 'categories' ? '#8B4B6B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Kategóriák
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'services' && (
        <>
          <View style={styles.searchContainer}>
            <Search color="#999" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Keresés név vagy leírás alapján..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
                Összes
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {activeTab === 'services' ? (
        <SectionList
          sections={groupedServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceManagementCard
              service={item}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDeleteService(item.id, item.name)}
              formatPrice={formatPrice}
              formatDuration={formatDuration}
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
        <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
          <View style={styles.listContent}>
            {categories.map(category => (
              <CategoryManagementCard
                key={category.id}
                category={category}
                servicesCount={services.filter(s => s.category.id === category.id).length}
                onEdit={() => openEditCategoryModal(category)}
                onDelete={() => handleDeleteCategory(category.id, category.name)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={showAddModal || editingService !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Szolgáltatás szerkesztése' : 'Új szolgáltatás'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingService(null);
                  resetForm();
                }}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Név *</Text>
              <TextInput
                style={styles.input}
                placeholder="Szolgáltatás neve"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!isLoading}
              />

              <Text style={styles.inputLabel}>Kategória *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === category.id && styles.categoryOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, categoryId: category.id })}
                    disabled={isLoading}
                  >
                    <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      formData.categoryId === category.id && styles.categoryOptionTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Ár (Ft) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5000"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Időtartam (perc) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    value={formData.duration}
                    onChangeText={(text) => setFormData({ ...formData, duration: text })}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Leírás</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Opcionális leírás..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={editingService ? handleUpdateService : handleAddService}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {editingService ? 'Módosítás' : 'Hozzáadás'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCategoryModal || editingCategory !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Kategória szerkesztése' : 'Új kategória'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  resetCategoryForm();
                }}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Név *</Text>
              <TextInput
                style={styles.input}
                placeholder="Kategória neve"
                value={categoryFormData.name}
                onChangeText={(text) => setCategoryFormData({ ...categoryFormData, name: text })}
                editable={!isLoading}
              />

              <Text style={styles.inputLabel}>Ikon *</Text>
              <TextInput
                style={styles.input}
                placeholder="Emoji ikon (pl. 💎)"
                value={categoryFormData.icon}
                onChangeText={(text) => setCategoryFormData({ ...categoryFormData, icon: text })}
                editable={!isLoading}
              />

              <View style={styles.iconPreview}>
                <Text style={styles.iconPreviewLabel}>Előnézet:</Text>
                <View style={styles.iconPreviewContainer}>
                  <Text style={styles.iconPreviewIcon}>{categoryFormData.icon || '❓'}</Text>
                  <Text style={styles.iconPreviewText}>{categoryFormData.name || 'Kategória neve'}</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={editingCategory ? handleUpdateCategory : handleAddCategory}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {editingCategory ? 'Módosítás' : 'Hozzáadás'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface ServiceManagementCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  formatPrice: (price: number) => string;
  formatDuration: (duration: number) => string;
}

function ServiceManagementCard({ service, onEdit, onDelete, formatPrice, formatDuration }: ServiceManagementCardProps) {
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
            <DollarSign size={14} color="#8B4B6B" />
            <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#999" />
            <Text style={styles.serviceDuration}>{formatDuration(service.duration)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.serviceActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Edit2 size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
          <Trash2 size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface CategoryManagementCardProps {
  category: ServiceCategory;
  servicesCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

function CategoryManagementCard({ category, servicesCount, onEdit, onDelete }: CategoryManagementCardProps) {
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryCardIcon}>
        <Text style={styles.categoryCardIconText}>{category.icon}</Text>
      </View>
      <View style={styles.categoryCardInfo}>
        <Text style={styles.categoryCardName}>{category.name}</Text>
        <Text style={styles.categoryCardCount}>
          {servicesCount} szolgáltatás
        </Text>
      </View>
      <View style={styles.serviceActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Edit2 size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton, servicesCount > 0 && styles.disabledDeleteButton]} 
          onPress={onDelete}
          disabled={servicesCount > 0}
        >
          <Trash2 size={18} color={servicesCount > 0 ? '#ccc' : '#ff4444'} />
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500' as const,
  },
  addButton: {
    backgroundColor: '#8B4B6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#8B4B6B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B4B6B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    maxHeight: 50,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#8B4B6B',
    borderColor: '#8B4B6B',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600' as const,
  },
  categoryTextActive: {
    color: '#fff',
  },
  categoriesList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#374151',
    letterSpacing: -0.2,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryCardIconText: {
    fontSize: 24,
  },
  categoryCardInfo: {
    flex: 1,
  },
  categoryCardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryCardCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 6,
    lineHeight: 18,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#8B4B6B',
  },
  serviceDuration: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffe0e0',
  },
  disabledDeleteButton: {
    opacity: 0.5,
  },
  noAccess: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAccessText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  noAccessButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  noAccessButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categorySelector: {
    marginBottom: 8,
    maxHeight: 60,
  },
  categoryOption: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
  },
  categoryOptionActive: {
    backgroundColor: '#8B4B6B',
    borderColor: '#8B4B6B',
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  iconPreview: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  iconPreviewLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  iconPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPreviewIcon: {
    fontSize: 24,
  },
  iconPreviewText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B4B6B',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
});
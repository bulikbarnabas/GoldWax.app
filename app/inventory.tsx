import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Package, 
  Plus, 
  Minus,
  AlertTriangle,
  DollarSign,
  Search,
  X,
  Edit2,
  Trash2,
  Scan,
  Camera,
  RefreshCw,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useInventory } from '@/hooks/use-inventory';
import { Inventory } from '@/types/salon';

const categoryNames = {
  wax: 'Gyanta',
  oil: 'Olaj',
  cream: 'Krém',
  tool: 'Eszköz',
  other: 'Egyéb',
};

const categoryColors = {
  wax: '#8B4B6B',
  oil: '#10B981',
  cream: '#3B82F6',
  tool: '#F59E0B',
  other: '#6B7280',
};

export default function InventoryScreen() {
  const router = useRouter();
  const { 
    items, 
    lastSync,
    addItem, 
    updateItem, 
    deleteItem, 
    restockItem,
    useItem: consumeItem,
    getLowStockItems,
    getItemsByCategory,
    getTotalValue,
    findItemByBarcode,
    restockByBarcode,
    useItemByBarcode: consumeItemByBarcode,
    searchItems,
    refreshInventory
  } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Inventory['category'] | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [restockingItem, setRestockingItem] = useState<Inventory | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeAction, setBarcodeAction] = useState<'restock' | 'use'>('restock');
  const [barcodeQuantity, setBarcodeQuantity] = useState('');
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraAction, setCameraAction] = useState<'restock' | 'use'>('restock');
  const [cameraQuantity, setCameraQuantity] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'wax' as Inventory['category'],
    quantity: '',
    minQuantity: '',
    unit: '',
    price: '',
    supplier: '',
    barcode: '',
  });

  const filteredItems = useMemo(() => {
    let filtered = selectedCategory === 'all' ? items : getItemsByCategory(selectedCategory as Inventory['category']);
    
    if (searchQuery) {
      filtered = searchItems(searchQuery);
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
    }
    
    return filtered;
  }, [items, selectedCategory, searchQuery, getItemsByCategory, searchItems]);

  const lowStockItems = useMemo(() => getLowStockItems(), [getLowStockItems]);
  const totalValue = useMemo(() => getTotalValue(), [getTotalValue]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'wax',
      quantity: '',
      minQuantity: '',
      unit: '',
      price: '',
      supplier: '',
      barcode: '',
    });
    setModalVisible(true);
  };

  const handleEditItem = (item: Inventory) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      supplier: item.supplier || '',
      barcode: item.barcode || '',
    });
    setModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!formData.name.trim() || !formData.quantity || !formData.minQuantity || !formData.unit.trim() || !formData.price) {
      Alert.alert('Hiba', 'Minden kötelező mezőt ki kell tölteni!');
      return;
    }

    // Check if barcode already exists (only if barcode is provided)
    if (formData.barcode && formData.barcode.trim()) {
      const existingItem = findItemByBarcode(formData.barcode.trim());
      if (existingItem && (!editingItem || existingItem.id !== editingItem.id)) {
        Alert.alert('Hiba', 'Ez a vonalkód már használatban van!');
        return;
      }
    }

    const itemData = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      minQuantity: parseInt(formData.minQuantity),
      unit: formData.unit,
      price: parseFloat(formData.price),
      supplier: formData.supplier || undefined,
      barcode: formData.barcode.trim() || undefined,
    };

    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
    
    setModalVisible(false);
  };

  const handleDeleteItem = (item: Inventory) => {
    Alert.alert(
      'Törlés megerősítése',
      `Biztosan törölni szeretnéd a(z) ${item.name} terméket?`,
      [
        { text: 'Mégse', style: 'cancel' },
        { 
          text: 'Törlés', 
          style: 'destructive',
          onPress: () => deleteItem(item.id)
        },
      ]
    );
  };

  const handleRestockItem = (item: Inventory) => {
    setRestockingItem(item);
    setRestockQuantity('');
    setRestockModalVisible(true);
  };

  const handleConfirmRestock = () => {
    if (!restockQuantity || parseInt(restockQuantity) <= 0) {
      Alert.alert('Hiba', 'Érvényes mennyiséget adj meg!');
      return;
    }

    if (restockingItem) {
      restockItem(restockingItem.id, parseInt(restockQuantity));
      setRestockModalVisible(false);
    }
  };

  const handleBarcodeAction = () => {
    setBarcodeInput('');
    setBarcodeQuantity('');
    setBarcodeModalVisible(true);
  };

  const handleBarcodeSubmit = () => {
    if (!barcodeInput.trim()) {
      Alert.alert('Hiba', 'Add meg a vonalkódot!');
      return;
    }

    if (!barcodeQuantity || parseInt(barcodeQuantity) <= 0) {
      Alert.alert('Hiba', 'Érvényes mennyiséget adj meg!');
      return;
    }

    const quantity = parseInt(barcodeQuantity);
    let success = false;
    let item: Inventory | null = null;

    if (barcodeAction === 'restock') {
      item = restockByBarcode(barcodeInput.trim(), quantity);
      success = !!item;
    } else {
      success = consumeItemByBarcode(barcodeInput.trim(), quantity);
      item = findItemByBarcode(barcodeInput.trim()) || null;
    }

    if (success && item) {
      Alert.alert(
        'Sikeres művelet',
        `${item.name}: ${barcodeAction === 'restock' ? 'Feltöltve' : 'Felhasználva'} ${quantity} ${item.unit}`
      );
      setBarcodeModalVisible(false);
    } else {
      Alert.alert(
        'Hiba',
        item 
          ? (barcodeAction === 'use' ? 'Nincs elegendő készlet!' : 'Ismeretlen hiba történt!')
          : 'Nem található termék ezzel a vonalkóddal!'
      );
    }
  };

  const handleUseItem = (item: Inventory) => {
    if (item.quantity > 0) {
      consumeItem(item.id, 1);
    }
  };

  const handleCameraSubmit = () => {
    if (!cameraQuantity || parseInt(cameraQuantity) <= 0) {
      Alert.alert('Hiba', 'Érvényes mennyiséget adj meg!');
      return;
    }

    const quantity = parseInt(cameraQuantity);
    router.push(`/barcode-scanner?action=${cameraAction}&quantity=${quantity}` as any);
    setCameraModalVisible(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshInventory();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Készletkezelés</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, isRefreshing && styles.refreshButtonActive]}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={20} color={isRefreshing ? '#8B4B6B' : '#6B7280'} />
            <Text style={styles.refreshText}>
              {isRefreshing ? 'Frissítés...' : 'Frissítés'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.lastSyncText}>
          Utolsó szinkronizáció: {lastSync.toLocaleTimeString('hu-HU')}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={20} color="#8B4B6B" />
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Termékek</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#10B981" />
            <Text style={styles.statValue}>
              {Math.round(totalValue).toLocaleString('hu-HU')} Ft
            </Text>
            <Text style={styles.statLabel}>Összérték</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{lowStockItems.length}</Text>
            <Text style={styles.statLabel}>Alacsony készlet</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Keresés név, beszállító vagy vonalkód alapján..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.barcodeActions}>
          <TouchableOpacity
            style={[styles.barcodeButton, styles.restockBarcodeButton]}
            onPress={() => {
              setBarcodeAction('restock');
              handleBarcodeAction();
            }}
          >
            <Scan size={18} color="#fff" />
            <Text style={styles.barcodeButtonText}>Manuális vonalkód</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.barcodeButton, styles.cameraBarcodeButton]}
            onPress={() => {
              setCameraAction('restock');
              setCameraQuantity('1');
              setCameraModalVisible(true);
            }}
          >
            <Camera size={18} color="#fff" />
            <Text style={styles.barcodeButtonText}>Kamerás szkennelés</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
              Összes
            </Text>
          </TouchableOpacity>
          {Object.entries(categoryNames).map(([key, name]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip, 
                selectedCategory === key && styles.filterChipActive,
                selectedCategory === key && { backgroundColor: categoryColors[key as Inventory['category']] }
              ]}
              onPress={() => setSelectedCategory(key as Inventory['category'])}
            >
              <Text style={[styles.filterText, selectedCategory === key && styles.filterTextActive]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {lowStockItems.length > 0 && selectedCategory === 'all' && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              {lowStockItems.length} termék alacsony készleten!
            </Text>
          </View>
        )}

        {filteredItems.map((item) => {
          const isLowStock = item.quantity <= item.minQuantity;
          return (
            <View
              key={item.id}
              style={[styles.itemCard, isLowStock && styles.itemCardWarning]}
            >
              <View style={styles.itemHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColors[item.category] }]}>
                  <Text style={styles.categoryBadgeText}>{categoryNames[item.category]}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.actionButton}>
                    <Edit2 size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteItem(item)} style={styles.actionButton}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.itemName}>{item.name}</Text>
              {item.supplier && (
                <Text style={styles.itemSupplier}>Beszállító: {item.supplier}</Text>
              )}
              {item.barcode && (
                <Text style={styles.itemBarcode}>Vonalkód: {item.barcode}</Text>
              )}

              <View style={styles.itemStats}>
                <View style={styles.itemStatBlock}>
                  <Text style={styles.itemStatLabel}>Készlet</Text>
                  <Text style={[styles.itemStatValue, isLowStock && styles.itemStatValueWarning]}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={styles.itemStatBlock}>
                  <Text style={styles.itemStatLabel}>Min. készlet</Text>
                  <Text style={styles.itemStatValue}>{item.minQuantity} {item.unit}</Text>
                </View>
                <View style={styles.itemStatBlock}>
                  <Text style={styles.itemStatLabel}>Egységár</Text>
                  <Text style={styles.itemStatValue}>{item.price.toLocaleString('hu-HU')} Ft</Text>
                </View>
              </View>

              <View style={styles.itemButtons}>
                <TouchableOpacity
                  style={[styles.itemButton, styles.useButton]}
                  onPress={() => handleUseItem(item)}
                  disabled={item.quantity === 0}
                >
                  <Minus size={16} color="#fff" />
                  <Text style={styles.itemButtonText}>Felhasznál</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.itemButton, styles.restockButton]}
                  onPress={() => handleRestockItem(item)}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.itemButtonText}>Feltölt</Text>
                </TouchableOpacity>
                {item.barcode && (
                  <TouchableOpacity
                    style={[styles.itemButton, styles.scanButton]}
                    onPress={() => {
                      setCameraAction('use');
                      setCameraQuantity('1');
                      setCameraModalVisible(true);
                    }}
                  >
                    <Camera size={16} color="#fff" />
                    <Text style={styles.itemButtonText}>Szkennelés</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isLowStock && (
                <View style={styles.warningTag}>
                  <AlertTriangle size={14} color="#F59E0B" />
                  <Text style={styles.warningTagText}>Alacsony készlet!</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Termék szerkesztése' : 'Új termék'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Név *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Termék neve"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Kategória *</Text>
                <View style={styles.categorySelect}>
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryOption,
                        formData.category === key && styles.categoryOptionActive,
                        formData.category === key && { backgroundColor: categoryColors[key as Inventory['category']] }
                      ]}
                      onPress={() => setFormData({ ...formData, category: key as Inventory['category'] })}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.category === key && styles.categoryOptionTextActive
                      ]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Mennyiség *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.quantity}
                    onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Egység *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.unit}
                    onChangeText={(text) => setFormData({ ...formData, unit: text })}
                    placeholder="db, ml, g"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Min. készlet *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.minQuantity}
                    onChangeText={(text) => setFormData({ ...formData, minQuantity: text })}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Egységár (Ft) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Beszállító</Text>
                <TextInput
                  style={styles.input}
                  value={formData.supplier}
                  onChangeText={(text) => setFormData({ ...formData, supplier: text })}
                  placeholder="Beszállító neve"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Vonalkód</Text>
                <TextInput
                  style={styles.input}
                  value={formData.barcode}
                  onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                  placeholder="Vonalkód (opcionális)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveItem}
              >
                <Text style={styles.saveButtonText}>Mentés</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Restock Modal */}
      <Modal
        visible={restockModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setRestockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.restockModal}>
            <Text style={styles.restockTitle}>Készlet feltöltése</Text>
            <Text style={styles.restockSubtitle}>{restockingItem?.name}</Text>
            
            <View style={styles.restockInfo}>
              <Text style={styles.restockInfoText}>
                Jelenlegi készlet: {restockingItem?.quantity} {restockingItem?.unit}
              </Text>
            </View>

            <TextInput
              style={styles.restockInput}
              value={restockQuantity}
              onChangeText={setRestockQuantity}
              placeholder="Mennyiség"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />

            <View style={styles.restockButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRestockModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleConfirmRestock}
              >
                <Text style={styles.saveButtonText}>Feltölt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barcode Action Modal */}
      <Modal
        visible={barcodeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setBarcodeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.barcodeModal}>
            <Text style={styles.barcodeModalTitle}>
              {barcodeAction === 'restock' ? 'Vonalkód feltöltés' : 'Vonalkód felhasználás'}
            </Text>
            <Text style={styles.barcodeModalSubtitle}>
              {barcodeAction === 'restock' 
                ? 'Írd be a vonalkódot a készlet feltöltéséhez'
                : 'Írd be a vonalkódot a felhasználáshoz'
              }
            </Text>
            
            <View style={styles.barcodeInputGroup}>
              <Text style={styles.barcodeInputLabel}>Vonalkód</Text>
              <TextInput
                style={styles.barcodeInputField}
                value={barcodeInput}
                onChangeText={setBarcodeInput}
                placeholder="Vonalkód"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>

            <View style={styles.barcodeInputGroup}>
              <Text style={styles.barcodeInputLabel}>Mennyiség</Text>
              <TextInput
                style={styles.barcodeInputField}
                value={barcodeQuantity}
                onChangeText={setBarcodeQuantity}
                placeholder="Mennyiség"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.barcodeModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBarcodeModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  barcodeAction === 'restock' ? styles.saveButton : styles.useButton
                ]}
                onPress={handleBarcodeSubmit}
              >
                <Text style={styles.saveButtonText}>
                  {barcodeAction === 'restock' ? 'Feltölt' : 'Felhasznál'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Camera Quantity Modal */}
      <Modal
        visible={cameraModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCameraModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cameraModal}>
            <Text style={styles.cameraModalTitle}>
              {cameraAction === 'restock' ? 'Kamerás feltöltés' : 'Kamerás felhasználás'}
            </Text>
            <Text style={styles.cameraModalSubtitle}>
              Add meg a mennyiséget, majd nyomd meg a szkennelés gombot.
            </Text>
            
            <View style={styles.cameraInputGroup}>
              <Text style={styles.cameraInputLabel}>Mennyiség</Text>
              <TextInput
                style={styles.cameraInputField}
                value={cameraQuantity}
                onChangeText={setCameraQuantity}
                placeholder="Mennyiség"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>

            <View style={styles.cameraModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCameraModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  cameraAction === 'restock' ? styles.saveButton : styles.useButton
                ]}
                onPress={handleCameraSubmit}
              >
                <Text style={styles.saveButtonText}>Szkennelés indítása</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: -8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#8B4B6B',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  filterTextActive: {
    color: '#fff',
  },
  itemsList: {
    flex: 1,
    padding: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500' as const,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
  itemCardWarning: {
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600' as const,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  itemSupplier: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  itemStatBlock: {
    flex: 1,
    alignItems: 'center',
  },
  itemStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  itemStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  itemStatValueWarning: {
    color: '#F59E0B',
  },
  itemButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  useButton: {
    backgroundColor: '#6B7280',
  },
  restockButton: {
    backgroundColor: '#10B981',
  },
  scanButton: {
    backgroundColor: '#8B5CF6',
    minWidth: 100,
  },
  itemButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  warningTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  warningTagText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600' as const,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B4B6B',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  categorySelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryOptionActive: {
    backgroundColor: '#8B4B6B',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#8B4B6B',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restockModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  restockTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  restockSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  restockInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  restockInfoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  restockInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  restockButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  barcodeActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  barcodeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  restockBarcodeButton: {
    backgroundColor: '#10B981',
  },
  useBarcodeButton: {
    backgroundColor: '#6B7280',
  },
  cameraBarcodeButton: {
    backgroundColor: '#8B5CF6',
  },
  barcodeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  itemBarcode: {
    fontSize: 12,
    color: '#8B5CF6',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  barcodeModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  barcodeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  barcodeModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  barcodeInputGroup: {
    marginBottom: 16,
  },
  barcodeInputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
    marginBottom: 8,
  },
  barcodeInputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  barcodeModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cameraModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  cameraModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  cameraModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  cameraInputGroup: {
    marginBottom: 16,
  },
  cameraInputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
    marginBottom: 8,
  },
  cameraInputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  cameraModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  refreshButtonActive: {
    backgroundColor: '#FDF2F8',
  },
  refreshText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
});
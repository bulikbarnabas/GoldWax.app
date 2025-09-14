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
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  ShoppingBag,
  Edit2,
  Trash2,
  X,
  User,
  Star,
} from 'lucide-react-native';
import { useClients, useClientStats } from '@/hooks/use-clients';
import { Client } from '@/types/salon';

export default function ClientsScreen() {
  const { clients, addClient, updateClient, deleteClient, searchClients, getTopClients } = useClients();
  const stats = useClientStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showTopClients, setShowTopClients] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const filteredClients = useMemo(() => {
    if (showTopClients) {
      return getTopClients(10);
    }
    return searchQuery ? searchClients(searchQuery) : clients;
  }, [searchQuery, clients, searchClients, getTopClients, showTopClients]);

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setModalVisible(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
    });
    setModalVisible(true);
  };

  const handleSaveClient = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Hiba', 'A név és telefonszám megadása kötelező!');
      return;
    }

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    
    setModalVisible(false);
    setFormData({ name: '', phone: '', email: '', notes: '' });
  };

  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Törlés megerősítése',
      `Biztosan törölni szeretnéd ${client.name} ügyfelet?`,
      [
        { text: 'Mégse', style: 'cancel' },
        { 
          text: 'Törlés', 
          style: 'destructive',
          onPress: () => deleteClient(client.id)
        },
      ]
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Még nem járt itt';
    return new Date(date).toLocaleDateString('hu-HU');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <User size={20} color="#8B4B6B" />
            <Text style={styles.statValue}>{stats.totalClients}</Text>
            <Text style={styles.statLabel}>Összes ügyfél</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#10B981" />
            <Text style={styles.statValue}>
              {Math.round(stats.avgSpentPerClient).toLocaleString('hu-HU')} Ft
            </Text>
            <Text style={styles.statLabel}>Átlag költés</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.newClientsThisMonth}</Text>
            <Text style={styles.statLabel}>Új (hónap)</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Keresés név vagy telefon alapján..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, !showTopClients && styles.filterButtonActive]}
            onPress={() => setShowTopClients(false)}
          >
            <Text style={[styles.filterText, !showTopClients && styles.filterTextActive]}>
              Összes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showTopClients && styles.filterButtonActive]}
            onPress={() => setShowTopClients(true)}
          >
            <Star size={16} color={showTopClients ? '#fff' : '#6B7280'} />
            <Text style={[styles.filterText, showTopClients && styles.filterTextActive]}>
              Top 10
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.clientsList} showsVerticalScrollIndicator={false}>
        {filteredClients.map((client) => (
          <TouchableOpacity
            key={client.id}
            style={styles.clientCard}
            onPress={() => handleEditClient(client)}
            activeOpacity={0.7}
          >
            <View style={styles.clientHeader}>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientInitial}>
                  {client.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <View style={styles.clientContact}>
                  <Phone size={14} color="#6B7280" />
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                  {client.email && (
                    <>
                      <Mail size={14} color="#6B7280" style={{ marginLeft: 12 }} />
                      <Text style={styles.clientEmail}>{client.email}</Text>
                    </>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteClient(client)}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.clientStats}>
              <View style={styles.clientStatItem}>
                <ShoppingBag size={16} color="#8B4B6B" />
                <Text style={styles.clientStatText}>{client.visitCount} látogatás</Text>
              </View>
              <View style={styles.clientStatItem}>
                <DollarSign size={16} color="#10B981" />
                <Text style={styles.clientStatText}>
                  {client.totalSpent.toLocaleString('hu-HU')} Ft
                </Text>
              </View>
              <View style={styles.clientStatItem}>
                <Calendar size={16} color="#3B82F6" />
                <Text style={styles.clientStatText}>{formatDate(client.lastVisit)}</Text>
              </View>
            </View>

            {client.notes && (
              <Text style={styles.clientNotes} numberOfLines={2}>
                {client.notes}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddClient}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

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
                {editingClient ? 'Ügyfél szerkesztése' : 'Új ügyfél'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Név *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ügyfél neve"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Telefonszám *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+36 30 123 4567"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="pelda@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Megjegyzések</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Egyéb információk..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveClient}
              >
                <Text style={styles.saveButtonText}>Mentés</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterButtonActive: {
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
  clientsList: {
    flex: 1,
    padding: 20,
  },
  clientCard: {
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
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8B4B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientInitial: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#8B4B6B',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  clientContact: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  clientPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  clientEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  clientStats: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  clientStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  clientNotes: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic' as const,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
});
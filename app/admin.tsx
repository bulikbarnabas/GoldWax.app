import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/types/salon';
import { UserPlus, Edit2, Trash2, X, Check, Settings, Users, Wrench } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AdminScreen() {
  const { user, users, addUser, updateUser, deleteUser } = useAuth();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    role: 'employee' as 'admin' | 'employee'
  });
  const [isLoading, setIsLoading] = useState(false);

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccess}>
          <Text style={styles.noAccessText}>Csak adminisztrátorok férhetnek hozzá ehhez az oldalhoz!</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Vissza</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.pin) {
      Alert.alert('Hiba', 'Minden mező kitöltése kötelező!');
      return;
    }

    if (formData.pin.length !== 4) {
      Alert.alert('Hiba', 'A PIN kód 4 számjegyű kell legyen!');
      return;
    }

    setIsLoading(true);
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      pin: formData.pin,
      role: formData.role
    };

    const success = await addUser(newUser);
    setIsLoading(false);

    if (success) {
      setShowAddModal(false);
      resetForm();
      Alert.alert('Siker', 'Felhasználó sikeresen hozzáadva!');
    } else {
      Alert.alert('Hiba', 'Ez az email cím már használatban van!');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!formData.name || !formData.email || !formData.pin) {
      Alert.alert('Hiba', 'Minden mező kitöltése kötelező!');
      return;
    }

    if (formData.pin.length !== 4) {
      Alert.alert('Hiba', 'A PIN kód 4 számjegyű kell legyen!');
      return;
    }

    setIsLoading(true);
    const success = await updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      pin: formData.pin,
      role: formData.role
    });
    setIsLoading(false);

    if (success) {
      setEditingUser(null);
      resetForm();
      Alert.alert('Siker', 'Felhasználó sikeresen módosítva!');
    } else {
      Alert.alert('Hiba', 'Nem sikerült módosítani a felhasználót!');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Törlés megerősítése',
      `Biztosan törölni szeretné ${userName} felhasználót?`,
      [
        { text: 'Mégse', style: 'cancel' },
        {
          text: 'Törlés',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(userId);
            if (success) {
              Alert.alert('Siker', 'Felhasználó sikeresen törölve!');
            } else {
              Alert.alert('Hiba', 'Nem törölheti saját magát vagy nem sikerült a törlés!');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      pin: '',
      role: 'employee'
    });
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      pin: userToEdit.pin,
      role: userToEdit.role
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <UserPlus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Új felhasználó</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adminMenu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/service-management')}
        >
          <View style={styles.menuIconContainer}>
            <Wrench size={24} color="#8B4B6B" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Szolgáltatások kezelése</Text>
            <Text style={styles.menuSubtitle}>Árak, kategóriák szerkesztése</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/reports')}
        >
          <View style={styles.menuIconContainer}>
            <Settings size={24} color="#8B4B6B" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Jelentések</Text>
            <Text style={styles.menuSubtitle}>Bevételek, statisztikák</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Users size={20} color="#666" />
        <Text style={styles.sectionTitle}>Felhasználók</Text>
      </View>
      
      <ScrollView style={styles.usersList}>
        {users.map((u) => (
          <View key={u.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <View style={[styles.roleBadge, u.role === 'admin' && styles.adminBadge]}>
                <Text style={styles.roleText}>
                  {u.role === 'admin' ? 'Admin' : 'Dolgozó'}
                </Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(u)}
              >
                <Edit2 size={18} color="#666" />
              </TouchableOpacity>
              {u.id !== user?.id && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteUser(u.id, u.name)}
                >
                  <Trash2 size={18} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showAddModal || editingUser !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Felhasználó szerkesztése' : 'Új felhasználó'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Név"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="PIN kód (4 számjegy)"
              value={formData.pin}
              onChangeText={(text) => setFormData({ ...formData, pin: text })}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              editable={!isLoading}
            />

            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === 'employee' && styles.roleOptionActive
                ]}
                onPress={() => setFormData({ ...formData, role: 'employee' })}
                disabled={isLoading}
              >
                <Text style={[
                  styles.roleOptionText,
                  formData.role === 'employee' && styles.roleOptionTextActive
                ]}>
                  Dolgozó
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === 'admin' && styles.roleOptionActive
                ]}
                onPress={() => setFormData({ ...formData, role: 'admin' })}
                disabled={isLoading}
              >
                <Text style={[
                  styles.roleOptionText,
                  formData.role === 'admin' && styles.roleOptionTextActive
                ]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={editingUser ? handleUpdateUser : handleAddUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {editingUser ? 'Módosítás' : 'Hozzáadás'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600' as const,
  },
  adminMenu: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginLeft: 8,
  },
  usersList: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  adminBadge: {
    backgroundColor: '#FFE0B2',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#666',
  },
  userActions: {
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
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
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
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  roleOptionText: {
    color: '#666',
    fontWeight: '600' as const,
  },
  roleOptionTextActive: {
    color: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
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
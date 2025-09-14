import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Palette,
  Database,
  Printer
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const settingsSections = [
    {
      title: 'Általános',
      items: [
        {
          icon: Bell,
          label: 'Értesítések',
          value: notifications,
          type: 'switch' as const,
          onToggle: setNotifications,
        },
        {
          icon: Moon,
          label: 'Sötét mód',
          value: darkMode,
          type: 'switch' as const,
          onToggle: setDarkMode,
        },
        {
          icon: Globe,
          label: 'Nyelv',
          value: 'Magyar',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Nyelv', 'Jelenleg csak magyar nyelv érhető el'),
        },
        {
          icon: Palette,
          label: 'Téma színe',
          value: 'Alapértelmezett',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Téma', 'Téma testreszabás hamarosan!'),
        },
      ],
    },
    {
      title: 'Adatok és biztonság',
      items: [
        {
          icon: Database,
          label: 'Automatikus mentés',
          value: autoBackup,
          type: 'switch' as const,
          onToggle: setAutoBackup,
        },
        {
          icon: Shield,
          label: 'Adatvédelem',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Adatvédelem', 'Az adatai biztonságban vannak'),
        },
        {
          icon: Database,
          label: 'Adatok exportálása',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Export', 'Adatok exportálása CSV formátumban'),
        },
      ],
    },
    {
      title: 'Nyomtatás',
      items: [
        {
          icon: Printer,
          label: 'Nyomtató beállítások',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Nyomtató', 'Nyomtató konfigurálása'),
        },
        {
          icon: Printer,
          label: 'Nyugta sablon',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Sablon', 'Nyugta sablon testreszabása'),
        },
      ],
    },
    {
      title: 'Támogatás',
      items: [
        {
          icon: HelpCircle,
          label: 'Súgó',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Súgó', 'Gyakran ismételt kérdések'),
        },
        {
          icon: Info,
          label: 'Névjegy',
          value: 'v1.0.0',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Gyantaszalon App', 'Verzió: 1.0.0\n© 2024 Minden jog fenntartva'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Beállítások</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem
                  ]}
                  onPress={item.type === 'navigation' ? item.onPress : undefined}
                  activeOpacity={item.type === 'navigation' ? 0.7 : 1}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <item.icon size={20} color="#6B7280" />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.type === 'switch' ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#D1D5DB', true: '#E8B4B8' }}
                        thumbColor={item.value ? '#8B4B6B' : '#F3F4F6'}
                        ios_backgroundColor="#D1D5DB"
                      />
                    ) : (
                      <>
                        {item.value && (
                          <Text style={styles.settingValue}>{item.value}</Text>
                        )}
                        <ChevronRight size={20} color="#9CA3AF" />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Adatok törlése</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Gyantaszalon Management System</Text>
          <Text style={styles.footerVersion}>Verzió 1.0.0</Text>
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
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerButton: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#DC2626',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
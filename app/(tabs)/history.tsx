import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar, Clock, DollarSign, User } from 'lucide-react-native';

const HISTORY_DATA = [
  {
    id: '1',
    date: '2024-01-15',
    time: '14:30',
    services: ['Női hajvágás', 'Hajfestés'],
    total: 20500,
    client: 'Kiss Anna',
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '10:00',
    services: ['Manikűr', 'Gél lakk'],
    total: 11000,
    client: 'Nagy Eszter',
  },
  {
    id: '3',
    date: '2024-01-14',
    time: '16:45',
    services: ['Férfi hajvágás'],
    total: 5500,
    client: 'Kovács Péter',
  },
  {
    id: '4',
    date: '2024-01-14',
    time: '13:00',
    services: ['Arckezelés', 'Smink'],
    total: 17000,
    client: 'Szabó Júlia',
  },
  {
    id: '5',
    date: '2024-01-13',
    time: '11:30',
    services: ['Svéd masszázs'],
    total: 11000,
    client: 'Tóth Márta',
  },
];

export default function HistoryScreen() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Ma';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Tegnap';
    } else {
      return date.toLocaleDateString('hu-HU', { 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('hu-HU')} Ft`;
  };

  const groupedHistory = HISTORY_DATA.reduce((acc, item) => {
    const date = formatDate(item.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof HISTORY_DATA>);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Előzmények</Text>
        <Text style={styles.subtitle}>Korábbi tranzakciók</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>47</Text>
          <Text style={styles.statLabel}>Mai tranzakció</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>285</Text>
          <Text style={styles.statLabel}>Heti tranzakció</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>1,234</Text>
          <Text style={styles.statLabel}>Havi tranzakció</Text>
        </View>
      </View>

      {Object.entries(groupedHistory).map(([date, items]) => (
        <View key={date} style={styles.dateSection}>
          <Text style={styles.dateHeader}>{date}</Text>
          {items.map(item => (
            <TouchableOpacity key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeContainer}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <DollarSign size={14} color="#10B981" />
                  <Text style={styles.price}>{formatPrice(item.total)}</Text>
                </View>
              </View>
              
              <View style={styles.clientContainer}>
                <User size={14} color="#FF1493" />
                <Text style={styles.clientName}>{item.client}</Text>
              </View>
              
              <View style={styles.servicesContainer}>
                {item.services.map((service, index) => (
                  <View key={index} style={styles.serviceBadge}>
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Camera, Share2, Instagram, Facebook, MessageCircle, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface SocialShareProps {
  visible: boolean;
  onClose: () => void;
  serviceCompleted?: string;
  clientName?: string;
}

export default function SocialShare({ visible, onClose, serviceCompleted, clientName }: SocialShareProps) {
  const [sharing, setSharing] = useState(false);

  const shareContent = async (platform: string) => {
    setSharing(true);
    
    const message = serviceCompleted 
      ? `✨ ${clientName || 'Vendégünk'} épp most készült el a ${serviceCompleted} kezeléssel a GoldWax szalonban! 💅\n\n📍 Időpont nélkül is fogadjuk!\n#GoldWax #Szépségszalon #Budapest`
      : `✨ Látogass el a GoldWax szalonba! Időpont nélkül is fogadjuk! 💅\n\n📍 Budapest, Arany János u. 10.\n#GoldWax #Szépségszalon #Budapest`;

    try {
      if (platform === 'native') {
        await Share.share({
          message,
          title: 'GoldWax Szépségszalon',
        });
      } else {
        // Platform-specifikus linkek (ezek csak példák)
        const urls: Record<string, string> = {
          instagram: `https://www.instagram.com/`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=https://goldwax.hu&quote=${encodeURIComponent(message)}`,
          whatsapp: `whatsapp://send?text=${encodeURIComponent(message)}`,
        };
        
        Alert.alert(
          'Megosztás',
          `A tartalom vágólapra másolva! Nyissa meg a ${platform} alkalmazást a megosztáshoz.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Hiba', 'Nem sikerült megosztani a tartalmat');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Megosztás</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {serviceCompleted 
              ? 'Ossza meg vendége élményét a közösségi médiában!'
              : 'Ossza meg szalonunkat ismerőseivel!'}
          </Text>

          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.instagramButton]}
              onPress={() => shareContent('instagram')}
              disabled={sharing}
            >
              <Instagram size={24} color="#fff" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => shareContent('facebook')}
              disabled={sharing}
            >
              <Facebook size={24} color="#fff" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.whatsappButton]}
              onPress={() => shareContent('whatsapp')}
              disabled={sharing}
            >
              <MessageCircle size={24} color="#fff" />
              <Text style={styles.socialButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.shareButton]}
              onPress={() => shareContent('native')}
              disabled={sharing}
            >
              <Share2 size={24} color="#fff" />
              <Text style={styles.socialButtonText}>Más</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoButton}>
              <Camera size={20} color={Colors.primary} />
              <Text style={styles.photoButtonText}>Fotó készítése</Text>
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              Készítsen fotót a kész munkáról a megosztáshoz
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  shareButton: {
    backgroundColor: Colors.primary,
  },
  photoSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  photoHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
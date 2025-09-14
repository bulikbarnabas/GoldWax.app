import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInventory } from '@/hooks/use-inventory';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scanAreaSize = width * 0.7;
  const { action, quantity } = useLocalSearchParams<{ action: 'restock' | 'use'; quantity: string }>();
  const { findItemByBarcode, restockByBarcode, useItemByBarcode: consumeItemByBarcode } = useInventory();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' && !permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Vonalkód szkenner</Text>
          <Text style={styles.permissionText}>
            A vonalkód szkenner funkció csak mobileszközökön érhető el.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={() => router.back()}>
            <Text style={styles.permissionButtonText}>Vissza</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('Vonalkód beolvasva:', data);
    
    const item = findItemByBarcode(data);
    if (!item) {
      Alert.alert(
        'Termék nem található',
        'Nem található termék ezzel a vonalkóddal.',
        [
          {
            text: 'Újra próbálom',
            onPress: () => setScanned(false)
          },
          {
            text: 'Bezárás',
            onPress: () => router.back()
          }
        ]
      );
      return;
    }

    const quantityNum = parseInt(quantity || '1');
    let success = false;
    
    if (action === 'restock') {
      const result = restockByBarcode(data, quantityNum);
      success = !!result;
    } else {
      success = consumeItemByBarcode(data, quantityNum);
    }

    if (success) {
      Alert.alert(
        'Sikeres művelet',
        `${item.name}: ${action === 'restock' ? 'Feltöltve' : 'Felhasználva'} ${quantityNum} ${item.unit}`,
        [
          {
            text: 'Újabb szkennelés',
            onPress: () => setScanned(false)
          },
          {
            text: 'Kész',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      Alert.alert(
        'Hiba',
        action === 'use' ? 'Nincs elegendő készlet!' : 'Ismeretlen hiba történt!',
        [
          {
            text: 'Újra próbálom',
            onPress: () => setScanned(false)
          },
          {
            text: 'Bezárás',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch(current => !current);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Kamera engedély betöltése...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Kamera hozzáférés szükséges</Text>
          <Text style={styles.permissionText}>
            A vonalkód olvasáshoz engedélyezned kell a kamera használatát.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Engedélyezés</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {action === 'restock' ? 'Vonalkód feltöltés' : 'Vonalkód felhasználás'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          enableTorch={torch}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'aztec',
              'ean13',
              'ean8',
              'qr',
              'pdf417',
              'upc_e',
              'datamatrix',
              'code128',
              'code39',
              'code93',
              'codabar',
              'itf14',
              'upc_a',
            ],
          }}
        >
          <View style={styles.overlay}>
            <View style={[styles.scanArea, { width: scanAreaSize, height: scanAreaSize }]}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>
          Helyezd a vonalkódot a keretbe
        </Text>
        <Text style={styles.instructionText}>
          {action === 'restock' 
            ? `Készlet feltöltése: ${quantity || '1'} darab`
            : `Felhasználás: ${quantity || '1'} darab`
          }
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleTorch} style={styles.controlButton}>
          {torch ? (
            <FlashlightOff size={24} color="#fff" />
          ) : (
            <Flashlight size={24} color="#fff" />
          )}
          <Text style={styles.controlText}>
            {torch ? 'Lámpa ki' : 'Lámpa be'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleCameraFacing} style={styles.controlButton}>
          <RotateCcw size={24} color="#fff" />
          <Text style={styles.controlText}>Fordítás</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#8B4B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#8B4B6B',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  controlText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
});
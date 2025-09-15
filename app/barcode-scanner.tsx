import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Flashlight, FlashlightOff, RotateCcw, Keyboard, Camera } from 'lucide-react-native';
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
  const [manualInput, setManualInput] = useState('');
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>(Platform.OS === 'web' ? 'manual' : 'camera');

  useEffect(() => {
    if (Platform.OS !== 'web' && !permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);



  const processBarcode = (data: string) => {
    if (!data?.trim() || data.length > 100) {
      Alert.alert('Hiba', 'Érvénytelen vonalkód!');
      return;
    }
    
    const sanitizedData = data.trim();
    console.log('Vonalkód feldolgozása:', sanitizedData);
    
    const item = findItemByBarcode(sanitizedData);
    if (!item) {
      Alert.alert(
        'Termék nem található',
        'Nem található termék ezzel a vonalkóddal.',
        [
          {
            text: 'Újra próbálom',
            onPress: () => {
              setScanned(false);
              setManualInput('');
            }
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
      const result = restockByBarcode(sanitizedData, quantityNum);
      success = !!result;
    } else {
      success = consumeItemByBarcode(sanitizedData, quantityNum);
    }

    if (success) {
      Alert.alert(
        'Sikeres művelet',
        `${item.name}: ${action === 'restock' ? 'Feltöltve' : 'Felhasználva'} ${quantityNum} ${item.unit}`,
        [
          {
            text: 'Újabb szkennelés',
            onPress: () => {
              setScanned(false);
              setManualInput('');
            }
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
            onPress: () => {
              setScanned(false);
              setManualInput('');
            }
          },
          {
            text: 'Bezárás',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    processBarcode(data);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      Alert.alert('Hiba', 'Kérlek add meg a vonalkódot!');
      return;
    }
    processBarcode(manualInput.trim());
  };

  const toggleInputMode = () => {
    setInputMode(current => current === 'camera' ? 'manual' : 'camera');
    setScanned(false);
    setManualInput('');
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch(current => !current);
  };

  if (inputMode === 'camera' && Platform.OS !== 'web') {
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
            <TouchableOpacity 
              style={[styles.permissionButton, { backgroundColor: '#6B7280', marginTop: 12 }]} 
              onPress={toggleInputMode}
            >
              <Text style={styles.permissionButtonText}>Kézi bevitel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
  }

  if (inputMode === 'manual' || Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.header, { backgroundColor: '#8B4B6B' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {action === 'restock' ? 'Vonalkód feltöltés' : 'Vonalkód felhasználás'}
            </Text>
            {!Platform.select({ web: true, default: false }) && (
              <TouchableOpacity onPress={toggleInputMode} style={styles.closeButton}>
                <Camera size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {Platform.select({ web: true, default: false }) && <View style={styles.headerSpacer} />}
          </View>

          <View style={styles.manualContainer}>
            <View style={styles.manualContent}>
              <Text style={styles.manualTitle}>
                Vonalkód megadása
              </Text>
              <Text style={styles.manualSubtitle}>
                {action === 'restock' 
                  ? `Készlet feltöltése: ${quantity || '1'} darab`
                  : `Felhasználás: ${quantity || '1'} darab`
                }
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.barcodeInput}
                  value={manualInput}
                  onChangeText={setManualInput}
                  placeholder="Vonalkód beírása vagy beillesztése"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleManualSubmit}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.submitButton, !manualInput.trim() && styles.submitButtonDisabled]} 
                onPress={handleManualSubmit}
                disabled={!manualInput.trim()}
              >
                <Text style={styles.submitButtonText}>Feldolgozás</Text>
              </TouchableOpacity>
              
              {!Platform.select({ web: true, default: false }) && (
                <TouchableOpacity style={styles.switchModeButton} onPress={toggleInputMode}>
                  <Camera size={20} color="#8B4B6B" />
                  <Text style={styles.switchModeText}>Váltás kamerára</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
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
        <TouchableOpacity onPress={toggleInputMode} style={styles.closeButton}>
          <Keyboard size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        {Platform.select({ web: true, default: false }) ? (
          <View style={styles.webCameraFallback}>
            <Text style={styles.webCameraText}>Kamera nem elérhető weben</Text>
            <TouchableOpacity style={styles.webSwitchButton} onPress={toggleInputMode}>
              <Text style={styles.webSwitchButtonText}>Kézi bevitel használata</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>
          {Platform.select({ web: 'Használd a kézi bevitelt', default: 'Helyezd a vonalkódot a keretbe' })}
        </Text>
        <Text style={styles.instructionText}>
          {action === 'restock' 
            ? `Készlet feltöltése: ${quantity || '1'} darab`
            : `Felhasználás: ${quantity || '1'} darab`
          }
        </Text>
      </View>

      {!Platform.select({ web: true, default: false }) && (
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
      )}
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
  manualContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  manualContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  manualSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  barcodeInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#8B4B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  switchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  switchModeText: {
    fontSize: 16,
    color: '#8B4B6B',
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  webCameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  webCameraText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  webSwitchButton: {
    backgroundColor: '#8B4B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  webSwitchButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
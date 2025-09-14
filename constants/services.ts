import { Service, ServiceCategory } from '@/types/salon';

export const serviceCategories: ServiceCategory[] = [
  { id: 'women-intimate', name: 'Női intim kezelések', icon: '💎' },
  { id: 'women-body', name: 'Női testrészek', icon: '🌸' },
  { id: 'women-face', name: 'Női arc kezelések', icon: '✨' },
  { id: 'men-intimate', name: 'Férfi intim kezelések', icon: '👨' },
  { id: 'men-body', name: 'Férfi testrészek', icon: '💪' },
  { id: 'men-face', name: 'Férfi arc kezelések', icon: '🧔' },
  { id: 'packages-women', name: 'Női csomagok', icon: '🎁' },
  { id: 'packages-men', name: 'Férfi csomagok', icon: '📦' },
];

export const services: Service[] = [
  // Női intim kezelések
  { id: '1', name: 'Intim Hollywood / Brazil', category: serviceCategories[0], price: 8500, duration: 20 },
  { id: '2', name: 'Intim csak elől', category: serviceCategories[0], price: 7500, duration: 20 },
  { id: '3', name: 'Intim részleges', category: serviceCategories[0], price: 7800, duration: 20 },
  { id: '4', name: 'Bikini vonal', category: serviceCategories[0], price: 4900, duration: 15 },
  { id: '5', name: 'Bikinivonal vastag', category: serviceCategories[0], price: 5900, duration: 20 },
  { id: '6', name: 'Fenék teljes (belső, külső ív)', category: serviceCategories[0], price: 5500, duration: 15 },
  { id: '7', name: 'Fenék belső ív', category: serviceCategories[0], price: 3200, duration: 10 },
  { id: '8', name: 'Fenék külső ív I. (arpofák)', category: serviceCategories[0], price: 4300, duration: 10 },
  { id: '9', name: 'Fenék külső ív II. (fél fenék)', category: serviceCategories[0], price: 3200, duration: 10 },

  // Női testrészek
  { id: '10', name: 'Hascsík / köldökcsík', category: serviceCategories[1], price: 2200, duration: 15 },
  { id: '11', name: 'Has teljes', category: serviceCategories[1], price: 3300, duration: 15 },
  { id: '12', name: 'Hónalj', category: serviceCategories[1], price: 3200, duration: 10 },
  { id: '13', name: 'Mellbimbó', category: serviceCategories[1], price: 2000, duration: 5 },
  { id: '14', name: 'Hát teljes', category: serviceCategories[1], price: 4300, duration: 25 },
  { id: '15', name: 'Deréktáj', category: serviceCategories[1], price: 2800, duration: 10 },
  { id: '16', name: 'Felső hát', category: serviceCategories[1], price: 4000, duration: 15 },
  { id: '17', name: 'Nyak', category: serviceCategories[1], price: 2400, duration: 10 },
  { id: '18', name: 'Dekoltázs', category: serviceCategories[1], price: 3400, duration: 15 },
  { id: '19', name: 'Tarkó', category: serviceCategories[1], price: 2200, duration: 5 },
  { id: '25', name: 'Kar könyékig / Alkar', category: serviceCategories[1], price: 4000, duration: 15 },
  { id: '26', name: 'Kar 3/4', category: serviceCategories[1], price: 4200, duration: 15 },
  { id: '27', name: 'Felkar', category: serviceCategories[1], price: 4000, duration: 15 },
  { id: '28', name: 'Kar teljes', category: serviceCategories[1], price: 5000, duration: 20 },
  { id: '29', name: 'Kézfej + kézujjak', category: serviceCategories[1], price: 2100, duration: 5 },
  { id: '30', name: 'Comb', category: serviceCategories[1], price: 5200, duration: 25 },
  { id: '31', name: 'Lábszár', category: serviceCategories[1], price: 5200, duration: 20 },
  { id: '32', name: 'Láb teljes', category: serviceCategories[1], price: 8000, duration: 35 },
  { id: '33', name: 'Láb 3/4', category: serviceCategories[1], price: 7500, duration: 30 },
  { id: '34', name: 'Lábfej + lábujjak', category: serviceCategories[1], price: 2300, duration: 5 },
  { id: '35', name: 'Részleges terület', category: serviceCategories[1], price: 2300, duration: 5 },

  // Női arc kezelések
  { id: '20', name: 'Bajusz', category: serviceCategories[2], price: 2600, duration: 10 },
  { id: '21', name: 'Szemöldök', category: serviceCategories[2], price: 2500, duration: 15 },
  { id: '22', name: 'Áll', category: serviceCategories[2], price: 2500, duration: 10 },
  { id: '23', name: 'Pajesz', category: serviceCategories[2], price: 2500, duration: 10 },
  { id: '24', name: 'Arc 2 oldala', category: serviceCategories[2], price: 2800, duration: 10 },

  // Férfi intim kezelések
  { id: '70', name: 'Férfi intim teljes', category: serviceCategories[3], price: 9500, duration: 30 },
  { id: '71', name: 'Férfi intim részleges', category: serviceCategories[3], price: 7500, duration: 20 },
  { id: '72', name: 'Férfi fenék teljes', category: serviceCategories[3], price: 6500, duration: 20 },

  // Férfi testrészek
  { id: '36', name: 'Kar könyékig / Alkar', category: serviceCategories[4], price: 5000, duration: 20 },
  { id: '37', name: 'Kar 3/4', category: serviceCategories[4], price: 5200, duration: 25 },
  { id: '38', name: 'Felkar', category: serviceCategories[4], price: 5000, duration: 20 },
  { id: '39', name: 'Kar teljes', category: serviceCategories[4], price: 6000, duration: 25 },
  { id: '40', name: 'Kézfej + kézujjak', category: serviceCategories[4], price: 2500, duration: 10 },
  { id: '41', name: 'Comb', category: serviceCategories[4], price: 5500, duration: 30 },
  { id: '42', name: 'Lábszár', category: serviceCategories[4], price: 5500, duration: 35 },
  { id: '43', name: 'Láb teljes', category: serviceCategories[4], price: 9600, duration: 40 },
  { id: '44', name: 'Láb 3/4', category: serviceCategories[4], price: 9000, duration: 35 },
  { id: '45', name: 'Lábfej + lábujjak', category: serviceCategories[4], price: 2700, duration: 10 },
  { id: '46', name: 'Részleges terület', category: serviceCategories[4], price: 2600, duration: 10 },
  { id: '47', name: 'Has teljes', category: serviceCategories[4], price: 4300, duration: 20 },
  { id: '48', name: 'Hónalj', category: serviceCategories[4], price: 3200, duration: 15 },
  { id: '49', name: 'Hát teljes', category: serviceCategories[4], price: 8900, duration: 25 },
  { id: '50', name: 'Deréktáj', category: serviceCategories[4], price: 3900, duration: 20 },
  { id: '51', name: 'Felső hát', category: serviceCategories[4], price: 5800, duration: 20 },
  { id: '52', name: 'Mellkas', category: serviceCategories[4], price: 6500, duration: 25 },
  { id: '55', name: 'Nyak és váll', category: serviceCategories[4], price: 5200, duration: 15 },

  // Férfi arc kezelések
  { id: '53', name: 'Szemöldök', category: serviceCategories[5], price: 2900, duration: 20 },
  { id: '54', name: 'Tarkó', category: serviceCategories[5], price: 2600, duration: 10 },
  { id: '73', name: 'Bajusz', category: serviceCategories[5], price: 3000, duration: 15 },
  { id: '74', name: 'Szakáll kontúr', category: serviceCategories[5], price: 3500, duration: 20 },
  { id: '75', name: 'Orr szőrzet', category: serviceCategories[5], price: 2200, duration: 10 },

  // Női csomagok
  { id: '56', name: 'Intim csomag', category: serviceCategories[6], price: 11000, duration: 35, description: 'Intim Hollywood / Brazil + Hónalj' },
  { id: '57', name: 'Végtag csomag', category: serviceCategories[6], price: 12200, duration: 50, description: 'Teljes Kar + Teljes Láb' },
  { id: '58', name: 'Teljes test csomag', category: serviceCategories[6], price: 31500, duration: 90, description: 'Intim Hollywood / Brazil + Hónalj + Hascsík + Fél fenék + Teljes Láb + Teljes Kar + Szemöldök + Bajusz' },
  { id: '59', name: 'Arc csomag', category: serviceCategories[6], price: 7000, duration: 30, description: 'Szemöldök + Bajusz + Áll' },
  { id: '60', name: 'Kedvenc csomag', category: serviceCategories[6], price: 18500, duration: 60, description: 'Intim Hollywood / Brazil + Fél fenék + Teljes Láb' },
  { id: '61', name: 'Alapcsomag', category: serviceCategories[6], price: 15300, duration: 60, description: 'Teljes láb + Bikini vonal + Hónalj' },
  { id: '62', name: 'Gyors csomag', category: serviceCategories[6], price: 17000, duration: 50, description: 'Alkar + Lábszár + Intim Hollywood / Brazil' },

  // Férfi csomagok
  { id: '63', name: 'Felsőtest csomag', category: serviceCategories[7], price: 22100, duration: 90, description: 'Teljes hát + Mellkas + Has + Hónalj' },
  { id: '64', name: 'Hát csomag', category: serviceCategories[7], price: 15000, duration: 60, description: 'Teljes hát + Szemöldök + Hónalj' },
  { id: '76', name: 'Végtag csomag', category: serviceCategories[7], price: 14500, duration: 65, description: 'Teljes Kar + Teljes Láb' },
  { id: '77', name: 'Arc csomag', category: serviceCategories[7], price: 8500, duration: 45, description: 'Szemöldök + Bajusz + Szakáll kontúr + Tarkó' },
];
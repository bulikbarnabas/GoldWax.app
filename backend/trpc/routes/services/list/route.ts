import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

// Mock szolgáltatások adatbázis helyett
const mockServices = [
  {
    id: '1',
    name: 'Női hajvágás',
    category: 'Fodrászat',
    price: 8000,
    duration: 60,
    description: 'Professzionális női hajvágás mosással és szárítással',
  },
  {
    id: '2',
    name: 'Férfi hajvágás',
    category: 'Fodrászat',
    price: 5000,
    duration: 30,
    description: 'Modern férfi hajvágás',
  },
  {
    id: '3',
    name: 'Hajfestés',
    category: 'Fodrászat',
    price: 12000,
    duration: 120,
    description: 'Teljes hajfestés professzionális termékekkel',
  },
  {
    id: '4',
    name: 'Manikűr',
    category: 'Körmök',
    price: 4500,
    duration: 45,
    description: 'Klasszikus manikűr kezelés',
  },
  {
    id: '5',
    name: 'Gél lakk',
    category: 'Körmök',
    price: 6000,
    duration: 60,
    description: 'Tartós gél lakk több száz színből választható',
  },
];

export default publicProcedure
  .input(
    z.object({
      category: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => {
    let services = [...mockServices];
    
    if (input?.category) {
      services = services.filter(s => s.category === input.category);
    }
    
    return {
      services,
      categories: ['Fodrászat', 'Körmök', 'Kozmetika', 'Masszázs'],
      total: services.length,
    };
  });
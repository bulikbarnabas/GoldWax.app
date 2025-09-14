export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface Customer {
  name: string;
  phone?: string;
  email?: string;
}

export interface Payment {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  timestamp: Date;
  receiptNumber: string;
  employeeId: string;
  employeeName: string;
}

export interface Transaction {
  id: string;
  services: CartItem[];
  total: number;
  date: Date;
  paymentMethod: 'cash' | 'card';
  employeeId: string;
  employeeName: string;
  clientId?: string;
  clientName?: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: Date;
  notes?: string;
  createdAt: Date;
  lastVisit?: Date;
  totalSpent: number;
  visitCount: number;
  favoriteServices?: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
}

export interface Inventory {
  id: string;
  name: string;
  category: 'wax' | 'oil' | 'cream' | 'tool' | 'other';
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier?: string;
  lastRestocked?: Date;
  barcode?: string;
}

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
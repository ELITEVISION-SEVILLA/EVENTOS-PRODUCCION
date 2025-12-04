
export type PaymentType = 'Cooperativa' | 'Factura' | 'Alta Seg. Social' | 'Plantilla' | 'Empresa' | 'Autonomo' | 'Unknown';

export interface TechnicianShift {
  id: string;
  eventId: string;
  role: string; // e.g., 'Camara', 'Jefe Tecnico'
  personName: string;
  dni: string;
  socialSecurity: boolean; // Alta Seg. Social
  agreedSalary: number; // Base salary
  paymentType: PaymentType;
  schedule: 'Completa' | 'Media';
  notes?: string; // e.g., Invoice numbers, extra costs
  invoiceNumber?: string;
  totalInvoiceAmount?: number; // The final amount if different from salary (e.g. +VAT or extras)
  
  // New fields for Social Security dates
  socialSecurityStartDate?: string;
  socialSecurityEndDate?: string;
}

export interface ProductionEvent {
  id: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD
  shifts: TechnicianShift[];
}

export interface StaffMember {
  id: string;
  firstName: string; // Nombre
  lastName: string;  // Apellidos
  dni: string;
  socialSecurityNumber?: string; // S.S.
  phone?: string;
  role: string; // Puesto
  bankAccount?: string; // Nº Cuenta (IBAN)
  email?: string;
  province?: string; // Provincia
  paymentType: PaymentType; // Estado (Autonomo/Alta -> map to PaymentType)
  notes?: string; // Observaciones
  defaultRole?: string; // Legacy support
  defaultPaymentType?: PaymentType; // Legacy support
}

export type UserRole = 'ADMIN' | 'COORDINATOR';

export interface AppUser {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed.
  name: string;
  role: UserRole;
}

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

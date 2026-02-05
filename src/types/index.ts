// User Roles
export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'hospital' | 'laboratory' | 'dental' | 'cosmetic' | 'admin';

// Syrian Governorates
export const SYRIAN_GOVERNORATES = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'إدلب',
  'درعا',
  'السويداء',
  'القنيطرة',
  'دير الزور',
  'الرقة',
  'الحسكة',
] as const;

export type SyrianGovernorate = typeof SYRIAN_GOVERNORATES[number];

// Medical Specializations
export const MEDICAL_SPECIALIZATIONS = [
  'طب عام',
  'طب أطفال',
  'طب نسائية وتوليد',
  'طب باطنية',
  'طب قلب وأوعية',
  'طب عظام',
  'طب أعصاب',
  'طب جلدية',
  'طب عيون',
  'طب أنف وأذن وحنجرة',
  'طب أسنان',
  'طب نفسي',
  'جراحة عامة',
  'تجميل',
  'مسالك بولية',
  'أشعة',
  'تحاليل مخبرية',
] as const;

export type MedicalSpecialization = typeof MEDICAL_SPECIALIZATIONS[number];

// User interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  birthDate?: Date;
  gender?: 'male' | 'female';
  bloodType?: string;
  chronicDiseases?: string[];
}

export interface Provider extends User {
  role: 'doctor' | 'pharmacist' | 'hospital' | 'laboratory';
  licenseNumber: string;
  specialization: MedicalSpecialization;
  governorate: SyrianGovernorate;
  address: string;
  bio?: string;
  consultationFee?: number;
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  workingHours?: WorkingHours;
}

export interface WorkingHours {
  sunday?: DaySchedule;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  start?: string;
  end?: string;
}

// Appointment
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  providerId: string;
  providerName: string;
  providerSpecialization: MedicalSpecialization;
  date: Date;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
}

// Medical Records
export type RecordType = 'report' | 'prescription' | 'xray' | 'labResult';

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId?: string;
  providerName?: string;
  type: RecordType;
  title: string;
  description?: string;
  fileUrl?: string;
  createdAt: Date;
}

// Auth types
export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  // Patient fields
  birthDate?: string;
  gender?: 'male' | 'female';
  // Provider fields
  licenseNumber?: string;
  specialization?: MedicalSpecialization;
  governorate?: SyrianGovernorate;
  address?: string;
  facilityName?: string;
}

// Service card for homepage
export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

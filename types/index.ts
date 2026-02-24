// ============================================================================
// User Roles & Authentication Types
// ============================================================================

export type UserRole = 'admin' | 'landlord' | 'agent' | 'tenant';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  // Role-specific fields
  landlordId?: string; // For tenants and agents
  agentId?: string; // For assigned properties
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
}

// ============================================================================
// Property Types
// ============================================================================

export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance' | 'inactive';
export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial';

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: PropertyType;
  status: PropertyStatus;
  
  // Property Details
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt?: number;
  
  // Financial
  monthlyRent: number;
  depositAmount: number;
  
  // Media
  images: string[];
  featuredImage?: string;
  
  // Relationships
  landlordId: string;
  agentId?: string;
  currentTenantId?: string;
  
  // Amenities
  amenities: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  listedAt?: string;
}

// ============================================================================
// Tenant Types
// ============================================================================

export type TenantStatus = 'active' | 'inactive' | 'pending' | 'evicted';

export interface Tenant {
  id: string;
  userId: string;
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Employment
  employer?: string;
  employmentStatus?: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired';
  monthlyIncome?: number;
  
  // Current Rental
  currentPropertyId?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  
  // Status
  status: TenantStatus;
  creditScore?: number;
  backgroundCheckStatus?: 'pending' | 'passed' | 'failed';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Lease Types
// ============================================================================

export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'pending';

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  
  // Dates
  startDate: string;
  endDate: string;
  
  // Financial
  monthlyRent: number;
  depositAmount: number;
  lateFeeAmount: number;
  
  // Terms
  paymentDueDay: number; // Day of month rent is due
  gracePeriodDays: number;
  
  // Status
  status: LeaseStatus;
  
  // Documents
  documents?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  terminatedAt?: string;
  terminationReason?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'failed';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'money_order' | 'online';
export type PaymentType = 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'other';

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  leaseId?: string;
  
  // Payment Details
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  
  // Period
  paymentForMonth: number; // 1-12
  paymentForYear: number;
  
  // Dates
  dueDate: string;
  paidDate?: string;
  
  // Reference
  transactionId?: string;
  checkNumber?: string;
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  recordedBy?: string;
}

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  id: string;
  userId: string;
  
  // Profile
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  
  // Relationships
  landlordId?: string; // If working under a landlord
  assignedPropertyIds: string[];
  
  // Performance
  commissionRate?: number;
  totalDealsClosed?: number;
  
  // Status
  status: 'active' | 'inactive' | 'pending';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Lead/Application Types
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'viewing_scheduled' | 'application_submitted' | 'approved' | 'rejected' | 'converted';

export interface Lead {
  id: string;
  propertyId?: string;
  agentId?: string;
  
  // Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Inquiry
  message?: string;
  preferredMoveInDate?: string;
  budget?: number;
  
  // Status
  status: LeadStatus;
  source: 'website' | 'referral' | 'social_media' | 'walk_in' | 'other';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ============================================================================
// Maintenance Types
// ============================================================================

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus = 'reported' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  
  // Issue
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'cosmetic' | 'other';
  priority: MaintenancePriority;
  
  // Status
  status: MaintenanceStatus;
  assignedTo?: string;
  
  // Dates
  reportedAt: string;
  scheduledFor?: string;
  completedAt?: string;
  
  // Cost
  estimatedCost?: number;
  actualCost?: number;
  
  // Media
  images?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceUnits: number;
  monthlyIncome: number;
  outstandingRent: number;
  totalTenants: number;
  activeLeases: number;
  expiringLeasesCount: number;
}

export interface AgentDashboardStats {
  assignedProperties: number;
  activeLeads: number;
  convertedLeads: number;
  pendingApplications: number;
  recentInquiries: Lead[];
}

export interface TenantDashboardStats {
  currentProperty?: Property;
  lease?: Lease;
  upcomingPayments: Payment[];
  paymentHistory: Payment[];
  maintenanceRequests: MaintenanceRequest[];
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  logo?: string;
}

export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType;
  city?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  searchQuery?: string;
}

export interface TenantFilters {
  status?: TenantStatus;
  searchQuery?: string;
  propertyId?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  type?: PaymentType;
  tenantId?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
}

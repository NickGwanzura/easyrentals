// ============================================================================
// EasyRentals Estate Management Types
// ============================================================================

// ============================================================================
// Estate
// ============================================================================

export interface Estate {
  id: string;
  name: string;
  address: string;
  city: string;
  province?: string;
  zipCode?: string;
  country: string;
  description?: string;
  
  // Manager
  managerId?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  
  // Details
  totalUnits: number;
  hasBlocks: boolean;
  
  // Service Providers
  securityCompany?: string;
  securityContact?: string;
  maintenanceCompany?: string;
  maintenanceContact?: string;
  
  // Financial
  defaultLevyAmount: number;
  levyDueDay: number;
  
  // Bank
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  
  // Status
  status: 'active' | 'inactive' | 'under_construction';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// Estate Block
// ============================================================================

export interface EstateBlock {
  id: string;
  estateId: string;
  blockName: string;
  blockCode?: string;
  description?: string;
  totalUnits: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Estate Unit
// ============================================================================

export type EstateUnitType = 'apartment' | 'house' | 'townhouse' | 'duplex' | 'penthouse' | 'studio' | 'other';
export type EstateUnitStatus = 'occupied' | 'vacant' | 'owner_occupied' | 'under_maintenance';

export interface EstateUnit {
  id: string;
  estateId: string;
  blockId?: string;
  blockName?: string; // For display
  
  // Identification
  unitNumber: string;
  unitType: EstateUnitType;
  
  // Details
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  parkingSpaces: number;
  
  // Owner
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAddress?: string;
  
  // Tenant
  tenantId?: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  
  // Rental Link
  rentalPropertyId?: string;
  
  // Financial
  levyAmount?: number;
  outstandingLevy: number;
  
  // Status
  status: EstateUnitStatus;
  
  // Dates
  purchaseDate?: string;
  occupancyDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Estate Levy
// ============================================================================

export type LevyStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'ecocash' | 'onemoney' | 'zipit' | 'cheque' | 'online';

export interface EstateLevy {
  id: string;
  estateId: string;
  unitId: string;
  unitNumber?: string; // For display
  estateName?: string; // For display
  
  // Period
  month: number;
  year: number;
  
  // Financial
  levyAmount: number;
  paidAmount: number;
  balance: number;
  
  // Status
  status: LevyStatus;
  
  // Due Date
  dueDate: string;
  
  // Payment
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// ============================================================================
// Move In
// ============================================================================

export interface EstateMoveIn {
  id: string;
  estateId: string;
  unitId: string;
  estateName?: string; // For display
  unitNumber?: string; // For display
  
  // Resident
  residentName: string;
  residentPhone?: string;
  residentEmail?: string;
  residentIdNumber?: string;
  
  // Move In Details
  moveInDate: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  
  // Financial
  depositPaid: number;
  depositAmount: number;
  firstMonthLevyPaid: boolean;
  
  // Checklist
  keysIssued: boolean;
  keysIssuedDate?: string;
  accessCardsIssued: number;
  
  inspectionCompleted: boolean;
  inspectionDate?: string;
  inspectionNotes?: string;
  
  documentsSigned: boolean;
  documentsSignedDate?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Vehicle
  vehicleRegistration?: string;
  vehicleMakeModel?: string;
  vehicleColor?: string;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// Move Out
// ============================================================================

export type MoveOutStatus = 'pending' | 'completed' | 'cancelled';

export interface EstateMoveOut {
  id: string;
  estateId: string;
  unitId: string;
  moveInId?: string;
  estateName?: string; // For display
  unitNumber?: string; // For display
  
  // Resident
  residentName: string;
  
  // Notice
  noticeDate?: string;
  noticePeriodDays: number;
  
  // Dates
  moveOutDate: string;
  actualMoveOutDate?: string;
  
  // Checklist
  keysReturned: boolean;
  keysReturnedDate?: string;
  accessCardsReturned: number;
  
  finalInspectionCompleted: boolean;
  finalInspectionDate?: string;
  finalInspectionNotes?: string;
  
  // Damage
  damagesRecorded: boolean;
  damageDescription?: string;
  damageCharges: number;
  
  // Cleaning
  cleaningRequired: boolean;
  cleaningCharges: number;
  
  // Financial
  outstandingRent: number;
  outstandingLevies: number;
  otherCharges: number;
  totalDeductions: number;
  
  // Deposit
  depositRefunded: boolean;
  depositRefundAmount: number;
  depositRefundDate?: string;
  depositRefundMethod?: string;
  
  // Forwarding
  forwardingAddress?: string;
  
  // Notes
  notes?: string;
  
  // Status
  status: MoveOutStatus;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// Estate Amenity
// ============================================================================

export interface EstateAmenity {
  id: string;
  estateId: string;
  amenityName: string;
  description?: string;
  isPaid: boolean;
  additionalCost: number;
  createdAt: string;
}

// ============================================================================
// Estate Document
// ============================================================================

export type EstateDocumentType = 'title_deed' | 'zoning_certificate' | 'building_plan' | 'insurance' | 'contract' | 'other';

export interface EstateDocument {
  id: string;
  estateId: string;
  documentType: EstateDocumentType;
  documentName: string;
  documentUrl: string;
  description?: string;
  createdAt: string;
  uploadedBy?: string;
}

// ============================================================================
// Dashboard Summary
// ============================================================================

export interface EstateDashboardSummary {
  estateId: string;
  estateName: string;
  
  // Units
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  ownerOccupiedUnits: number;
  occupancyRate: number;
  
  // Financial
  monthlyLeviesCollected: number;
  outstandingLevies: number;
  
  // Maintenance
  openRepairs: number;
  
  // Recent Activity
  recentMoveIns: number;
  recentMoveOuts: number;
}

// ============================================================================
// Filters
// ============================================================================

export interface EstateFilters {
  city?: string;
  status?: Estate['status'];
  managerId?: string;
}

export interface EstateUnitFilters {
  estateId?: string;
  blockId?: string;
  status?: EstateUnitStatus;
  unitType?: EstateUnitType;
  searchQuery?: string;
}

export interface LevyFilters {
  estateId?: string;
  unitId?: string;
  status?: LevyStatus;
  month?: number;
  year?: number;
}

// ============================================================================
// Reports
// ============================================================================

export interface MonthlyLevyReport {
  estateId: string;
  estateName: string;
  month: number;
  year: number;
  
  totalUnits: number;
  unitsPaid: number;
  unitsOutstanding: number;
  
  totalLevies: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

export interface OccupancyReport {
  estateId: string;
  estateName: string;
  generatedAt: string;
  
  totalUnits: number;
  vacantUnits: number;
  occupiedUnits: number;
  ownerOccupiedUnits: number;
  
  vacancyRate: number;
  occupancyRate: number;
  
  vacantUnitsList: {
    unitId: string;
    unitNumber: string;
    daysVacant: number;
  }[];
}

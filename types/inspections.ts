// ============================================================================
// EasyRentals House Inspections Types
// ============================================================================

// ============================================================================
// Enums
// ============================================================================

export type InspectionType = 'routine' | 'move_in' | 'move_out' | 'final' | 'safety' | 'emergency';
export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type ChecklistItemStatus = 'good' | 'fair' | 'poor' | 'not_applicable' | 'not_inspected';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueStatus = 'pending' | 'in_progress' | 'resolved' | 'deferred';
export type ScheduleFrequency = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
export type PhotoType = 'before' | 'during' | 'after' | 'issue' | 'general';
export type ReportType = 'summary' | 'full' | 'tenant' | 'landlord' | 'insurance';

// ============================================================================
// Core Inspection Types
// ============================================================================

export interface Inspection {
  id: string;
  
  // Type & Context
  inspectionType: InspectionType;
  propertyId?: string;
  estateId?: string;
  estateUnitId?: string;
  tenantId?: string;
  leaseId?: string;
  
  // Scheduling
  scheduledDate: string;
  scheduledTime?: string;
  completedDate?: string;
  
  // Inspector
  inspectorName?: string;
  inspectorId?: string;
  
  // Status & Rating
  status: InspectionStatus;
  overallCondition?: ConditionRating;
  
  // Notes
  generalNotes?: string;
  landlordNotified: boolean;
  tenantNotified: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  
  // Related data (populated on fetch)
  property?: {
    id: string;
    title: string;
    address: string;
  };
  estateUnit?: {
    id: string;
    unitNumber: string;
    estateName: string;
  };
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  responses?: InspectionResponse[];
  issues?: InspectionIssue[];
  photos?: InspectionPhoto[];
}

// ============================================================================
// Checklist Types
// ============================================================================

export interface InspectionCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isDefault: boolean;
}

export interface ChecklistItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  isCritical: boolean;
  isDefault: boolean;
  displayOrder: number;
}

export interface InspectionResponse {
  id: string;
  inspectionId: string;
  checklistItemId: string;
  
  // Response
  status: ChecklistItemStatus;
  conditionNotes?: string;
  requiresMaintenance: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Populated data
  checklistItem?: ChecklistItem;
}

// ============================================================================
// Photo Types
// ============================================================================

export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  checklistResponseId?: string;
  
  // File details
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  
  // Metadata
  caption?: string;
  photoType: PhotoType;
  takenBy?: string;
  takenAt: string;
  categoryId?: string;
  
  createdAt: string;
}

// ============================================================================
// Issue Types
// ============================================================================

export interface InspectionIssue {
  id: string;
  inspectionId: string;
  checklistResponseId?: string;
  
  // Issue details
  title: string;
  description: string;
  category?: string;
  priority: IssuePriority;
  
  // Status
  status: IssueStatus;
  
  // Resolution
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  
  // Cost
  estimatedCost?: number;
  actualCost?: number;
  
  // References
  maintenanceRequestId?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface InspectionSchedule {
  id: string;
  
  // Property/Unit
  propertyId?: string;
  estateUnitId?: string;
  
  // Schedule
  frequency: ScheduleFrequency;
  intervalValue: number;
  startDate: string;
  nextInspectionDate: string;
  endDate?: string;
  
  // Inspector
  defaultInspectorId?: string;
  
  // Settings
  isActive: boolean;
  notifyLandlord: boolean;
  notifyTenant: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  
  // Populated data
  property?: {
    id: string;
    title: string;
    address: string;
  };
  estateUnit?: {
    id: string;
    unitNumber: string;
    estateName: string;
  };
  inspector?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ============================================================================
// Template Types
// ============================================================================

export interface InspectionTemplate {
  id: string;
  name: string;
  description?: string;
  propertyType?: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial';
  isDefault: boolean;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface InspectionReport {
  id: string;
  inspectionId: string;
  
  // Report details
  title: string;
  reportType: ReportType;
  
  // Generated report
  fileUrl?: string;
  generatedAt: string;
  generatedBy?: string;
  
  // Recipients
  sentToTenant: boolean;
  sentToLandlord: boolean;
  sentToInsurance: boolean;
  
  createdAt: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface CreateInspectionForm {
  inspectionType: InspectionType;
  propertyId?: string;
  estateUnitId?: string;
  tenantId?: string;
  leaseId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  inspectorName?: string;
}

export interface UpdateInspectionForm {
  scheduledDate?: string;
  scheduledTime?: string;
  inspectorName?: string;
  status?: InspectionStatus;
  overallCondition?: ConditionRating;
  generalNotes?: string;
  landlordNotified?: boolean;
  tenantNotified?: boolean;
}

export interface CompleteInspectionForm {
  completedDate: string;
  overallCondition: ConditionRating;
  generalNotes?: string;
  responses: {
    checklistItemId: string;
    status: ChecklistItemStatus;
    conditionNotes?: string;
    requiresMaintenance: boolean;
  }[];
}

export interface CreateScheduleForm {
  propertyId?: string;
  estateUnitId?: string;
  frequency: ScheduleFrequency;
  intervalValue: number;
  startDate: string;
  endDate?: string;
  defaultInspectorId?: string;
  notifyLandlord: boolean;
  notifyTenant: boolean;
}

export interface CreateIssueForm {
  inspectionId: string;
  title: string;
  description: string;
  category?: string;
  priority: IssuePriority;
  estimatedCost?: number;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface InspectionFilters {
  type?: InspectionType;
  status?: InspectionStatus;
  propertyId?: string;
  estateId?: string;
  estateUnitId?: string;
  tenantId?: string;
  dateFrom?: string;
  dateTo?: string;
  overallCondition?: ConditionRating;
}

export interface InspectionStats {
  total: number;
  scheduled: number;
  completed: number;
  overdue: number;
  cancelled: number;
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface InspectionFormState {
  step: number;
  inspectionType: InspectionType;
  selectedProperty: string;
  selectedUnit: string;
  selectedTenant: string;
  scheduledDate: string;
  scheduledTime: string;
  inspectorName: string;
  responses: Record<string, {
    status: ChecklistItemStatus;
    notes: string;
    requiresMaintenance: boolean;
  }>;
  generalNotes: string;
  overallCondition: ConditionRating;
  photos: File[];
  isSubmitting: boolean;
}

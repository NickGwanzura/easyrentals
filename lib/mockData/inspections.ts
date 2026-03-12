// ============================================================================
// EasyRentals Inspections Mock Data
// ============================================================================

import { 
  Inspection, 
  InspectionCategory, 
  ChecklistItem, 
  InspectionResponse, 
  InspectionIssue, 
  InspectionSchedule,
  InspectionTemplate,
  InspectionStats
} from '@/types/inspections';

// ============================================================================
// Categories
// ============================================================================

export const demoInspectionCategories: InspectionCategory[] = [
  { id: 'cat-1', name: 'Kitchen', description: 'Kitchen appliances and fixtures', icon: 'Chef', displayOrder: 1, isDefault: true },
  { id: 'cat-2', name: 'Bathroom', description: 'Bathroom fixtures and plumbing', icon: 'Bath', displayOrder: 2, isDefault: true },
  { id: 'cat-3', name: 'Living Areas', description: 'Living room and dining areas', icon: 'Sofa', displayOrder: 3, isDefault: true },
  { id: 'cat-4', name: 'Bedrooms', description: 'Bedroom condition and fixtures', icon: 'Bed', displayOrder: 4, isDefault: true },
  { id: 'cat-5', name: 'Flooring', description: 'Floors, carpets, and tiles', icon: 'Layers', displayOrder: 5, isDefault: true },
  { id: 'cat-6', name: 'Walls & Ceiling', description: 'Wall paint and ceiling condition', icon: 'Paintbrush', displayOrder: 6, isDefault: true },
  { id: 'cat-7', name: 'Windows & Doors', description: 'Windows, doors, and locks', icon: 'DoorOpen', displayOrder: 7, isDefault: true },
  { id: 'cat-8', name: 'Electrical', description: 'Outlets, switches, and lighting', icon: 'Zap', displayOrder: 8, isDefault: true },
  { id: 'cat-9', name: 'Plumbing', description: 'Pipes, faucets, and water fixtures', icon: 'Droplets', displayOrder: 9, isDefault: true },
  { id: 'cat-10', name: 'Exterior', description: 'Balcony, garden, and exterior areas', icon: 'Sun', displayOrder: 10, isDefault: true },
  { id: 'cat-11', name: 'Appliances', description: 'All included appliances', icon: 'Refrigerator', displayOrder: 11, isDefault: true },
  { id: 'cat-12', name: 'Safety', description: 'Smoke detectors, fire extinguishers', icon: 'Shield', displayOrder: 12, isDefault: true },
];

// ============================================================================
// Checklist Items
// ============================================================================

export const demoChecklistItems: ChecklistItem[] = [
  // Kitchen
  { id: 'item-1', categoryId: 'cat-1', name: 'Sink and faucet', description: 'Check for leaks, proper drainage', isCritical: true, isDefault: true, displayOrder: 1 },
  { id: 'item-2', categoryId: 'cat-1', name: 'Oven/Range', description: 'Check burners, oven function, cleanliness', isCritical: false, isDefault: true, displayOrder: 2 },
  { id: 'item-3', categoryId: 'cat-1', name: 'Refrigerator', description: 'Check cooling, cleanliness', isCritical: false, isDefault: true, displayOrder: 3 },
  { id: 'item-4', categoryId: 'cat-1', name: 'Dishwasher', description: 'Check function and drainage', isCritical: false, isDefault: true, displayOrder: 4 },
  { id: 'item-5', categoryId: 'cat-1', name: 'Microwave', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 5 },
  { id: 'item-6', categoryId: 'cat-1', name: 'Cabinets', description: 'Check doors, handles, condition', isCritical: false, isDefault: true, displayOrder: 6 },
  { id: 'item-7', categoryId: 'cat-1', name: 'Countertops', description: 'Check for damage, stains', isCritical: false, isDefault: true, displayOrder: 7 },
  { id: 'item-8', categoryId: 'cat-1', name: 'Exhaust fan', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 8 },
  
  // Bathroom
  { id: 'item-9', categoryId: 'cat-2', name: 'Toilet', description: 'Check flush, leaks, stability', isCritical: true, isDefault: true, displayOrder: 1 },
  { id: 'item-10', categoryId: 'cat-2', name: 'Sink/Faucet', description: 'Check for leaks, drainage', isCritical: true, isDefault: true, displayOrder: 2 },
  { id: 'item-11', categoryId: 'cat-2', name: 'Shower/Tub', description: 'Check drainage, leaks, caulking', isCritical: true, isDefault: true, displayOrder: 3 },
  { id: 'item-12', categoryId: 'cat-2', name: 'Mirror/Cabinet', description: 'Check condition', isCritical: false, isDefault: true, displayOrder: 4 },
  { id: 'item-13', categoryId: 'cat-2', name: 'Towel rails', description: 'Check stability', isCritical: false, isDefault: true, displayOrder: 5 },
  { id: 'item-14', categoryId: 'cat-2', name: 'Ventilation', description: 'Check fan function', isCritical: false, isDefault: true, displayOrder: 6 },
  { id: 'item-15', categoryId: 'cat-2', name: 'Tiles', description: 'Check for cracks, missing grout', isCritical: false, isDefault: true, displayOrder: 7 },
  
  // Living Areas
  { id: 'item-16', categoryId: 'cat-3', name: 'Walls', description: 'Check for marks, holes, paint condition', isCritical: false, isDefault: true, displayOrder: 1 },
  { id: 'item-17', categoryId: 'cat-3', name: 'Ceiling', description: 'Check for stains, cracks', isCritical: false, isDefault: true, displayOrder: 2 },
  { id: 'item-18', categoryId: 'cat-3', name: 'Flooring', description: 'Check for damage, wear', isCritical: true, isDefault: true, displayOrder: 3 },
  { id: 'item-19', categoryId: 'cat-3', name: 'Light fixtures', description: 'Check function, bulbs', isCritical: false, isDefault: true, displayOrder: 4 },
  { id: 'item-20', categoryId: 'cat-3', name: 'Outlets', description: 'Check function, cover plates', isCritical: true, isDefault: true, displayOrder: 5 },
  { id: 'item-21', categoryId: 'cat-3', name: 'Windows', description: 'Check operation, locks', isCritical: true, isDefault: true, displayOrder: 6 },
  { id: 'item-22', categoryId: 'cat-3', name: 'Doors', description: 'Check operation, locks', isCritical: true, isDefault: true, displayOrder: 7 },
  
  // Bedrooms
  { id: 'item-23', categoryId: 'cat-4', name: 'Walls/Ceiling', description: 'Check condition', isCritical: false, isDefault: true, displayOrder: 1 },
  { id: 'item-24', categoryId: 'cat-4', name: 'Flooring/Carpet', description: 'Check for wear, stains', isCritical: false, isDefault: true, displayOrder: 2 },
  { id: 'item-25', categoryId: 'cat-4', name: 'Wardrobes', description: 'Check doors, mirrors', isCritical: false, isDefault: true, displayOrder: 3 },
  { id: 'item-26', categoryId: 'cat-4', name: 'Windows', description: 'Check operation, locks', isCritical: true, isDefault: true, displayOrder: 4 },
  { id: 'item-27', categoryId: 'cat-4', name: 'Outlets', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 5 },
  { id: 'item-28', categoryId: 'cat-4', name: 'Light fixtures', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 6 },
  
  // Electrical
  { id: 'item-29', categoryId: 'cat-8', name: 'Power outlets', description: 'Test all outlets', isCritical: true, isDefault: true, displayOrder: 1 },
  { id: 'item-30', categoryId: 'cat-8', name: 'Light switches', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 2 },
  { id: 'item-31', categoryId: 'cat-8', name: 'Ceiling fans', description: 'Check operation', isCritical: false, isDefault: true, displayOrder: 3 },
  { id: 'item-32', categoryId: 'cat-8', name: 'Air conditioning', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 4 },
  { id: 'item-33', categoryId: 'cat-8', name: 'Smoke detectors', description: 'Check batteries, function', isCritical: true, isDefault: true, displayOrder: 5 },
  { id: 'item-34', categoryId: 'cat-8', name: 'Electrical panel', description: 'Check condition', isCritical: true, isDefault: true, displayOrder: 6 },
  
  // Plumbing
  { id: 'item-35', categoryId: 'cat-9', name: 'Water pressure', description: 'Check all fixtures', isCritical: true, isDefault: true, displayOrder: 1 },
  { id: 'item-36', categoryId: 'cat-9', name: 'Drainage', description: 'Check all drains', isCritical: true, isDefault: true, displayOrder: 2 },
  { id: 'item-37', categoryId: 'cat-9', name: 'Hot water system', description: 'Check function', isCritical: true, isDefault: true, displayOrder: 3 },
  { id: 'item-38', categoryId: 'cat-9', name: 'Pipes visible', description: 'Check for leaks', isCritical: true, isDefault: true, displayOrder: 4 },
  { id: 'item-39', categoryId: 'cat-9', name: 'Outdoor taps', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 5 },
  
  // Safety
  { id: 'item-40', categoryId: 'cat-12', name: 'Smoke alarms', description: 'Test and check batteries', isCritical: true, isDefault: true, displayOrder: 1 },
  { id: 'item-41', categoryId: 'cat-12', name: 'Fire extinguisher', description: 'Check expiry, location', isCritical: true, isDefault: true, displayOrder: 2 },
  { id: 'item-42', categoryId: 'cat-12', name: 'Emergency exits', description: 'Check accessibility', isCritical: true, isDefault: true, displayOrder: 3 },
  { id: 'item-43', categoryId: 'cat-12', name: 'Security system', description: 'Check function', isCritical: false, isDefault: true, displayOrder: 4 },
  { id: 'item-44', categoryId: 'cat-12', name: 'Safety switches', description: 'Test RCD/safety switches', isCritical: true, isDefault: true, displayOrder: 5 },
];

// ============================================================================
// Demo Inspections
// ============================================================================

export const demoInspections: Inspection[] = [
  {
    id: 'insp-1',
    inspectionType: 'routine',
    estateUnitId: 'unit-1',
    tenantId: 'tenant-1',
    scheduledDate: '2026-03-15',
    scheduledTime: '10:00',
    inspectorName: 'John Smith',
    status: 'scheduled',
    landlordNotified: true,
    tenantNotified: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    estateUnit: {
      id: 'unit-1',
      unitNumber: 'A101',
      estateName: 'Sunrise Apartments'
    },
    tenant: {
      id: 'tenant-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+263 77 123 4567'
    }
  },
  {
    id: 'insp-2',
    inspectionType: 'routine',
    propertyId: 'prop-1',
    scheduledDate: '2026-03-10',
    scheduledTime: '14:00',
    completedDate: '2026-03-10',
    inspectorName: 'Mike Brown',
    status: 'completed',
    overallCondition: 'good',
    landlordNotified: true,
    tenantNotified: true,
    generalNotes: 'Property in good condition overall. Minor touch-ups needed in bathroom.',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-03-10T15:30:00Z',
    property: {
      id: 'prop-1',
      title: 'Modern Downtown Apartment',
      address: '123 Main Street, Harare'
    }
  },
  {
    id: 'insp-3',
    inspectionType: 'move_in',
    estateUnitId: 'unit-5',
    tenantId: 'tenant-2',
    leaseId: 'lease-1',
    scheduledDate: '2026-03-20',
    scheduledTime: '09:00',
    inspectorName: 'John Smith',
    status: 'scheduled',
    landlordNotified: true,
    tenantNotified: true,
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z',
    estateUnit: {
      id: 'unit-5',
      unitNumber: 'B205',
      estateName: 'Sunrise Apartments'
    },
    tenant: {
      id: 'tenant-2',
      firstName: 'David',
      lastName: 'Moyo',
      email: 'david.m@email.com',
      phone: '+263 77 234 5678'
    }
  },
  {
    id: 'insp-4',
    inspectionType: 'move_out',
    estateUnitId: 'unit-3',
    tenantId: 'tenant-3',
    leaseId: 'lease-2',
    scheduledDate: '2026-03-25',
    scheduledTime: '11:00',
    inspectorName: 'Emily White',
    status: 'scheduled',
    landlordNotified: false,
    tenantNotified: true,
    createdAt: '2026-03-08T10:00:00Z',
    updatedAt: '2026-03-08T10:00:00Z',
    estateUnit: {
      id: 'unit-3',
      unitNumber: 'A303',
      estateName: 'Sunrise Apartments'
    },
    tenant: {
      id: 'tenant-3',
      firstName: 'Grace',
      lastName: 'Ncube',
      email: 'grace.n@email.com',
      phone: '+263 77 345 6789'
    }
  },
  {
    id: 'insp-5',
    inspectionType: 'routine',
    estateUnitId: 'unit-2',
    scheduledDate: '2026-02-15',
    scheduledTime: '10:00',
    completedDate: '2026-02-15',
    inspectorName: 'Mike Brown',
    status: 'completed',
    overallCondition: 'excellent',
    landlordNotified: true,
    tenantNotified: true,
    generalNotes: 'Excellent condition. Unit is well maintained.',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-15T12:00:00Z',
    estateUnit: {
      id: 'unit-2',
      unitNumber: 'A102',
      estateName: 'Sunrise Apartments'
    }
  },
  {
    id: 'insp-6',
    inspectionType: 'safety',
    propertyId: 'prop-2',
    scheduledDate: '2026-04-01',
    scheduledTime: '13:00',
    inspectorName: 'John Smith',
    status: 'scheduled',
    landlordNotified: true,
    tenantNotified: false,
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-10T10:00:00Z',
    property: {
      id: 'prop-2',
      title: 'Commercial Office Space',
      address: '456 Business Ave, Bulawayo'
    }
  },
  {
    id: 'insp-7',
    inspectionType: 'move_out',
    propertyId: 'prop-3',
    tenantId: 'tenant-4',
    scheduledDate: '2026-02-28',
    completedDate: '2026-02-28',
    inspectorName: 'Emily White',
    status: 'completed',
    overallCondition: 'fair',
    landlordNotified: true,
    tenantNotified: true,
    generalNotes: 'Some wear and tear noted. Deposit may need partial retention for repairs.',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
    property: {
      id: 'prop-3',
      title: 'Suburban Family Home',
      address: '789 Maple Drive, Harare'
    },
    tenant: {
      id: 'tenant-4',
      firstName: 'Peter',
      lastName: 'Dube',
      email: 'peter.d@email.com',
      phone: '+263 77 456 7890'
    }
  },
  {
    id: 'insp-8',
    inspectionType: 'routine',
    estateUnitId: 'unit-4',
    scheduledDate: '2026-01-10',
    scheduledTime: '10:00',
    completedDate: '2026-01-10',
    inspectorName: 'Mike Brown',
    status: 'completed',
    overallCondition: 'poor',
    landlordNotified: true,
    tenantNotified: true,
    generalNotes: 'Multiple issues found. Immediate maintenance required.',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
    estateUnit: {
      id: 'unit-4',
      unitNumber: 'A201',
      estateName: 'Sunrise Apartments'
    }
  }
];

// ============================================================================
// Demo Issues
// ============================================================================

export const demoInspectionIssues: InspectionIssue[] = [
  {
    id: 'issue-1',
    inspectionId: 'insp-2',
    title: 'Bathroom tile grout missing',
    description: 'Grout missing between shower wall tiles',
    category: 'Bathroom',
    priority: 'medium',
    status: 'pending',
    estimatedCost: 150,
    createdAt: '2026-03-10T15:00:00Z',
    updatedAt: '2026-03-10T15:00:00Z'
  },
  {
    id: 'issue-2',
    inspectionId: 'insp-4',
    title: 'Living room carpet stain',
    description: 'Large stain on living room carpet near window',
    category: 'Flooring',
    priority: 'low',
    status: 'pending',
    estimatedCost: 200,
    createdAt: '2026-03-08T10:00:00Z',
    updatedAt: '2026-03-08T10:00:00Z'
  },
  {
    id: 'issue-3',
    inspectionId: 'insp-7',
    title: 'Kitchen cabinet door broken',
    description: 'Hinge broken on upper left cabinet door',
    category: 'Kitchen',
    priority: 'medium',
    status: 'resolved',
    resolutionNotes: 'Replaced hinge with new one',
    resolvedBy: 'maintenance-team',
    resolvedAt: '2026-03-05T10:00:00Z',
    estimatedCost: 80,
    actualCost: 65,
    createdAt: '2026-02-28T16:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z'
  },
  {
    id: 'issue-4',
    inspectionId: 'insp-8',
    title: 'Smoke detector not working',
    description: 'Bedroom smoke detector not responding to test button',
    category: 'Safety',
    priority: 'urgent',
    status: 'in_progress',
    estimatedCost: 50,
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'issue-5',
    inspectionId: 'insp-8',
    title: 'AC unit leaking water',
    description: 'Air conditioning unit leaking water onto floor',
    category: 'Electrical',
    priority: 'high',
    status: 'pending',
    estimatedCost: 300,
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z'
  }
];

// ============================================================================
// Demo Schedules
// ============================================================================

export const demoInspectionSchedules: InspectionSchedule[] = [
  {
    id: 'sched-1',
    estateUnitId: 'unit-1',
    frequency: 'quarterly',
    intervalValue: 3,
    startDate: '2026-01-01',
    nextInspectionDate: '2026-04-01',
    defaultInspectorId: 'user-1',
    isActive: true,
    notifyLandlord: true,
    notifyTenant: true,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    estateUnit: {
      id: 'unit-1',
      unitNumber: 'A101',
      estateName: 'Sunrise Apartments'
    }
  },
  {
    id: 'sched-2',
    propertyId: 'prop-1',
    frequency: 'quarterly',
    intervalValue: 3,
    startDate: '2026-01-01',
    nextInspectionDate: '2026-04-01',
    defaultInspectorId: 'user-2',
    isActive: true,
    notifyLandlord: true,
    notifyTenant: true,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    property: {
      id: 'prop-1',
      title: 'Modern Downtown Apartment',
      address: '123 Main Street, Harare'
    }
  },
  {
    id: 'sched-3',
    estateUnitId: 'unit-5',
    frequency: 'monthly',
    intervalValue: 1,
    startDate: '2026-03-01',
    nextInspectionDate: '2026-04-01',
    defaultInspectorId: 'user-1',
    isActive: true,
    notifyLandlord: true,
    notifyTenant: false,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    estateUnit: {
      id: 'unit-5',
      unitNumber: 'B205',
      estateName: 'Sunrise Apartments'
    }
  }
];

// ============================================================================
// Templates
// ============================================================================

export const demoInspectionTemplates: InspectionTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Standard Apartment',
    description: 'Standard inspection template for apartments',
    propertyType: 'apartment',
    isDefault: true,
    categories: ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7', 'cat-8', 'cat-9', 'cat-12'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'tpl-2',
    name: 'Standard House',
    description: 'Standard inspection template for houses',
    propertyType: 'house',
    isDefault: true,
    categories: ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7', 'cat-8', 'cat-9', 'cat-10', 'cat-11', 'cat-12'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'tpl-3',
    name: 'Move-In Inspection',
    description: 'Detailed move-in inspection checklist',
    propertyType: undefined,
    isDefault: true,
    categories: ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7', 'cat-8', 'cat-9', 'cat-11', 'cat-12'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'tpl-4',
    name: 'Move-Out Inspection',
    description: 'Detailed move-out inspection checklist with deposit assessment',
    propertyType: undefined,
    isDefault: true,
    categories: ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6', 'cat-7', 'cat-8', 'cat-9', 'cat-11', 'cat-12'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

export const getInspectionStats = (): InspectionStats => {
  const inspections = demoInspections;
  return {
    total: inspections.length,
    scheduled: inspections.filter(i => i.status === 'scheduled').length,
    completed: inspections.filter(i => i.status === 'completed').length,
    overdue: inspections.filter(i => new Date(i.scheduledDate) < new Date() && i.status === 'scheduled').length,
    cancelled: inspections.filter(i => i.status === 'cancelled').length,
    excellent: inspections.filter(i => i.overallCondition === 'excellent').length,
    good: inspections.filter(i => i.overallCondition === 'good').length,
    fair: inspections.filter(i => i.overallCondition === 'fair').length,
    poor: inspections.filter(i => i.overallCondition === 'poor').length,
    critical: inspections.filter(i => i.overallCondition === 'critical').length,
    totalIssues: demoInspectionIssues.length,
    pendingIssues: demoInspectionIssues.filter(i => i.status === 'pending').length,
    resolvedIssues: demoInspectionIssues.filter(i => i.status === 'resolved').length
  };
};

export const getInspectionsByType = (type: string): Inspection[] => {
  return demoInspections.filter(i => i.inspectionType === type);
};

export const getInspectionsByStatus = (status: string): Inspection[] => {
  return demoInspections.filter(i => i.status === status);
};

export const getUpcomingInspections = (days: number = 7): Inspection[] => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return demoInspections.filter(i => {
    const scheduled = new Date(i.scheduledDate);
    return scheduled >= now && scheduled <= future && i.status === 'scheduled';
  });
};

export const getInspectionById = (id: string): Inspection | undefined => {
  return demoInspections.find(i => i.id === id);
};

export const getIssuesByInspection = (inspectionId: string): InspectionIssue[] => {
  return demoInspectionIssues.filter(i => i.inspectionId === inspectionId);
};

export const getScheduleByProperty = (propertyId: string): InspectionSchedule | undefined => {
  return demoInspectionSchedules.find(s => s.propertyId === propertyId);
};

export const getScheduleByUnit = (unitId: string): InspectionSchedule | undefined => {
  return demoInspectionSchedules.find(s => s.estateUnitId === unitId);
};

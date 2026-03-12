// ============================================================================
// EasyRentals Inspection Service
// ============================================================================
// This service provides functions to interact with the inspections backend
// Uses Supabase for data storage
// ============================================================================

import { 
  Inspection, 
  InspectionSchedule, 
  InspectionResponse,
  InspectionIssue,
  InspectionCategory,
  ChecklistItem,
  CreateInspectionForm,
  UpdateInspectionForm,
  CompleteInspectionForm,
  CreateScheduleForm,
  CreateIssueForm,
  InspectionFilters,
  InspectionStats
} from '@/types/inspections';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// Inspection CRUD Operations
// ============================================================================

export const getInspections = async (filters?: InspectionFilters): Promise<Inspection[]> => {
  try {
    let query = supabase
      .from('inspections')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (filters?.type) {
      query = query.eq('inspection_type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }
    if (filters?.estateUnitId) {
      query = query.eq('estate_unit_id', filters.estateUnitId);
    }
    if (filters?.tenantId) {
      query = query.eq('tenant_id', filters.tenantId);
    }
    if (filters?.dateFrom) {
      query = query.gte('scheduled_date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('scheduled_date', filters.dateTo);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(transformInspectionFromDB) || [];
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
};

export const getInspectionById = async (id: string): Promise<Inspection | null> => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data ? transformInspectionFromDB(data) : null;
  } catch (error) {
    console.error('Error fetching inspection:', error);
    throw error;
  }
};

export const createInspection = async (form: CreateInspectionForm): Promise<Inspection> => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .insert({
        inspection_type: form.inspectionType,
        property_id: form.propertyId || null,
        estate_unit_id: form.estateUnitId || null,
        tenant_id: form.tenantId || null,
        lease_id: form.leaseId || null,
        scheduled_date: form.scheduledDate,
        scheduled_time: form.scheduledTime || null,
        inspector_name: form.inspectorName || null,
        status: 'scheduled',
        landlord_notified: false,
        tenant_notified: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return transformInspectionFromDB(data);
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
};

export const updateInspection = async (id: string, form: UpdateInspectionForm): Promise<Inspection> => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (form.scheduledDate) updateData.scheduled_date = form.scheduledDate;
    if (form.scheduledTime) updateData.scheduled_time = form.scheduledTime;
    if (form.inspectorName) updateData.inspector_name = form.inspectorName;
    if (form.status) updateData.status = form.status;
    if (form.overallCondition) updateData.overall_condition = form.overallCondition;
    if (form.generalNotes !== undefined) updateData.general_notes = form.generalNotes;
    if (form.landlordNotified !== undefined) updateData.landlord_notified = form.landlordNotified;
    if (form.tenantNotified !== undefined) updateData.tenant_notified = form.tenantNotified;

    const { data, error } = await supabase
      .from('inspections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return transformInspectionFromDB(data);
  } catch (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
};

export const completeInspection = async (id: string, form: CompleteInspectionForm): Promise<Inspection> => {
  try {
    // Start transaction
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .update({
        status: 'completed',
        completed_date: form.completedDate,
        overall_condition: form.overallCondition,
        general_notes: form.generalNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (inspectionError) throw inspectionError;

    // Save responses
    for (const response of form.responses) {
      const { error: responseError } = await supabase
        .from('inspection_responses')
        .upsert({
          inspection_id: id,
          checklist_item_id: response.checklistItemId,
          status: response.status,
          condition_notes: response.conditionNotes || null,
          requires_maintenance: response.requiresMaintenance,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'inspection_id,checklist_item_id'
        });
      
      if (responseError) throw responseError;
    }

    return transformInspectionFromDB(inspection);
  } catch (error) {
    console.error('Error completing inspection:', error);
    throw error;
  }
};

export const deleteInspection = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inspections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting inspection:', error);
    throw error;
  }
};

// ============================================================================
// Inspection Schedule Operations
// ============================================================================

export const getInspectionSchedules = async (): Promise<InspectionSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('inspection_schedules')
      .select('*')
      .order('next_inspection_date', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(transformScheduleFromDB) || [];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const createInspectionSchedule = async (form: CreateScheduleForm): Promise<InspectionSchedule> => {
  try {
    const { data, error } = await supabase
      .from('inspection_schedules')
      .insert({
        property_id: form.propertyId || null,
        estate_unit_id: form.estateUnitId || null,
        frequency: form.frequency,
        interval_value: form.intervalValue,
        start_date: form.startDate,
        next_inspection_date: form.startDate,
        end_date: form.endDate || null,
        default_inspector_id: form.defaultInspectorId || null,
        is_active: true,
        notify_landlord: form.notifyLandlord,
        notify_tenant: form.notifyTenant,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return transformScheduleFromDB(data);
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

export const updateInspectionSchedule = async (id: string, updates: Partial<InspectionSchedule>): Promise<InspectionSchedule> => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.notifyLandlord !== undefined) updateData.notify_landlord = updates.notifyLandlord;
    if (updates.notifyTenant !== undefined) updateData.notify_tenant = updates.notifyTenant;
    if (updates.nextInspectionDate) updateData.next_inspection_date = updates.nextInspectionDate;

    const { data, error } = await supabase
      .from('inspection_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return transformScheduleFromDB(data);
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const deleteInspectionSchedule = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inspection_schedules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// ============================================================================
// Inspection Issue Operations
// ============================================================================

export const getInspectionIssues = async (inspectionId: string): Promise<InspectionIssue[]> => {
  try {
    const { data, error } = await supabase
      .from('inspection_issues')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(transformIssueFromDB) || [];
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};

export const createInspectionIssue = async (form: CreateIssueForm): Promise<InspectionIssue> => {
  try {
    const { data, error } = await supabase
      .from('inspection_issues')
      .insert({
        inspection_id: form.inspectionId,
        title: form.title,
        description: form.description,
        category: form.category || null,
        priority: form.priority,
        status: 'pending',
        estimated_cost: form.estimatedCost || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return transformIssueFromDB(data);
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};

export const updateInspectionIssue = async (id: string, updates: Partial<InspectionIssue>): Promise<InspectionIssue> => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.resolutionNotes !== undefined) updateData.resolution_notes = updates.resolutionNotes;
    if (updates.actualCost !== undefined) updateData.actual_cost = updates.actualCost;

    const { data, error } = await supabase
      .from('inspection_issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return transformIssueFromDB(data);
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
};

// ============================================================================
// Checklist Categories & Items
// ============================================================================

export const getInspectionCategories = async (): Promise<InspectionCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('inspection_categories')
      .select('*')
      .order('display_order');
    
    if (error) throw error;
    
    return data?.map(transformCategoryFromDB) || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getChecklistItems = async (categoryId?: string): Promise<ChecklistItem[]> => {
  try {
    let query = supabase
      .from('inspection_checklist_items')
      .select('*')
      .order('display_order');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(transformChecklistItemFromDB) || [];
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    throw error;
  }
};

// ============================================================================
// Statistics
// ============================================================================

export const getInspectionStats = async (): Promise<InspectionStats> => {
  try {
    const { data: inspections, error } = await supabase
      .from('inspections')
      .select('status, overall_condition');
    
    if (error) throw error;

    const { data: issues } = await supabase
      .from('inspection_issues')
      .select('status');

    const stats: InspectionStats = {
      total: inspections?.length || 0,
      scheduled: inspections?.filter(i => i.status === 'scheduled').length || 0,
      completed: inspections?.filter(i => i.status === 'completed').length || 0,
      overdue: 0, // Calculate based on date
      cancelled: inspections?.filter(i => i.status === 'cancelled').length || 0,
      excellent: inspections?.filter(i => i.overall_condition === 'excellent').length || 0,
      good: inspections?.filter(i => i.overall_condition === 'good').length || 0,
      fair: inspections?.filter(i => i.overall_condition === 'fair').length || 0,
      poor: inspections?.filter(i => i.overall_condition === 'poor').length || 0,
      critical: inspections?.filter(i => i.overall_condition === 'critical').length || 0,
      totalIssues: issues?.length || 0,
      pendingIssues: issues?.filter(i => i.status === 'pending').length || 0,
      resolvedIssues: issues?.filter(i => i.status === 'resolved').length || 0
    };

    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// ============================================================================
// Notification Helpers
// ============================================================================

export const sendInspectionNotification = async (
  inspectionId: string,
  type: 'landlord' | 'tenant'
): Promise<void> => {
  try {
    const inspection = await getInspectionById(inspectionId);
    if (!inspection) throw new Error('Inspection not found');

    // In a real app, this would send an email/SMS
    // For now, just update the notification flag
    await updateInspection(inspectionId, {
      [type === 'landlord' ? 'landlordNotified' : 'tenantNotified']: true
    });

    console.log(`Notification sent to ${type} for inspection ${inspectionId}`);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// ============================================================================
// Data Transform Helpers
// ============================================================================

const transformInspectionFromDB = (data: Record<string, unknown>): Inspection => ({
  id: data.id as string,
  inspectionType: data.inspection_type as Inspection['inspectionType'],
  propertyId: data.property_id as string | undefined,
  estateId: data.estate_id as string | undefined,
  estateUnitId: data.estate_unit_id as string | undefined,
  tenantId: data.tenant_id as string | undefined,
  leaseId: data.lease_id as string | undefined,
  scheduledDate: data.scheduled_date as string,
  scheduledTime: data.scheduled_time as string | undefined,
  completedDate: data.completed_date as string | undefined,
  inspectorName: data.inspector_name as string | undefined,
  inspectorId: data.inspector_id as string | undefined,
  status: data.status as Inspection['status'],
  overallCondition: data.overall_condition as Inspection['overallCondition'],
  generalNotes: data.general_notes as string | undefined,
  landlordNotified: data.landlord_notified as boolean,
  tenantNotified: data.tenant_notified as boolean,
  createdAt: data.created_at as string,
  updatedAt: data.updated_at as string,
  createdBy: data.created_by as string | undefined
});

const transformScheduleFromDB = (data: Record<string, unknown>): InspectionSchedule => ({
  id: data.id as string,
  propertyId: data.property_id as string | undefined,
  estateUnitId: data.estate_unit_id as string | undefined,
  frequency: data.frequency as InspectionSchedule['frequency'],
  intervalValue: data.interval_value as number,
  startDate: data.start_date as string,
  nextInspectionDate: data.next_inspection_date as string,
  endDate: data.end_date as string | undefined,
  defaultInspectorId: data.default_inspector_id as string | undefined,
  isActive: data.is_active as boolean,
  notifyLandlord: data.notify_landlord as boolean,
  notifyTenant: data.notify_tenant as boolean,
  createdAt: data.created_at as string,
  updatedAt: data.updated_at as string,
  createdBy: data.created_by as string | undefined
});

const transformIssueFromDB = (data: Record<string, unknown>): InspectionIssue => ({
  id: data.id as string,
  inspectionId: data.inspection_id as string,
  checklistResponseId: data.checklist_response_id as string | undefined,
  title: data.title as string,
  description: data.description as string,
  category: data.category as string | undefined,
  priority: data.priority as InspectionIssue['priority'],
  status: data.status as InspectionIssue['status'],
  resolutionNotes: data.resolution_notes as string | undefined,
  resolvedBy: data.resolved_by as string | undefined,
  resolvedAt: data.resolved_at as string | undefined,
  estimatedCost: data.estimated_cost as number | undefined,
  actualCost: data.actual_cost as number | undefined,
  maintenanceRequestId: data.maintenance_request_id as string | undefined,
  createdAt: data.created_at as string,
  updatedAt: data.updated_at as string
});

const transformCategoryFromDB = (data: Record<string, unknown>): InspectionCategory => ({
  id: data.id as string,
  name: data.name as string,
  description: data.description as string | undefined,
  icon: data.icon as string | undefined,
  displayOrder: data.display_order as number,
  isDefault: data.is_default as boolean
});

const transformChecklistItemFromDB = (data: Record<string, unknown>): ChecklistItem => ({
  id: data.id as string,
  categoryId: data.category_id as string,
  name: data.name as string,
  description: data.description as string | undefined,
  isCritical: data.is_critical as boolean,
  isDefault: data.is_default as boolean,
  displayOrder: data.display_order as number
});

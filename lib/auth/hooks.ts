import { useMemo } from 'react';
import { useAuth } from './context';
import { UserRole, Property, Tenant, Payment, Lead } from '@/types';
import { demoData } from '@/lib/mockData';

// Hook to get role-specific dashboard data
export function useDashboardData() {
  const { user, isDemoMode } = useAuth();
  
  return useMemo(() => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
        return getAdminDashboardData();
      case 'agent':
        return getAgentDashboardData(user.id);
      case 'tenant':
        return getTenantDashboardData(user.id);
      case 'landlord':
        return getLandlordDashboardData(user.id);
      default:
        return null;
    }
  }, [user]);
}

function getAdminDashboardData() {
  const properties = demoData.properties;
  const tenants = demoData.tenants;
  const payments = demoData.payments;
  const leads = demoData.leads;
  
  const occupiedUnits = properties.filter(p => p.status === 'occupied').length;
  const vacantUnits = properties.filter(p => p.status === 'vacant').length;
  const maintenanceUnits = properties.filter(p => p.status === 'maintenance').length;
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = payments
    .filter(p => p.paymentForMonth === currentMonth && p.paymentForYear === currentYear && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const outstandingRent = payments
    .filter(p => p.status === 'overdue' || p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const activeLeases = demoData.leases.filter(l => l.status === 'active').length;
  const expiringLeases = demoData.leases.filter(l => {
    const endDate = new Date(l.endDate);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  });
  
  return {
    stats: {
      totalProperties: properties.length,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      monthlyIncome,
      outstandingRent,
      totalTenants: tenants.filter(t => t.status === 'active').length,
      activeLeases,
      expiringLeasesCount: expiringLeases.length,
    },
    recentPayments: payments.slice(0, 5),
    recentLeads: leads.slice(0, 5),
    expiringLeases,
    occupancyRate: properties.length > 0 ? Math.round((occupiedUnits / properties.length) * 100) : 0,
  };
}

function getAgentDashboardData(userId: string) {
  const agent = demoData.agents.find(a => a.userId === userId);
  if (!agent) return null;
  
  const assignedProperties = demoData.properties.filter(p => 
    agent.assignedPropertyIds.includes(p.id)
  );
  
  const activeLeads = demoData.leads.filter(l => 
    l.agentId === userId && ['new', 'contacted', 'viewing_scheduled'].includes(l.status)
  );
  
  const convertedLeads = demoData.leads.filter(l => 
    l.agentId === userId && l.status === 'converted'
  );
  
  const pendingApplications = demoData.leads.filter(l => 
    l.agentId === userId && l.status === 'application_submitted'
  );
  
  return {
    agent,
    assignedProperties,
    activeLeads,
    convertedLeads,
    pendingApplications,
    stats: {
      assignedProperties: assignedProperties.length,
      activeLeads: activeLeads.length,
      convertedLeads: convertedLeads.length,
      pendingApplications: pendingApplications.length,
    },
  };
}

function getTenantDashboardData(userId: string) {
  const tenant = demoData.tenants.find(t => t.userId === userId);
  if (!tenant) return null;
  
  const currentProperty = tenant.currentPropertyId 
    ? demoData.properties.find(p => p.id === tenant.currentPropertyId)
    : undefined;
  
  const lease = demoData.leases.find(l => 
    l.tenantId === tenant.id && l.status === 'active'
  );
  
  const paymentHistory = demoData.payments.filter(p => p.tenantId === tenant.id);
  
  const upcomingPayments = paymentHistory.filter(p => 
    p.status === 'pending' || p.status === 'overdue'
  );
  
  const maintenanceRequests = demoData.maintenanceRequests.filter(m => 
    m.tenantId === tenant.id
  );
  
  return {
    tenant,
    currentProperty,
    lease,
    paymentHistory,
    upcomingPayments,
    maintenanceRequests,
  };
}

function getLandlordDashboardData(userId: string) {
  const properties = demoData.properties.filter(p => p.landlordId === userId);
  const propertyIds = properties.map(p => p.id);
  
  const tenants = demoData.tenants.filter(t => 
    propertyIds.includes(t.currentPropertyId || '')
  );
  
  const payments = demoData.payments.filter(p => 
    propertyIds.includes(p.propertyId)
  );
  
  const occupiedUnits = properties.filter(p => p.status === 'occupied').length;
  
  const monthlyIncome = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  return {
    properties,
    tenants,
    payments,
    stats: {
      totalProperties: properties.length,
      occupiedUnits,
      vacantUnits: properties.length - occupiedUnits,
      monthlyIncome,
      totalTenants: tenants.length,
    },
  };
}

// Hook to get properties with role-based filtering
export function useProperties() {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return demoData.properties;
      case 'landlord':
        return demoData.properties.filter(p => p.landlordId === user.id);
      case 'agent':
        const agent = demoData.agents.find(a => a.userId === user.id);
        return agent 
          ? demoData.properties.filter(p => agent.assignedPropertyIds.includes(p.id))
          : [];
      case 'tenant':
        const tenant = demoData.tenants.find(t => t.userId === user.id);
        return tenant?.currentPropertyId
          ? demoData.properties.filter(p => p.id === tenant.currentPropertyId)
          : [];
      default:
        return [];
    }
  }, [user]);
}

// Hook to get tenants with role-based filtering
export function useTenants() {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return demoData.tenants;
      case 'landlord':
        const landlordProperties = demoData.properties
          .filter(p => p.landlordId === user.id)
          .map(p => p.id);
        return demoData.tenants.filter(t => 
          landlordProperties.includes(t.currentPropertyId || '')
        );
      case 'agent':
        const agent = demoData.agents.find(a => a.userId === user.id);
        const agentProperties = agent?.assignedPropertyIds || [];
        return demoData.tenants.filter(t => 
          agentProperties.includes(t.currentPropertyId || '')
        );
      case 'tenant':
        return demoData.tenants.filter(t => t.userId === user.id);
      default:
        return [];
    }
  }, [user]);
}

// Hook to get payments with role-based filtering
export function usePayments() {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return demoData.payments;
      case 'landlord':
        const landlordProperties = demoData.properties
          .filter(p => p.landlordId === user.id)
          .map(p => p.id);
        return demoData.payments.filter(p => 
          landlordProperties.includes(p.propertyId)
        );
      case 'agent':
        return []; // Agents typically don't see payment details
      case 'tenant':
        const tenant = demoData.tenants.find(t => t.userId === user.id);
        return tenant 
          ? demoData.payments.filter(p => p.tenantId === tenant.id)
          : [];
      default:
        return [];
    }
  }, [user]);
}

// Hook to check if user can perform action
export function usePermission() {
  const { user, hasRole } = useAuth();
  
  return useMemo(() => ({
    canManageProperties: hasRole(['admin', 'landlord']),
    canManageTenants: hasRole(['admin', 'landlord', 'agent']),
    canViewPayments: hasRole(['admin', 'landlord', 'tenant']),
    canRecordPayments: hasRole(['admin', 'landlord']),
    canManageSettings: hasRole(['admin']),
    canViewAllLeads: hasRole(['admin', 'landlord']),
    canManageLeads: hasRole(['admin', 'landlord', 'agent']),
    canViewReports: hasRole(['admin', 'landlord']),
    canExportData: hasRole(['admin']),
  }), [hasRole]);
}

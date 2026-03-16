'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ActivityCenter, { ActivityItem } from '@/components/dashboard/ActivityCenter';
import OccupancyChart from '@/components/dashboard/OccupancyChart';
import QuickActionsPanel, { QuickActionItem } from '@/components/dashboard/QuickActionsPanel';
import RecentPayments from '@/components/dashboard/RecentPayments';
import RevenueChart from '@/components/dashboard/RevenueChart';
import StatCard from '@/components/dashboard/StatCard';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useDashboardData, useRequireAuth } from '@/lib/auth/context';
import { isAdminDashboardData, usePayments, useProperties, useTenants } from '@/lib/auth/hooks';
import { demoData } from '@/lib/mockData';
import { demoEstateLevies, demoEstateUnits } from '@/lib/mockData/estate-management';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import type { Payment, Property, Tenant, User } from '@/types';
import {
  AlertCircle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  Home,
  Landmark,
  MapPin,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function getDaysUntil(dateValue: string) {
  const diff = new Date(dateValue).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DashboardIntro({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-white via-white to-primary-50/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">{badge}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-white/80 px-4 py-3 text-sm text-slate-600">
          Focus on the action center first, then use quick actions to move through today&apos;s work.
        </div>
      </div>
    </Card>
  );
}

function AdminDashboard() {
  const data = useDashboardData();
  const properties = useProperties();
  const tenants = useTenants();
  const payments = usePayments();
  const adminData = isAdminDashboardData(data) ? data : null;

  const occupancyData = [
    { name: 'Occupied', value: adminData?.stats.occupiedUnits || 0, color: '#22c55e' },
    { name: 'Vacant', value: adminData?.stats.vacantUnits || 0, color: '#3b82f6' },
    { name: 'Maintenance', value: adminData?.stats.maintenanceUnits || 0, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  const activityItems = useMemo<ActivityItem[]>(() => {
    if (!adminData) {
      return [];
    }

    const expiringLeases = adminData.expiringLeases;

    const overduePayments = payments
      .filter((payment) => payment.status === 'overdue')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 2);

    const vacantProperties = properties.filter((property) => property.status === 'vacant').slice(0, 2);

    const levyAlerts = demoEstateLevies
      .filter((levy) => levy.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 1);

    return [
      ...overduePayments.map((payment) => ({
        id: `admin-overdue-${payment.id}`,
        title: `Overdue payment from ${getTenantName(payment.tenantId)}`,
        description: `${getPropertyName(payment.propertyId)} is overdue and needs collections follow-up.`,
        meta: `${formatCurrency(payment.amount)} outstanding`,
        href: '/payments',
        actionLabel: 'Review payment',
        tone: 'overdue' as const,
        icon: CreditCard,
      })),
      ...expiringLeases.slice(0, 2).map((lease) => ({
        id: `admin-lease-${lease.id}`,
        title: `Lease ending for ${getTenantNameByLease(lease.tenantId, tenants)}`,
        description: `${getPropertyName(lease.propertyId)} expires on ${formatDate(lease.endDate)}.`,
        meta: `${getDaysUntil(lease.endDate)} days remaining`,
        href: '/lease-reviews',
        actionLabel: 'Review renewal',
        tone: getDaysUntil(lease.endDate) <= 14 ? ('attention' as const) : ('healthy' as const),
        icon: FileCheck,
      })),
      ...vacantProperties.map((property) => ({
        id: `admin-vacant-${property.id}`,
        title: `${property.title} is vacant`,
        description: 'This unit needs marketing, lead coverage, or onboarding prep.',
        meta: `${property.city}, ${property.state}`,
        href: '/properties',
        actionLabel: 'Open property',
        tone: 'attention' as const,
        icon: Home,
      })),
      ...levyAlerts.map((levy) => ({
        id: `admin-levy-${levy.id}`,
        title: `Levy arrears on Unit ${levy.unitNumber}`,
        description: `${levy.estateName} has an unpaid levy balance that needs follow-up.`,
        meta: `${formatCurrency(levy.balance)} outstanding`,
        href: '/levies',
        actionLabel: 'View levies',
        tone: 'overdue' as const,
        icon: Wallet,
      })),
    ].slice(0, 5);
  }, [adminData, payments, properties, tenants]);

  if (!adminData) return null;

  const { stats, recentPayments, expiringLeases, occupancyRate } = adminData;

  const quickActions: QuickActionItem[] = [
    {
      id: 'admin-record-payment',
      label: 'Record Payment',
      description: 'Capture rent and payment activity quickly.',
      href: '/payments',
      icon: CreditCard,
      toneClass: 'bg-primary-50 text-primary-600',
    },
    {
      id: 'admin-add-tenant',
      label: 'Manage Tenants',
      description: 'Add, review, or update tenant records.',
      href: '/tenants',
      icon: UserPlus,
      toneClass: 'bg-success-50 text-success-600',
    },
    {
      id: 'admin-assign-owner',
      label: 'Assign Owner',
      description: 'Delegate estate-unit ownership and access.',
      href: '/estates/estate-units',
      icon: MapPin,
      toneClass: 'bg-warning-50 text-warning-600',
    },
    {
      id: 'admin-start-inspection',
      label: 'Start Inspection',
      description: 'Open the inspections workflow for a unit or property.',
      href: '/inspections',
      icon: ClipboardCheck,
      toneClass: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardIntro
        badge="Admin View"
        title="Operations Command Center"
        description="See the portfolio issues that need action first, then jump into the workflows that keep occupancy, payments, and estate operations moving."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Properties" value={stats.totalProperties} icon={Building2} iconColor="text-primary-600" iconBgColor="bg-primary-50" />
        <StatCard title="Active Tenants" value={stats.totalTenants} change={5.2} icon={Users} iconColor="text-success-600" iconBgColor="bg-success-50" />
        <StatCard title="Monthly Income" value={formatCurrency(stats.monthlyIncome)} change={8.1} icon={CreditCard} iconColor="text-warning-600" iconBgColor="bg-warning-50" />
        <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} change={2.4} icon={TrendingUp} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActivityCenter items={activityItems} />
        </div>
        <QuickActionsPanel actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <OccupancyChart data={occupancyData} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentPayments payments={recentPayments} />

        <Card>
          <CardHeader title="Upcoming Events" subtitle="Lease renewals and portfolio events that need scheduling." />
          <div className="space-y-3">
            {expiringLeases.slice(0, 4).map((lease) => {
              const property = properties.find((propertyItem) => propertyItem.id === lease.propertyId);
              return (
                <div key={lease.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-100">
                    <Clock className="h-5 w-5 text-warning-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {getTenantNameByLease(lease.tenantId, tenants)}
                    </p>
                    <p className="text-xs text-slate-500">{property?.title || 'Lease renewal'} ends on {formatDate(lease.endDate)}</p>
                  </div>
                  <StatusBadge status={getDaysUntil(lease.endDate) <= 14 ? 'pending' : 'active'} size="sm" />
                </div>
              );
            })}
            {expiringLeases.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No upcoming events.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LandlordDashboard({ user }: { user: User }) {
  const data = useDashboardData();
  const payments = usePayments();
  const properties = useProperties();
  const landlordData = data && !isAdminDashboardData(data) ? data as ReturnType<typeof useDashboardData> & {
    properties: Property[];
    tenants: Tenant[];
    payments: Payment[];
    stats: {
      totalProperties: number;
      occupiedUnits: number;
      vacantUnits: number;
      monthlyIncome: number;
      totalTenants: number;
    };
  } : null;

  const delegatedUnits = demoEstateUnits.filter((unit) => unit.ownerUserId === user.id);
  const delegatedLevyBalance = demoEstateLevies
    .filter((levy) => delegatedUnits.some((unit) => unit.id === levy.unitId) && levy.balance > 0)
    .reduce((sum, levy) => sum + levy.balance, 0);

  const occupancyData = [
    { name: 'Occupied', value: landlordData?.stats.occupiedUnits || 0, color: '#22c55e' },
    { name: 'Vacant', value: landlordData?.stats.vacantUnits || 0, color: '#3b82f6' },
  ].filter((item) => item.value > 0);

  const activityItems = useMemo<ActivityItem[]>(() => {
    if (!landlordData) {
      return [];
    }

    const overduePayments = payments
      .filter((payment) => payment.status === 'overdue')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 2);

    const vacantProperties = properties.filter((property) => property.status === 'vacant').slice(0, 1);
    const vacantDelegatedUnits = delegatedUnits.filter((unit) => unit.status === 'vacant').slice(0, 2);

    const delegatedLevyAlerts = demoEstateLevies
      .filter((levy) => delegatedUnits.some((unit) => unit.id === levy.unitId) && levy.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 1);

    return [
      ...overduePayments.map((payment) => ({
        id: `landlord-payment-${payment.id}`,
        title: `Overdue payment from ${getTenantName(payment.tenantId)}`,
        description: `${getPropertyName(payment.propertyId)} needs collections follow-up.`,
        meta: `${formatCurrency(payment.amount)} overdue`,
        href: '/payments',
        actionLabel: 'Review payment',
        tone: 'overdue' as const,
        icon: CreditCard,
      })),
      ...vacantProperties.map((property) => ({
        id: `landlord-property-${property.id}`,
        title: `${property.title} is vacant`,
        description: 'This rental is empty and needs marketing or tenant placement.',
        meta: `${property.city}, ${property.state}`,
        href: '/properties',
        actionLabel: 'View property',
        tone: 'attention' as const,
        icon: Home,
      })),
      ...vacantDelegatedUnits.map((unit) => ({
        id: `landlord-unit-${unit.id}`,
        title: `Estate unit ${unit.unitNumber} is vacant`,
        description: `${unit.estateName} is ready for a new tenant or owner decision.`,
        meta: unit.blockName || 'Estate unit',
        href: '/estates/estate-units',
        actionLabel: 'Manage unit',
        tone: 'attention' as const,
        icon: MapPin,
      })),
      ...delegatedLevyAlerts.map((levy) => ({
        id: `landlord-levy-${levy.id}`,
        title: `Levy balance on Unit ${levy.unitNumber}`,
        description: `${levy.estateName} has an outstanding levy that affects your delegated estate portfolio.`,
        meta: `${formatCurrency(levy.balance)} due`,
        href: '/levies',
        actionLabel: 'Review levies',
        tone: 'attention' as const,
        icon: Wallet,
      })),
    ].slice(0, 5);
  }, [delegatedUnits, landlordData, payments, properties]);

  if (!landlordData) return null;

  const quickActions: QuickActionItem[] = [
    {
      id: 'landlord-payments',
      label: 'Review Payments',
      description: 'Track collected and overdue rent at a glance.',
      href: '/payments',
      icon: CreditCard,
      toneClass: 'bg-primary-50 text-primary-600',
    },
    {
      id: 'landlord-properties',
      label: 'Manage Properties',
      description: 'Check vacancy, occupancy, and listings.',
      href: '/properties',
      icon: Building2,
      toneClass: 'bg-success-50 text-success-600',
    },
    {
      id: 'landlord-estates',
      label: 'Estate Units',
      description: 'Manage delegated units and tenant access.',
      href: '/estates/estate-units',
      icon: MapPin,
      toneClass: 'bg-warning-50 text-warning-600',
    },
    {
      id: 'landlord-reports',
      label: 'View Analytics',
      description: 'Open performance and reporting views.',
      href: '/analytics',
      icon: Landmark,
      toneClass: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardIntro
        badge="Landlord View"
        title="Portfolio Priorities"
        description="Track rent health, vacancy exposure, and your delegated estate units from one operational view."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Properties" value={landlordData.stats.totalProperties} icon={Building2} iconColor="text-primary-600" iconBgColor="bg-primary-50" />
        <StatCard title="Occupied Units" value={landlordData.stats.occupiedUnits} icon={CheckCircle2} iconColor="text-success-600" iconBgColor="bg-success-50" />
        <StatCard title="Monthly Income" value={formatCurrency(landlordData.stats.monthlyIncome)} icon={CreditCard} iconColor="text-warning-600" iconBgColor="bg-warning-50" />
        <StatCard title="Delegated Levy Risk" value={formatCurrency(delegatedLevyBalance)} icon={Wallet} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActivityCenter items={activityItems} />
        </div>
        <QuickActionsPanel actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentPayments payments={payments.slice(0, 5)} />
        </div>
        <OccupancyChart data={occupancyData} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Delegated Estate Units" subtitle="Estate units where you currently have owner-level access." />
          <div className="space-y-3">
            {delegatedUnits.slice(0, 5).map((unit) => (
              <div key={unit.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Unit {unit.unitNumber}</p>
                  <p className="text-xs text-slate-500">{unit.estateName} {unit.blockName ? `• ${unit.blockName}` : ''}</p>
                </div>
                <StatusBadge status={unit.status} size="sm" />
              </div>
            ))}
            {delegatedUnits.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No delegated estate units yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Tenant Snapshot" subtitle="Your current active rental relationships." />
          <div className="space-y-3">
            {landlordData.tenants.slice(0, 5).map((tenant) => (
              <div key={tenant.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-sm font-semibold text-primary-700">
                    {getInitials(tenant.firstName, tenant.lastName)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{tenant.firstName} {tenant.lastName}</p>
                  <p className="text-xs text-slate-500">{tenant.email}</p>
                </div>
                <StatusBadge status={tenant.status} size="sm" />
              </div>
            ))}
            {landlordData.tenants.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No tenants linked to your current portfolio.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AgentDashboard() {
  const data = useDashboardData();

  if (!data || isAdminDashboardData(data)) return null;

  const agentData = data as {
    agent: { userId: string };
    assignedProperties: Property[];
    activeLeads: Array<{ id: string; firstName: string; lastName: string; email: string; status: string }>;
    convertedLeads: Array<unknown>;
    pendingApplications: Array<{ id: string; firstName: string; lastName: string; email: string; status: string }>;
    stats: {
      assignedProperties: number;
      activeLeads: number;
      convertedLeads: number;
      pendingApplications: number;
    };
  };

  const vacantAssigned = agentData.assignedProperties.filter((property) => property.status === 'vacant').slice(0, 2);

  const activityItems: ActivityItem[] = [
    ...agentData.pendingApplications.slice(0, 2).map((lead) => ({
      id: `agent-application-${lead.id}`,
      title: `${lead.firstName} ${lead.lastName} has a pending application`,
      description: 'Application review is waiting for follow-up or approval.',
      href: '/leads',
      actionLabel: 'Open lead',
      tone: 'attention' as const,
      icon: ClipboardList,
      meta: lead.email,
    })),
    ...agentData.activeLeads.slice(0, 2).map((lead) => ({
      id: `agent-lead-${lead.id}`,
      title: `${lead.firstName} ${lead.lastName} is still active`,
      description: 'Keep the lead moving toward viewing or conversion.',
      href: '/leads',
      actionLabel: 'Follow up',
      tone: 'healthy' as const,
      icon: Users,
      meta: lead.email,
    })),
    ...vacantAssigned.map((property) => ({
      id: `agent-property-${property.id}`,
      title: `${property.title} needs lead coverage`,
      description: 'This vacant unit can be paired with current prospects.',
      href: '/properties',
      actionLabel: 'View property',
      tone: 'attention' as const,
      icon: Home,
      meta: `${property.city}, ${property.state}`,
    })),
  ].slice(0, 5);

  const quickActions: QuickActionItem[] = [
    {
      id: 'agent-leads',
      label: 'Manage Leads',
      description: 'Track new prospects and pending applications.',
      href: '/leads',
      icon: ClipboardList,
      toneClass: 'bg-primary-50 text-primary-600',
    },
    {
      id: 'agent-properties',
      label: 'Assigned Properties',
      description: 'Review inventory and vacancy coverage.',
      href: '/properties',
      icon: Building2,
      toneClass: 'bg-success-50 text-success-600',
    },
    {
      id: 'agent-tenants',
      label: 'Tenant Handoffs',
      description: 'Coordinate applications and onboarding.',
      href: '/tenants',
      icon: Users,
      toneClass: 'bg-warning-50 text-warning-600',
    },
    {
      id: 'agent-inspections',
      label: 'Inspection Schedule',
      description: 'Open inspection workflows for assigned stock.',
      href: '/inspections',
      icon: ClipboardCheck,
      toneClass: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardIntro
        badge="Agent View"
        title="Pipeline And Property Work"
        description="Balance lead follow-up, vacant inventory, and application movement from one place."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Assigned Properties" value={agentData.stats.assignedProperties} icon={Building2} iconColor="text-primary-600" iconBgColor="bg-primary-50" />
        <StatCard title="Active Leads" value={agentData.stats.activeLeads} icon={Users} iconColor="text-warning-600" iconBgColor="bg-warning-50" />
        <StatCard title="Converted" value={agentData.stats.convertedLeads} icon={CheckCircle2} iconColor="text-success-600" iconBgColor="bg-success-50" />
        <StatCard title="Pending Apps" value={agentData.stats.pendingApplications} icon={FileText} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActivityCenter items={activityItems} />
        </div>
        <QuickActionsPanel actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Assigned Properties" subtitle="Vacant and active stock you are currently covering." />
          <div className="space-y-3">
            {agentData.assignedProperties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  {property.featuredImage ? (
                    <Image src={property.featuredImage} alt={property.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <Home className="m-3 h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{property.title}</p>
                  <p className="text-xs text-slate-500">{property.city}, {property.state}</p>
                </div>
                <StatusBadge status={property.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Active Leads" subtitle="Prospects still moving through your funnel." />
          <div className="space-y-3">
            {agentData.activeLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-sm font-semibold text-primary-700">
                    {getInitials(lead.firstName, lead.lastName)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                </div>
                <StatusBadge status={lead.status} size="sm" />
              </div>
            ))}
            {agentData.activeLeads.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No active leads right now.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TenantDashboard() {
  const data = useDashboardData();

  if (!data || isAdminDashboardData(data)) return null;

  const tenantData = data as {
    tenant: Tenant;
    currentProperty?: Property;
    lease?: { startDate: string; endDate: string };
    paymentHistory: Payment[];
    upcomingPayments: Payment[];
    maintenanceRequests: Array<{ id: string; title: string; status: string; priority: string }>;
  };

  const overduePayments = tenantData.upcomingPayments.filter((payment) => payment.status === 'overdue');
  const leaseDaysRemaining = tenantData.lease ? getDaysUntil(tenantData.lease.endDate) : null;

  const activityItems: ActivityItem[] = [
    ...overduePayments.slice(0, 2).map((payment) => ({
      id: `tenant-payment-${payment.id}`,
      title: 'Payment overdue',
      description: `A payment for ${getPropertyName(payment.propertyId)} needs attention.`,
      href: '/payments',
      actionLabel: 'Open payments',
      tone: 'overdue' as const,
      icon: CreditCard,
      meta: `${formatCurrency(payment.amount)} due since ${formatDate(payment.dueDate)}`,
    })),
    ...tenantData.upcomingPayments
      .filter((payment) => payment.status === 'pending')
      .slice(0, 1)
      .map((payment) => ({
        id: `tenant-pending-${payment.id}`,
        title: 'Upcoming rent due',
        description: `Your next payment is due on ${formatDate(payment.dueDate)}.`,
        href: '/payments',
        actionLabel: 'View payment',
        tone: 'attention' as const,
        icon: Wallet,
        meta: formatCurrency(payment.amount),
      })),
    ...(tenantData.lease && leaseDaysRemaining !== null && leaseDaysRemaining <= 45
      ? [{
          id: 'tenant-lease-expiry',
          title: 'Lease ending soon',
          description: `Your lease ends on ${formatDate(tenantData.lease.endDate)}.`,
          href: '/settings',
          actionLabel: 'Review settings',
          tone: 'attention' as const,
          icon: FileText,
          meta: `${leaseDaysRemaining} days remaining`,
        }]
      : []),
    ...tenantData.maintenanceRequests
      .filter((request) => request.status !== 'completed')
      .slice(0, 1)
      .map((request) => ({
        id: `tenant-maintenance-${request.id}`,
        title: request.title,
        description: 'Your maintenance request is still active and being tracked.',
        href: '/settings',
        actionLabel: 'Check support',
        tone: request.priority === 'high' ? ('attention' as const) : ('healthy' as const),
        icon: Wrench,
        meta: `Status: ${request.status.replace(/_/g, ' ')}`,
      })),
  ].slice(0, 4);

  const quickActions: QuickActionItem[] = [
    {
      id: 'tenant-payments',
      label: 'View Payments',
      description: 'Check rent due dates, receipts, and payment history.',
      href: '/payments',
      icon: CreditCard,
      toneClass: 'bg-primary-50 text-primary-600',
    },
    {
      id: 'tenant-support',
      label: 'Profile And Support',
      description: 'Update account details and review support settings.',
      href: '/settings',
      icon: AlertCircle,
      toneClass: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardIntro
        badge="Tenant View"
        title="My Rental Dashboard"
        description="Track your lease, payment deadlines, and open requests from one simple home screen."
      />

      {tenantData.currentProperty ? (
        <>
          <Card className="overflow-hidden">
            <div className="relative h-52 bg-slate-200">
              {tenantData.currentProperty.featuredImage ? (
                <Image
                  src={tenantData.currentProperty.featuredImage}
                  alt={tenantData.currentProperty.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1000px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <Home className="h-16 w-16 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6">
                <h2 className="text-2xl font-bold text-white">{tenantData.currentProperty.title}</h2>
                <p className="text-sm text-white/80">
                  {tenantData.currentProperty.address}, {tenantData.currentProperty.city}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-500">Monthly Rent</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(tenantData.currentProperty.monthlyRent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Lease Start</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {tenantData.lease ? formatDate(tenantData.lease.startDate) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Lease End</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {tenantData.lease ? formatDate(tenantData.lease.endDate) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <div className="mt-2">
                  <StatusBadge status="active" size="sm" />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ActivityCenter
                items={activityItems}
                emptyTitle="You&apos;re up to date"
                emptyDescription="There are no urgent rent, lease, or maintenance issues waiting for you."
              />
            </div>
            <QuickActionsPanel actions={quickActions} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title="Upcoming Payments" subtitle="Your next payment and billing checkpoints." />
              <div className="space-y-3">
                {tenantData.upcomingPayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-100">
                        <CreditCard className="h-5 w-5 text-warning-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Rent Payment</p>
                        <p className="text-xs text-slate-500">Due {formatDate(payment.dueDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                  </div>
                ))}
                {tenantData.upcomingPayments.length === 0 && (
                  <div className="flex items-center gap-3 rounded-2xl bg-success-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-success-600" />
                    <p className="text-sm text-slate-700">All payments are up to date.</p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Open Requests" subtitle="Maintenance and support requests still in progress." />
              <div className="space-y-3">
                {tenantData.maintenanceRequests.slice(0, 4).map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{request.title}</p>
                      <p className="text-xs text-slate-500">Priority: {request.priority}</p>
                    </div>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                ))}
                {tenantData.maintenanceRequests.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">No active support or maintenance requests.</p>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <Home className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No Active Rental</h3>
          <p className="mt-1 text-slate-500">You don&apos;t currently have an active lease linked to this account.</p>
        </Card>
      )}
    </div>
  );
}

function getTenantName(tenantId: string) {
  const tenant = demoData.tenants.find((tenantItem) => tenantItem.id === tenantId);
  return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown tenant';
}

function getTenantNameByLease(tenantId: string, tenants: Tenant[]) {
  const tenant = tenants.find((tenantItem) => tenantItem.id === tenantId);
  return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Tenant';
}

function getPropertyName(propertyId: string) {
  const property = demoData.properties.find((propertyItem) => propertyItem.id === propertyId);
  return property ? property.title : 'Unknown property';
}

export default function DashboardPage() {
  const { user } = useRequireAuth();
  const { showToast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!user) return null;

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const element = document.getElementById('dashboard-content');
      if (!element) {
        throw new Error('Content not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, (pdfWidth * imgHeight) / imgWidth);
      heightLeft -= (pdfHeight * imgWidth) / pdfWidth;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, (pdfWidth * imgHeight) / imgWidth);
        heightLeft -= (pdfHeight * imgWidth) / pdfWidth;
      }

      pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('PDF report downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast('Failed to generate PDF report', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'landlord':
        return <LandlordDashboard user={user} />;
      case 'agent':
        return <AgentDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div id="dashboard-content">{renderDashboard()}</div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleExportPDF}
          isLoading={isGeneratingPDF}
          className="shadow-lg"
        >
          Export PDF
        </Button>
      </div>
    </DashboardLayout>
  );
}

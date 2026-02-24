'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth, useRequireAuth, useDashboardData } from '@/lib/auth/context';
import { useProperties, useTenants, usePayments } from '@/lib/auth/hooks';
import StatCard from '@/components/dashboard/StatCard';
import RecentPayments from '@/components/dashboard/RecentPayments';
import OccupancyChart from '@/components/dashboard/OccupancyChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  FileText,
  Wrench
} from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import Link from 'next/link';
import { demoData } from '@/lib/mockData';

// Admin Dashboard
function AdminDashboard() {
  const data = useDashboardData();
  const properties = useProperties();
  const tenants = useTenants();
  
  if (!data) return null;
  
  const { stats, recentPayments, recentLeads, expiringLeases, occupancyRate } = data;
  
  const occupancyData = [
    { name: 'Occupied', value: stats.occupiedUnits, color: '#22c55e' },
    { name: 'Vacant', value: stats.vacantUnits, color: '#3b82f6' },
    { name: 'Maintenance', value: stats.maintenanceUnits, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your properties today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={Building2}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-50"
        />
        <StatCard
          title="Active Tenants"
          value={stats.totalTenants}
          change={5.2}
          icon={Users}
          iconColor="text-success-600"
          iconBgColor="bg-success-50"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats.monthlyIncome)}
          change={8.1}
          icon={CreditCard}
          iconColor="text-warning-600"
          iconBgColor="bg-warning-50"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          change={2.4}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        
        {/* Occupancy Chart */}
        <OccupancyChart data={occupancyData} />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPayments payments={recentPayments} />
        
        {/* Upcoming Events */}
        <Card>
          <CardHeader title="Upcoming Events" />
          <div className="space-y-3">
            {expiringLeases.slice(0, 3).map((lease) => {
              const tenant = tenants.find(t => t.id === lease.tenantId);
              const property = properties.find(p => p.id === lease.propertyId);
              return (
                <div key={lease.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      Lease Expiring
                    </p>
                    <p className="text-xs text-slate-500">
                      {tenant?.firstName} {tenant?.lastName} - {property?.title}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {formatDate(lease.endDate)}
                  </span>
                </div>
              );
            })}
            {expiringLeases.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Agent Dashboard
function AgentDashboard() {
  const data = useDashboardData();
  const properties = useProperties();
  
  if (!data) return null;
  
  const { agent, assignedProperties, activeLeads, stats } = data as any;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your assigned properties and leads.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Properties"
          value={stats.assignedProperties}
          icon={Home}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-50"
        />
        <StatCard
          title="Active Leads"
          value={stats.activeLeads}
          icon={Users}
          iconColor="text-warning-600"
          iconBgColor="bg-warning-50"
        />
        <StatCard
          title="Converted"
          value={stats.convertedLeads}
          change={12}
          icon={CheckCircle2}
          iconColor="text-success-600"
          iconBgColor="bg-success-50"
        />
        <StatCard
          title="Pending Apps"
          value={stats.pendingApplications}
          icon={FileText}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Properties */}
        <Card>
          <CardHeader 
            title="My Assigned Properties" 
            action={
              <Link href="/properties" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            }
          />
          <div className="space-y-3">
            {assignedProperties.slice(0, 5).map((property: any) => (
              <div key={property.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                  {property.featuredImage ? (
                    <img src={property.featuredImage} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <Home className="w-6 h-6 m-3 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{property.title}</p>
                  <p className="text-xs text-slate-500">{property.city}, {property.state}</p>
                </div>
                <StatusBadge status={property.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Active Leads */}
        <Card>
          <CardHeader 
            title="Active Leads" 
            action={
              <Link href="/leads" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            }
          />
          <div className="space-y-3">
            {activeLeads.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-700">
                    {getInitials(lead.firstName, lead.lastName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                </div>
                <StatusBadge status={lead.status} size="sm" />
              </div>
            ))}
            {activeLeads.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No active leads</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Tenant Dashboard
function TenantDashboard() {
  const data = useDashboardData();
  const payments = usePayments();
  
  if (!data) return null;
  
  const { tenant, currentProperty, lease, paymentHistory, upcomingPayments, maintenanceRequests } = data as any;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Rental</h1>
        <p className="text-slate-500 mt-1">Manage your lease, payments, and requests.</p>
      </div>

      {currentProperty ? (
        <>
          {/* Current Property Card */}
          <Card className="overflow-hidden">
            <div className="h-48 bg-slate-200 relative">
              {currentProperty.featuredImage ? (
                <img 
                  src={currentProperty.featuredImage} 
                  alt={currentProperty.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Home className="w-16 h-16 text-slate-300" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h2 className="text-2xl font-bold text-white">{currentProperty.title}</h2>
                <p className="text-white/80">{currentProperty.address}, {currentProperty.city}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Monthly Rent</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(currentProperty.monthlyRent)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lease Start</p>
                  <p className="text-lg font-semibold text-slate-900">{lease ? formatDate(lease.startDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lease End</p>
                  <p className="text-lg font-semibold text-slate-900">{lease ? formatDate(lease.endDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge status="active" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Payments */}
            <Card>
              <CardHeader title="Upcoming Payments" />
              <div className="space-y-3">
                {upcomingPayments.slice(0, 3).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-warning-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Rent Payment</p>
                        <p className="text-xs text-slate-500">Due {formatDate(payment.dueDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                  </div>
                ))}
                {upcomingPayments.length === 0 && (
                  <div className="flex items-center gap-3 p-3 bg-success-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                    <p className="text-sm text-slate-700">All payments up to date!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Quick Actions" />
              <div className="grid grid-cols-2 gap-3">
                <Link href="/payments">
                  <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                    <p className="text-sm font-medium text-slate-900">Pay Rent</p>
                  </div>
                </Link>
                <Link href="/maintenance">
                  <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                    <Wrench className="w-8 h-8 mx-auto mb-2 text-warning-600" />
                    <p className="text-sm font-medium text-slate-900">Maintenance</p>
                  </div>
                </Link>
                <Link href="/documents">
                  <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-success-600" />
                    <p className="text-sm font-medium text-slate-900">Documents</p>
                  </div>
                </Link>
                <Link href="/settings">
                  <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium text-slate-900">Support</p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <Home className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Rental</h3>
          <p className="text-slate-500">You don't currently have an active lease.</p>
        </Card>
      )}
    </div>
  );
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const { user } = useRequireAuth();
  
  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'agent':
        return <AgentDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      case 'landlord':
        return <AdminDashboard />; // Landlords see similar view to admin
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      {renderDashboard()}
    </DashboardLayout>
  );
}

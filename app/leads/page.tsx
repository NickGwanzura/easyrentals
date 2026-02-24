'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, getInitials } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Filter,
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types';
import { demoData } from '@/lib/mockData';

export default function LeadsPage() {
  const { user, isLoading } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { canManageLeads } = usePermission();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Not authenticated</div>;

  // Filter leads based on user role
  const userLeads = user.role === 'agent' 
    ? demoData.leads.filter(l => l.agentId === user.id)
    : demoData.leads;

  const filteredLeads = userLeads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });



  return (
    <DashboardLayout title="Leads">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-500 mt-1">Manage prospective tenants and inquiries</p>
          </div>
          {canManageLeads && (
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Lead
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={User}
            label="Total Leads"
            value={userLeads.length}
            color="bg-primary-100 text-primary-600"
          />
          <StatCard 
            icon={Clock}
            label="New"
            value={userLeads.filter(l => l.status === 'new').length}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard 
            icon={CheckCircle2}
            label="Converted"
            value={userLeads.filter(l => l.status === 'converted').length}
            color="bg-success-100 text-success-600"
          />
          <StatCard 
            icon={Filter}
            label="Active"
            value={userLeads.filter(l => ['new', 'contacted', 'viewing_scheduled'].includes(l.status)).length}
            color="bg-warning-100 text-warning-600"
          />
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="viewing_scheduled">Viewing Scheduled</option>
              <option value="application_submitted">Application Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </Card>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} getPropertyName={getPropertyName} />
          ))}
          
          {filteredLeads.length === 0 && (
            <Card className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const getPropertyName = (propertyId?: string) => {
  if (!propertyId) return 'General Inquiry';
  const property = demoData.properties.find(p => p.id === propertyId);
  return property ? property.title : 'Unknown Property';
};

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-primary-700">
              {getInitials(lead.firstName, lead.lastName)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{lead.firstName} {lead.lastName}</h3>
            <p className="text-sm text-slate-500">{getPropertyName(lead.propertyId)}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {lead.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {lead.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-2">
          <StatusBadge status={lead.status} />
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {lead.budget && (
              <span className="font-medium text-slate-700">
                Budget: ${lead.budget.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(lead.createdAt)}
            </span>
          </div>
          {lead.preferredMoveInDate && (
            <p className="text-sm text-slate-500">
              Move-in: {formatDate(lead.preferredMoveInDate)}
            </p>
          )}
        </div>
      </div>
      
      {lead.message && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600 italic">&ldquo;{lead.message}&rdquo;</p>
        </div>
      )}
    </Card>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

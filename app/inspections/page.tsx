'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/lib/auth/context';
import { 
  InspectionType, 
  InspectionStatus,
  ConditionRating,
  InspectionStats,
  Inspection
} from '@/types/inspections';
import { 
  demoInspections, 
  getInspectionStats,
  demoInspectionSchedules 
} from '@/lib/mockData/inspections';
import { formatDate } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  ClipboardCheck,
  Calendar,
  Home,
  User,
  CheckCircle2,
  Clock,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  Eye,
  MoreVertical
} from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

const inspectionTypeLabels: Record<InspectionType, string> = {
  routine: 'Routine',
  move_in: 'Move In',
  move_out: 'Move Out',
  final: 'Final',
  safety: 'Safety',
  emergency: 'Emergency'
};

const inspectionTypeColors: Record<InspectionType, string> = {
  routine: 'bg-blue-50 text-blue-700 border-blue-200',
  move_in: 'bg-green-50 text-green-700 border-green-200',
  move_out: 'bg-amber-50 text-amber-700 border-amber-200',
  final: 'bg-purple-50 text-purple-700 border-purple-200',
  safety: 'bg-red-50 text-red-700 border-red-200',
  emergency: 'bg-red-100 text-red-800 border-red-300'
};

const statusColors: Record<InspectionStatus, string> = {
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-slate-50 text-slate-600 border-slate-200',
  no_show: 'bg-red-50 text-red-700 border-red-200'
};

const conditionColors: Record<ConditionRating, string> = {
  excellent: 'bg-green-50 text-green-700 border-green-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  fair: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  poor: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};

// ============================================================================
// Main Component
// ============================================================================

export default function InspectionsPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  
  const [inspections, setInspections] = useState<Inspection[]>(demoInspections);
  const [stats, setStats] = useState<InspectionStats>(getInspectionStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InspectionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | 'all'>('all');

  useEffect(() => {
    setInspections(demoInspections);
    setStats(getInspectionStats());
  }, []);

  if (!user) return null;

  // Filter inspections
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = searchQuery === '' || (
      (inspection.estateUnit?.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       inspection.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       inspection.tenant?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       inspection.tenant?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       inspection.inspectorName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const matchesType = typeFilter === 'all' || inspection.inspectionType === typeFilter;
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingInspections = inspections
    .filter(i => i.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout title="Inspections">
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Property Inspections</h1>
            <p className="text-slate-500 mt-1">Manage routine and move-in/move-out inspections</p>
          </div>
          <div className="flex gap-3">
            <Link href="/inspections/schedules">
              <Button variant="outline" leftIcon={<CalendarDays className="w-4 h-4" />}>
                Schedules
              </Button>
            </Link>
            <Link href="/inspections/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                New Inspection
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Total Inspections</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <ClipboardCheck className="w-10 h-10 text-primary-200" />
            </div>
          </div>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Scheduled</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.scheduled}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-200" />
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-200" />
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Issues Found</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingIssues}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by unit, property, tenant, or inspector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as InspectionType | 'all')}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                {Object.entries(inspectionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InspectionStatus | 'all')}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Inspections List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredInspections.length === 0 ? (
              <Card padding="lg">
                <div className="text-center">
                  <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No inspections found</h3>
                  <p className="text-slate-500 mt-1">Try adjusting your filters or create a new inspection</p>
                  <Link href="/inspections/new">
                    <Button className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
                      New Inspection
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              filteredInspections.map((inspection) => (
                <Card key={inspection.id} hover className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${inspectionTypeColors[inspection.inspectionType]}`}>
                            {inspectionTypeLabels[inspection.inspectionType]}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[inspection.status]}`}>
                            {inspection.status.replace('_', ' ')}
                          </span>
                          {inspection.overallCondition && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${conditionColors[inspection.overallCondition]}`}>
                              {inspection.overallCondition}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-900 font-medium">
                            <Home className="w-4 h-4 text-slate-400" />
                            {inspection.estateUnit ? (
                              <span>{inspection.estateUnit.unitNumber} - {inspection.estateUnit.estateName}</span>
                            ) : inspection.property ? (
                              <span>{inspection.property.title}</span>
                            ) : (
                              <span>No property assigned</span>
                            )}
                          </div>
                          
                          {inspection.tenant && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>{inspection.tenant.firstName} {inspection.tenant.lastName}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              {formatDate(inspection.scheduledDate)}
                              {inspection.scheduledTime && ` at ${inspection.scheduledTime}`}
                              {inspection.completedDate && ` (Completed: ${formatDate(inspection.completedDate)})`}
                            </span>
                          </div>
                          
                          {inspection.inspectorName && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>Inspector: {inspection.inspectorName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/inspections/${inspection.id}`}>
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                            View
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {inspection.generalNotes && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-sm text-slate-600 line-clamp-2">{inspection.generalNotes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Upcoming</h3>
              </div>
              <div className="p-4 space-y-3">
                {upcomingInspections.length === 0 ? (
                  <p className="text-slate-500 text-sm">No upcoming inspections</p>
                ) : (
                  upcomingInspections.map((inspection) => (
                    <Link 
                      key={inspection.id} 
                      href={`/inspections/${inspection.id}`}
                      className="block p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {inspection.estateUnit?.unitNumber || inspection.property?.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(inspection.scheduledDate)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
            
            {/* Active Schedules */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Active Schedules</h3>
              </div>
              <div className="p-4 space-y-3">
                {demoInspectionSchedules.filter(s => s.isActive).length === 0 ? (
                  <p className="text-slate-500 text-sm">No active schedules</p>
                ) : (
                  demoInspectionSchedules.filter(s => s.isActive).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-2">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {schedule.property?.title || schedule.estateUnit?.unitNumber}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {schedule.frequency}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        Next: {formatDate(schedule.nextInspectionDate)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            {/* Condition Summary */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Condition Summary</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-600">Excellent</span>
                    </div>
                    <span className="font-medium">{stats.excellent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-slate-600">Good</span>
                    </div>
                    <span className="font-medium">{stats.good}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-slate-600">Fair</span>
                    </div>
                    <span className="font-medium">{stats.fair}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-slate-600">Poor</span>
                    </div>
                    <span className="font-medium">{stats.poor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-slate-600">Critical</span>
                    </div>
                    <span className="font-medium">{stats.critical}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

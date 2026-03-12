'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/auth/context';
import { useToast } from '@/components/ui/Toast';
import { InspectionSchedule, ScheduleFrequency } from '@/types/inspections';
import { demoInspectionSchedules } from '@/lib/mockData/inspections';
import { demoData } from '@/lib/mockData';
import { demoEstateUnits } from '@/lib/mockData/estate-management';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft,
  Plus,
  CalendarDays,
  Home,
  Building2,
  Clock,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  ChevronRight,
  Bell,
  BellOff,
  AlertCircle
} from 'lucide-react';

const frequencyLabels: Record<ScheduleFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannual: 'Twice a Year',
  annual: 'Annually'
};

export default function InspectionSchedulesPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { showToast } = useToast();
  
  const [schedules, setSchedules] = useState<InspectionSchedule[]>(demoInspectionSchedules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    estateUnitId: '',
    frequency: 'quarterly' as ScheduleFrequency,
    intervalValue: 1,
    startDate: '',
    endDate: '',
    defaultInspectorId: '',
    notifyLandlord: true,
    notifyTenant: true,
    isActive: true
  });

  if (!user) return null;

  const properties = demoData.properties;
  const estateUnits = demoEstateUnits;

  const getPropertyTitle = (schedule: InspectionSchedule) => {
    if (schedule.propertyId) {
      const property = properties.find(p => p.id === schedule.propertyId);
      return property?.title || 'Unknown Property';
    }
    if (schedule.estateUnitId) {
      const unit = estateUnits.find(u => u.id === schedule.estateUnitId);
      return unit ? `${unit.unitNumber} - ${unit.estateName}` : 'Unknown Unit';
    }
    return 'No Property';
  };

  const handleToggleActive = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    ));
    showToast('Schedule updated successfully', 'success');
  };

  const handleDelete = (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      showToast('Schedule deleted', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create new schedule
    const newSchedule: InspectionSchedule = {
      id: `sched-${Date.now()}`,
      propertyId: formData.propertyId || undefined,
      estateUnitId: formData.estateUnitId || undefined,
      frequency: formData.frequency,
      intervalValue: formData.intervalValue,
      startDate: formData.startDate,
      nextInspectionDate: formData.startDate,
      endDate: formData.endDate || undefined,
      defaultInspectorId: formData.defaultInspectorId || undefined,
      isActive: formData.isActive,
      notifyLandlord: formData.notifyLandlord,
      notifyTenant: formData.notifyTenant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSchedules(prev => [...prev, newSchedule]);
    setShowAddModal(false);
    showToast('Schedule created successfully', 'success');
    // Reset form
    setFormData({
      propertyId: '',
      estateUnitId: '',
      frequency: 'quarterly',
      intervalValue: 1,
      startDate: '',
      endDate: '',
      defaultInspectorId: '',
      notifyLandlord: true,
      notifyTenant: true,
      isActive: true
    });
  };

  const activeSchedules = schedules.filter(s => s.isActive);
  const inactiveSchedules = schedules.filter(s => !s.isActive);

  return (
    <DashboardLayout title="Inspection Schedules">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/inspections">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Inspection Schedules</h1>
              <p className="text-slate-500 mt-1">Manage recurring inspection schedules</p>
            </div>
          </div>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            New Schedule
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <CalendarDays className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{schedules.length}</p>
                <p className="text-sm text-slate-500">Total Schedules</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ToggleRight className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeSchedules.length}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <ToggleLeft className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{inactiveSchedules.length}</p>
                <p className="text-sm text-slate-500">Inactive</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Schedules */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Active Schedules</h2>
          
          {activeSchedules.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No active schedules</h3>
                <p className="text-slate-500 mt-1">Create a schedule to automate routine inspections</p>
                <Button 
                  className="mt-4" 
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddModal(true)}
                >
                  Create Schedule
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSchedules.map((schedule) => (
                <Card key={schedule.id} hover className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{getPropertyTitle(schedule)}</h3>
                        <p className="text-sm text-slate-500 capitalize">{frequencyLabels[schedule.frequency]}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span>Next: {formatDate(schedule.nextInspectionDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Started: {formatDate(schedule.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        {schedule.notifyLandlord ? (
                          <Bell className="w-4 h-4 text-slate-400" />
                        ) : (
                          <BellOff className="w-4 h-4 text-slate-300" />
                        )}
                        <span>Landlord {schedule.notifyLandlord ? 'notified' : 'not notified'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleActive(schedule.id)}
                      >
                        <ToggleLeft className="w-4 h-4 mr-1" />
                        Disable
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Schedules */}
        {inactiveSchedules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Inactive Schedules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactiveSchedules.map((schedule) => (
                <Card key={schedule.id} className="opacity-60">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{getPropertyTitle(schedule)}</h3>
                        <p className="text-sm text-slate-500 capitalize">{frequencyLabels[schedule.frequency]}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                        Inactive
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleActive(schedule.id)}
                      >
                        <ToggleRight className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Create Inspection Schedule</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Property Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Property / Unit</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.estateUnitId}
                      onChange={(e) => setFormData({ ...formData, estateUnitId: e.target.value, propertyId: '' })}
                    >
                      <option value="">Select estate unit...</option>
                      {estateUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unitNumber} - {unit.estateName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1 text-center">OR</p>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mt-2"
                      value={formData.propertyId}
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, estateUnitId: '' })}
                    >
                      <option value="">Select standalone property...</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ScheduleFrequency })}
                    >
                      {Object.entries(frequencyLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Inspector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Default Inspector</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.defaultInspectorId}
                      onChange={(e) => setFormData({ ...formData, defaultInspectorId: e.target.value })}
                      placeholder="Inspector name"
                    />
                  </div>

                  {/* Notifications */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.notifyLandlord}
                        onChange={(e) => setFormData({ ...formData, notifyLandlord: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-slate-700">Notify landlord</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.notifyTenant}
                        onChange={(e) => setFormData({ ...formData, notifyTenant: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-slate-700">Notify tenant</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Schedule
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

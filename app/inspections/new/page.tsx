'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/lib/auth/context';
import { useToast } from '@/components/ui/Toast';
import { InspectionType } from '@/types/inspections';
import { demoData } from '@/lib/mockData';
import { demoEstates, demoEstateUnits } from '@/lib/mockData/estate-management';
import type { EstateUnit } from '@/types';
import { 
  ArrowLeft,
  Calendar,
  Home,
  User,
  ClipboardCheck,
  Save,
  Building2,
  MapPin,
  AlertCircle
} from 'lucide-react';

const inspectionTypeOptions = [
  { value: 'routine', label: 'Routine Inspection', description: 'Regular scheduled property check' },
  { value: 'move_in', label: 'Move-In Inspection', description: 'Property condition check before tenant moves in' },
  { value: 'move_out', label: 'Move-Out Inspection', description: 'Property condition check when tenant vacates' },
  { value: 'final', label: 'Final Inspection', description: 'End of lease comprehensive inspection' },
  { value: 'safety', label: 'Safety Inspection', description: 'Fire, electrical, and safety compliance check' },
  { value: 'emergency', label: 'Emergency Inspection', description: 'Urgent inspection due to emergency' }
];

export default function NewInspectionPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { showToast } = useToast();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    inspectionType: '' as InspectionType | '',
    propertyId: '',
    estateId: '',
    estateUnitId: '',
    tenantId: '',
    leaseId: '',
    scheduledDate: '',
    scheduledTime: '10:00',
    inspectorName: '',
    notifyLandlord: true,
    notifyTenant: true,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  // Get available properties and units
  const properties = demoData.properties;
  const estates = demoEstates;
  const estateUnits = demoEstateUnits;
  
  // Filter units based on selected estate
  const filteredUnits = formData.estateId 
    ? estateUnits.filter((u: EstateUnit) => u.estateId === formData.estateId)
    : [];
    
  // Get tenants for selected property/unit
  const tenants = demoData.tenants;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleInspectionTypeChange = (type: InspectionType) => {
    setFormData(prev => ({ ...prev, inspectionType: type }));
  };

  const canProceed = () => {
    if (step === 1) return formData.inspectionType !== '';
    if (step === 2) return formData.scheduledDate !== '' && (formData.propertyId !== '' || formData.estateUnitId !== '');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('Inspection scheduled successfully!', 'success');
      router.push('/inspections');
    } catch (error) {
      showToast('Failed to schedule inspection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="New Inspection">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/inspections">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule New Inspection</h1>
            <p className="text-slate-500 mt-1">Create a new property inspection</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                  step >= s 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 ${step > s ? 'bg-primary-600' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Inspection Type */}
          {step === 1 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Inspection Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inspectionTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleInspectionTypeChange(option.value as InspectionType)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.inspectionType === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <ClipboardCheck className={`w-5 h-5 mt-0.5 ${
                          formData.inspectionType === option.value ? 'text-primary-600' : 'text-slate-400'
                        }`} />
                        <div>
                          <p className="font-medium text-slate-900">{option.label}</p>
                          <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Property & Date */}
          {step === 2 && (
            <Card>
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Property & Schedule</h2>
                
                {/* Property Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Select Property</label>
                  
                  {/* Estate Units */}
                  <div>
                    <label className="block text-sm text-slate-500 mb-2">Estate Unit</label>
                    <select
                      name="estateUnitId"
                      value={formData.estateUnitId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select an estate unit...</option>
                      {estateUnits.map((unit: EstateUnit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unitNumber} - {unit.estateName || 'Unknown Estate'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="text-center text-slate-400 text-sm">OR</div>
                  
                  {/* Standalone Properties */}
                  <div>
                    <label className="block text-sm text-slate-500 mb-2">Standalone Property</label>
                    <select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a property...</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tenant Selection */}
                {(formData.propertyId || formData.estateUnitId) && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assign Tenant (Optional)
                    </label>
                    <select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">No tenant assigned</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.firstName} {tenant.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Scheduled Date</label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Scheduled Time</label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Inspector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Inspector Name</label>
                  <input
                    type="text"
                    name="inspectorName"
                    value={formData.inspectorName}
                    onChange={handleChange}
                    placeholder="Enter inspector name"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Additional Options */}
          {step === 3 && (
            <Card>
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">Additional Options</h2>
                
                {/* Notifications */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Notifications</label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="notifyLandlord"
                      checked={formData.notifyLandlord}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-slate-700">Notify landlord about inspection</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="notifyTenant"
                      checked={formData.notifyTenant}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-slate-700">Notify tenant about inspection</span>
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any additional notes..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Inspection Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type:</span>
                      <span className="font-medium capitalize">{formData.inspectionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-medium">{formData.scheduledDate || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time:</span>
                      <span className="font-medium">{formData.scheduledTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Inspector:</span>
                      <span className="font-medium">{formData.inspectorName || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <div>
              {step > 1 && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Link href="/inspections">
                <Button variant="ghost">Cancel</Button>
              </Link>
              {step < 3 ? (
                <Button 
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Schedule Inspection
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

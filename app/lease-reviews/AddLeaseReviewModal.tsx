'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LeaseReviewStatus, LeaseComplianceRating } from '@/types';
import { Calendar, DollarSign, Star, FileText, Home, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { demoData } from '@/lib/mockData';

interface AddLeaseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddLeaseReviewModal({ isOpen, onClose, onSuccess }: AddLeaseReviewModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    leaseId: '',
    tenantId: '',
    propertyId: '',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    rentPaidOnTime: 100,
    latePayments: 0,
    missedPayments: 0,
    totalPaymentsDue: 0,
    complianceRating: 'good' as LeaseComplianceRating,
    leaseViolations: '',
    maintenanceRequests: 0,
    propertyCondition: 'good' as LeaseComplianceRating,
    conditionNotes: '',
    tenantBehavior: 'good' as LeaseComplianceRating,
    behaviorNotes: '',
    recommendRenewal: true,
    renewalNotes: '',
    rentAdjustment: 0,
    status: 'pending' as LeaseReviewStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : ['rentPaidOnTime', 'latePayments', 'missedPayments', 'totalPaymentsDue', 'maintenanceRequests', 'rentAdjustment'].includes(name)
          ? parseFloat(value) || 0 
          : value
    }));
  };

  const handleTenantChange = (tenantId: string) => {
    const tenant = demoData.tenants.find(t => t.id === tenantId);
    const lease = demoData.leases.find(l => l.tenantId === tenantId && l.status === 'active');
    setFormData(prev => ({
      ...prev,
      tenantId,
      propertyId: tenant?.currentPropertyId || '',
      leaseId: lease?.id || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Lease review created successfully!', 'success');
      onSuccess?.();
      onClose();
      setStep(1);
      setFormData({
        leaseId: '',
        tenantId: '',
        propertyId: '',
        reviewPeriodStart: '',
        reviewPeriodEnd: '',
        rentPaidOnTime: 100,
        latePayments: 0,
        missedPayments: 0,
        totalPaymentsDue: 0,
        complianceRating: 'good',
        leaseViolations: '',
        maintenanceRequests: 0,
        propertyCondition: 'good',
        conditionNotes: '',
        tenantBehavior: 'good',
        behaviorNotes: '',
        recommendRenewal: true,
        renewalNotes: '',
        rentAdjustment: 0,
        status: 'pending',
      });
    } catch (error) {
      showToast('Failed to create lease review', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const activeTenants = demoData.tenants.filter(t => t.status === 'active' && t.currentPropertyId);

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Review Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Select Tenant <span className="text-danger-500">*</span>
        </label>
        <select
          name="tenantId"
          value={formData.tenantId}
          onChange={(e) => handleTenantChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          required
        >
          <option value="">Select a tenant</option>
          {activeTenants.map(tenant => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.firstName} {tenant.lastName}
            </option>
          ))}
        </select>
        {activeTenants.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">No active tenants with properties assigned</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Review Period Start"
          name="reviewPeriodStart"
          type="date"
          value={formData.reviewPeriodStart}
          onChange={handleChange}
          required
          leftIcon={<Calendar className="w-4 h-4" />}
        />
        <Input
          label="Review Period End"
          name="reviewPeriodEnd"
          type="date"
          value={formData.reviewPeriodEnd}
          onChange={handleChange}
          required
          leftIcon={<Calendar className="w-4 h-4" />}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Review Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Payment Performance</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Rent Paid On-Time (%)"
          name="rentPaidOnTime"
          type="number"
          value={formData.rentPaidOnTime}
          onChange={handleChange}
          min={0}
          max={100}
          required
          leftIcon={<DollarSign className="w-4 h-4" />}
        />
        <Input
          label="Total Payments Due"
          name="totalPaymentsDue"
          type="number"
          value={formData.totalPaymentsDue}
          onChange={handleChange}
          min={0}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Late Payments"
          name="latePayments"
          type="number"
          value={formData.latePayments}
          onChange={handleChange}
          min={0}
        />
        <Input
          label="Missed Payments"
          name="missedPayments"
          type="number"
          value={formData.missedPayments}
          onChange={handleChange}
          min={0}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Overall Compliance Rating</label>
        <select
          name="complianceRating"
          value={formData.complianceRating}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Lease Violations</label>
        <textarea
          name="leaseViolations"
          value={formData.leaseViolations}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="List any lease violations (comma separated)..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Property & Tenant Assessment</h3>
      
      <Input
        label="Maintenance Requests"
        name="maintenanceRequests"
        type="number"
        value={formData.maintenanceRequests}
        onChange={handleChange}
        min={0}
        leftIcon={<Home className="w-4 h-4" />}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Condition</label>
        <select
          name="propertyCondition"
          value={formData.propertyCondition}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition Notes</label>
        <textarea
          name="conditionNotes"
          value={formData.conditionNotes}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Notes about property condition..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tenant Behavior</label>
        <select
          name="tenantBehavior"
          value={formData.tenantBehavior}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Behavior Notes</label>
        <textarea
          name="behaviorNotes"
          value={formData.behaviorNotes}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Notes about tenant behavior..."
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Renewal Recommendation</h3>
      
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="recommendRenewal"
            checked={formData.recommendRenewal === true}
            onChange={() => setFormData(prev => ({ ...prev, recommendRenewal: true }))}
            className="w-4 h-4 text-primary-600"
          />
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Recommend Renewal</span>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="recommendRenewal"
            checked={formData.recommendRenewal === false}
            onChange={() => setFormData(prev => ({ ...prev, recommendRenewal: false }))}
            className="w-4 h-4 text-primary-600"
          />
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Do Not Recommend</span>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Renewal Notes</label>
        <textarea
          name="renewalNotes"
          value={formData.renewalNotes}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Explain your recommendation..."
        />
      </div>

      <Input
        label="Rent Adjustment (%)"
        name="rentAdjustment"
        type="number"
        value={formData.rentAdjustment}
        onChange={handleChange}
        min={-50}
        max={100}
        helperText="Enter positive number for increase, negative for decrease"
        leftIcon={<DollarSign className="w-4 h-4" />}
      />
    </div>
  );

  const steps = [
    { number: 1, title: 'Details', component: renderStep1 },
    { number: 2, title: 'Payment', component: renderStep2 },
    { number: 3, title: 'Assessment', component: renderStep3 },
    { number: 4, title: 'Decision', component: renderStep4 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Lease Review"
      size="lg"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => setStep(s.number)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  step === s.number 
                    ? 'bg-primary-600 text-white' 
                    : step > s.number 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {s.number}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isLoading} leftIcon={<FileText className="w-4 h-4" />}>
                Create Review
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-slate-500">Step {step} of 4:</span>
          <span className="text-sm font-semibold text-slate-900">{steps[step - 1].title}</span>
        </div>
        {steps[step - 1].component()}
      </form>
    </Modal>
  );
}

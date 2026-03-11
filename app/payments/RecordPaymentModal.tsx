'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { PaymentType, PaymentMethod, PaymentStatus } from '@/types';
import { DollarSign, CreditCard, Calendar, FileText } from 'lucide-react';
import { demoData } from '@/lib/mockData';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RecordPaymentModal({ isOpen, onClose, onSuccess }: RecordPaymentModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    amount: 0,
    type: 'rent' as PaymentType,
    method: 'bank_transfer' as PaymentMethod,
    status: 'paid' as PaymentStatus,
    paymentForMonth: new Date().getMonth() + 1,
    paymentForYear: new Date().getFullYear(),
    dueDate: '',
    paidDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'paymentForMonth' || name === 'paymentForYear' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleTenantChange = (tenantId: string) => {
    const tenant = demoData.tenants.find(t => t.id === tenantId);
    setFormData(prev => ({
      ...prev,
      tenantId,
      propertyId: tenant?.currentPropertyId || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Payment recorded successfully!', 'success');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        tenantId: '',
        propertyId: '',
        amount: 0,
        type: 'rent',
        method: 'bank_transfer',
        status: 'paid',
        paymentForMonth: new Date().getMonth() + 1,
        paymentForYear: new Date().getFullYear(),
        dueDate: '',
        paidDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        notes: '',
      });
    } catch (error) {
      showToast('Failed to record payment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const activeTenants = demoData.tenants.filter(t => t.status === 'active');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} leftIcon={<DollarSign className="w-4 h-4" />}>
            Record Payment
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tenant Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tenant <span className="text-danger-500">*</span>
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
            <p className="mt-1 text-sm text-amber-600">No active tenants available</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount (USD)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            min={0}
            required
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="rent">Rent</option>
              <option value="deposit">Deposit</option>
              <option value="late_fee">Late Fee</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Payment Method & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Period */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide col-span-2">Payment Period</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
            <select
              name="paymentForMonth"
              value={formData.paymentForMonth}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Year"
            name="paymentForYear"
            type="number"
            value={formData.paymentForYear}
            onChange={handleChange}
            min={2020}
            max={2030}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide col-span-2">Dates</h3>
          <Input
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Paid Date"
            name="paidDate"
            type="date"
            value={formData.paidDate}
            onChange={handleChange}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Additional Information</h3>
          <Input
            label="Transaction ID"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="e.g., TXN-001"
            leftIcon={<CreditCard className="w-4 h-4" />}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Optional notes..."
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

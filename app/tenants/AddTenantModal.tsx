'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { TenantStatus } from '@/types';
import { User, Mail, Phone, Briefcase, DollarSign, Home } from 'lucide-react';
import { demoData } from '@/lib/mockData';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTenantModal({ isOpen, onClose, onSuccess }: AddTenantModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    employer: '',
    employmentStatus: 'employed' as const,
    monthlyIncome: 0,
    currentPropertyId: '',
    status: 'pending' as TenantStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyIncome' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('Tenant added successfully!', 'success');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        employer: '',
        employmentStatus: 'employed',
        monthlyIncome: 0,
        currentPropertyId: '',
        status: 'pending',
      });
    } catch (error) {
      showToast('Failed to add tenant', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const vacantProperties = demoData.properties.filter(p => p.status === 'vacant');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Tenant"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} leftIcon={<User className="w-4 h-4" />}>
            Add Tenant
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              leftIcon={<User className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+263 77 200 0000"
              required
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Emergency Contact</h3>
          
          <Input
            label="Contact Name"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleChange}
            placeholder="Emergency contact name"
          />
          <Input
            label="Contact Phone"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleChange}
            placeholder="+263 77 200 0000"
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </div>

        {/* Employment */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Employment</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employer"
              name="employer"
              value={formData.employer}
              onChange={handleChange}
              placeholder="Company name"
              leftIcon={<Briefcase className="w-4 h-4" />}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employment Status</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="employed">Employed</option>
                <option value="self-employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <Input
            label="Monthly Income (USD)"
            name="monthlyIncome"
            type="number"
            value={formData.monthlyIncome}
            onChange={handleChange}
            min={0}
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Property Assignment */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Property Assignment</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Assign Property <span className="text-slate-400">(Optional)</span>
            </label>
            <select
              name="currentPropertyId"
              value={formData.currentPropertyId}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">Select a vacant property</option>
              {vacantProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title} - {property.city}
                </option>
              ))}
            </select>
            {vacantProperties.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">No vacant properties available</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LeadStatus } from '@/types';
import { User, Mail, Phone, Calendar, DollarSign, MessageSquare, Home } from 'lucide-react';
import { demoData } from '@/lib/mockData';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    preferredMoveInDate: '',
    budget: 0,
    propertyId: '',
    status: 'new' as LeadStatus,
    source: 'website' as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Lead added successfully!', 'success');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        preferredMoveInDate: '',
        budget: 0,
        propertyId: '',
        status: 'new',
        source: 'website',
      });
    } catch (error) {
      showToast('Failed to add lead', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Lead"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} leftIcon={<User className="w-4 h-4" />}>
            Add Lead
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Contact Information</h3>
          
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
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Inquiry Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Inquiry Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Property Interest <span className="text-slate-400">(Optional)</span>
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">Select a property</option>
              {demoData.properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.title} - {property.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message / Inquiry</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="What is the lead looking for?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Budget (USD)"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              min={0}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <Input
              label="Preferred Move-in Date"
              name="preferredMoveInDate"
              type="date"
              value={formData.preferredMoveInDate}
              onChange={handleChange}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Status & Source */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Status & Source</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="viewing_scheduled">Viewing Scheduled</option>
                <option value="application_submitted">Application Submitted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="property_sign">Property Sign</option>
                <option value="online_listing">Online Listing</option>
                <option value="walk_in">Walk-in</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { PropertyType, PropertyStatus } from '@/types';
import { Home, MapPin, DollarSign, Bed, Bath, Maximize } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'apartment' as PropertyType,
    status: 'vacant' as PropertyStatus,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 0,
    yearBuilt: new Date().getFullYear(),
    monthlyRent: 0,
    depositAmount: 0,
    amenities: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bedrooms' || name === 'bathrooms' || name === 'squareFeet' || name === 'yearBuilt' || name === 'monthlyRent' || name === 'depositAmount' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call an API here
      // For demo purposes, we'll just show success
      showToast('Property added successfully!', 'success');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: 'apartment',
        status: 'vacant',
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 0,
        yearBuilt: new Date().getFullYear(),
        monthlyRent: 0,
        depositAmount: 0,
        amenities: '',
      });
    } catch (error) {
      showToast('Failed to add property', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Property"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} leftIcon={<Home className="w-4 h-4" />}>
            Add Property
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Basic Information</h3>
          
          <Input
            label="Property Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Modern Downtown Loft"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Describe the property..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
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
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Location</h3>
          
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address"
            required
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
            />
            <Input
              label="Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Province"
              required
            />
            <Input
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="00000"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Property Details</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
              min={0}
              leftIcon={<Bed className="w-4 h-4" />}
            />
            <Input
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange}
              min={0}
              step={0.5}
              leftIcon={<Bath className="w-4 h-4" />}
            />
            <Input
              label="Square Feet"
              name="squareFeet"
              type="number"
              value={formData.squareFeet}
              onChange={handleChange}
              min={0}
              leftIcon={<Maximize className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Year Built"
            name="yearBuilt"
            type="number"
            value={formData.yearBuilt}
            onChange={handleChange}
            min={1900}
            max={new Date().getFullYear()}
          />
        </div>

        {/* Financial */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Financial</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Rent (USD)"
              name="monthlyRent"
              type="number"
              value={formData.monthlyRent}
              onChange={handleChange}
              min={0}
              required
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
            <Input
              label="Deposit Amount (USD)"
              name="depositAmount"
              type="number"
              value={formData.depositAmount}
              onChange={handleChange}
              min={0}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Amenities</h3>
          <Input
            label="Amenities (comma separated)"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            placeholder="e.g., Gym, Parking, Pool, Security"
            helperText="Separate amenities with commas"
          />
        </div>
      </form>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth, useProperties } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize
} from 'lucide-react';
import { Property, PropertyStatus, PropertyType } from '@/types';
import Link from 'next/link';

const statusColors: Record<PropertyStatus, string> = {
  vacant: 'bg-blue-50 text-blue-700 border-blue-200',
  occupied: 'bg-green-50 text-green-700 border-green-200',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  inactive: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function PropertiesPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { canManageProperties } = usePermission();
  const properties = useProperties();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');

  if (!user) return null;

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout title="Properties">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
            <p className="text-slate-500 mt-1">Manage your rental properties</p>
          </div>
          {canManageProperties && (
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Property
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PropertyType | 'all')}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Home className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Card hover className="overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-slate-200 relative">
        {property.featuredImage ? (
          <img 
            src={property.featuredImage} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Home className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[property.status]}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{property.title}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {property.city}, {property.state}
            </p>
          </div>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(property.monthlyRent)}
            <span className="text-sm font-normal text-slate-400">/mo</span>
          </p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 py-3 border-y border-slate-100 my-3">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Bed className="w-4 h-4" />
            {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Bath className="w-4 h-4" />
            {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Maximize className="w-4 h-4" />
            {property.squareFeet.toLocaleString()} sqft
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 capitalize">
            {property.type}
          </span>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

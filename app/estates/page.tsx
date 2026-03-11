'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import { demoEstates, type Estate } from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin,
  ArrowRight,
  Users,
  Home,
  DollarSign,
  Phone,
  Mail,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

function EstatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    estateManagerName: '',
    estateManagerPhone: '',
    estateManagerEmail: '',
    securityCompany: '',
    maintenanceCompany: '',
    totalUnits: 0,
  });

  const filteredEstates = demoEstates.filter(estate => 
    estate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estate.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estate.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalEstates: demoEstates.length,
    totalUnits: demoEstates.reduce((sum, e) => sum + e.totalUnits, 0),
    occupiedUnits: Math.floor(demoEstates.reduce((sum, e) => sum + e.totalUnits, 0) * 0.75),
    vacantUnits: Math.floor(demoEstates.reduce((sum, e) => sum + e.totalUnits, 0) * 0.25),
  };

  const handleAddEstate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new estate
    const newEstate: Estate = {
      id: `est-${Date.now()}`,
      ...formData,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    
    // Add to demo data
    demoEstates.push(newEstate);
    
    showToast('Estate created successfully!', 'success');
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      address: '',
      city: '',
      description: '',
      estateManagerName: '',
      estateManagerPhone: '',
      estateManagerEmail: '',
      securityCompany: '',
      maintenanceCompany: '',
      totalUnits: 0,
    });
  };

  return (
    <DashboardLayout title="Estates">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Estate Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Estates</h1>
            <p className="text-slate-500">Manage residential estates, complexes, and gated communities</p>
          </div>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />} 
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Estate
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Estates</p>
                <p className="text-lg font-bold text-slate-900">{stats.totalEstates}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Units</p>
                <p className="text-lg font-bold text-slate-900">{stats.totalUnits}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Occupied</p>
                <p className="text-lg font-bold text-slate-900">{stats.occupiedUnits}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Vacant</p>
                <p className="text-lg font-bold text-slate-900">{stats.vacantUnits}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search estates by name, city, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>

        {/* Estates Table */}
        <Card>
          <CardHeader title={`${filteredEstates.length} Estates`} />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Estate</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">City</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Units</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Manager</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEstates.map((estate) => (
                  <tr key={estate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{estate.name}</p>
                          <p className="text-xs text-slate-500">{estate.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{estate.city}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-slate-900">{estate.totalUnits}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900">{estate.estateManagerName}</p>
                      <p className="text-xs text-slate-500">{estate.estateManagerPhone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={estate.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/estates/dashboard?id=${estate.id}`}>
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Dashboard
                          </button>
                        </Link>
                        <span className="text-slate-300">|</span>
                        <button className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEstates.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No estates found</h3>
              <p className="text-slate-500">Try adjusting your search or add a new estate</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Estate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Estate"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddEstate}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Create Estate
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddEstate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estate Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Borrowdale Estate"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Harare"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Brief description of the estate"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Estate Manager</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.estateManagerName}
                  onChange={(e) => setFormData({ ...formData, estateManagerName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Manager name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.estateManagerPhone}
                  onChange={(e) => setFormData({ ...formData, estateManagerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+263 71 123 4567"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.estateManagerEmail}
                onChange={(e) => setFormData({ ...formData, estateManagerEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="manager@example.com"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Service Providers</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Security Company</label>
                <input
                  type="text"
                  value={formData.securityCompany}
                  onChange={(e) => setFormData({ ...formData, securityCompany: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Safeguard Security"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Maintenance Company</label>
                <input
                  type="text"
                  value={formData.maintenanceCompany}
                  onChange={(e) => setFormData({ ...formData, maintenanceCompany: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Trojan Construction"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Total Units</label>
            <input
              type="number"
              value={formData.totalUnits}
              onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default function EstatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EstatesContent />
    </Suspense>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  demoEstates, 
  demoEstateUnits, 
  demoEstateLevies,
  type EstateUnit,
  type EstateUnitStatus 
} from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  Home, 
  Plus, 
  Search, 
  Building2,
  Phone,
  DollarSign,
  AlertTriangle,
  Save,
  X,
  Eye,
  User
} from 'lucide-react';

function EstateUnitsContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || 'all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<EstateUnit | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    unitNumber: '',
    estateId: '',
    blockName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    status: 'vacant' as EstateUnitStatus,
    monthlyLevy: 0,
  });

  let units = demoEstateUnits;
  
  if (selectedEstate !== 'all') {
    units = units.filter(u => u.estateId === selectedEstate);
  }
  
  if (searchQuery) {
    units = units.filter(u => 
      u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.tenantName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }
  
  if (statusFilter !== 'all') {
    units = units.filter(u => u.status === statusFilter);
  }

  const getUnitLevy = (unitId: string) => {
    const levies = demoEstateLevies.filter(l => l.unitId === unitId);
    return levies.reduce((sum, l) => sum + l.balance, 0);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const estate = demoEstates.find(e => e.id === formData.estateId);
    
    const newUnit: EstateUnit = {
      id: `unit-${Date.now()}`,
      estateId: formData.estateId,
      estateName: estate?.name || '',
      unitNumber: formData.unitNumber,
      blockName: formData.blockName || undefined,
      ownerName: formData.ownerName || undefined,
      ownerPhone: formData.ownerPhone || undefined,
      ownerEmail: formData.ownerEmail || undefined,
      tenantName: formData.tenantName || undefined,
      tenantPhone: formData.tenantPhone || undefined,
      tenantEmail: formData.tenantEmail || undefined,
      status: formData.status,
      monthlyLevy: formData.monthlyLevy,
      outstandingLevy: 0,
      unitType: 'apartment',
      parkingSpaces: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    demoEstateUnits.push(newUnit);
    
    // Update estate unit count
    if (estate) {
      estate.totalUnits += 1;
    }
    
    showToast('Unit created successfully!', 'success');
    setIsAddModalOpen(false);
    setFormData({
      unitNumber: '',
      estateId: '',
      blockName: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      tenantName: '',
      tenantPhone: '',
      tenantEmail: '',
      status: 'vacant',
      monthlyLevy: 0,
    });
  };

  return (
    <DashboardLayout title="Estate Units">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Estate Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">Units</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Estate Units</h1>
          </div>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />} 
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Unit
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search units, owners, or tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedEstate}
              onChange={(e) => setSelectedEstate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Estates</option>
              {demoEstates.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
              <option value="owner_occupied">Owner Occupied</option>
            </select>
          </div>
        </Card>

        {/* Units Table */}
        <Card>
          <CardHeader title={`${units.length} Units`} />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Estate / Block</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Levy</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Unit {unit.unitNumber}</p>
                          <p className="text-xs text-slate-500">{unit.blockName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900">{unit.estateName}</p>
                      {unit.blockName && <p className="text-xs text-slate-500">{unit.blockName}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900">{unit.ownerName || '-'}</p>
                      {unit.ownerPhone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{unit.ownerPhone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {unit.tenantName ? (
                        <div>
                          <p className="text-sm text-slate-900">{unit.tenantName}</p>
                          {unit.tenantPhone && (
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{unit.tenantPhone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No tenant</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={unit.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(unit.monthlyLevy || 0)}/mo</p>
                        {getUnitLevy(unit.id) > 0 && (
                          <p className="text-xs text-danger-600 flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {formatCurrency(getUnitLevy(unit.id))} owed
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => setViewingUnit(unit)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {units.length === 0 && (
            <div className="py-12 text-center">
              <Home className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No units found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Unit"
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
              onClick={handleAddUnit}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Create Unit
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estate *</label>
              <select
                required
                value={formData.estateId}
                onChange={(e) => setFormData({ ...formData, estateId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select estate</option>
                {demoEstates.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unit Number *</label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., A12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Block Name</label>
              <input
                type="text"
                value={formData.blockName}
                onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Block A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EstateUnitStatus })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="owner_occupied">Owner Occupied</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Levy (USD)</label>
            <input
              type="number"
              value={formData.monthlyLevy}
              onChange={(e) => setFormData({ ...formData, monthlyLevy: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Owner Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Owner name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+263 71 123 4567"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="owner@example.com"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Tenant Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tenant name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.tenantPhone}
                  onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+263 71 123 4567"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.tenantEmail}
                onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="tenant@example.com"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* View Unit Modal */}
      <Modal
        isOpen={!!viewingUnit}
        onClose={() => setViewingUnit(null)}
        title={`Unit ${viewingUnit?.unitNumber}`}
        size="md"
      >
        {viewingUnit && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <StatusBadge status={viewingUnit.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Estate</span>
              <span className="text-sm font-medium">{viewingUnit.estateName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Monthly Levy</span>
              <span className="text-sm font-medium">{formatCurrency(viewingUnit.monthlyLevy || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Outstanding</span>
              <span className={`text-sm font-medium ${getUnitLevy(viewingUnit.id) > 0 ? 'text-danger-600' : ''}`}>
                {formatCurrency(getUnitLevy(viewingUnit.id))}
              </span>
            </div>
            
            {viewingUnit.ownerName && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Owner</h4>
                <p className="text-sm">{viewingUnit.ownerName}</p>
                {viewingUnit.ownerPhone && <p className="text-sm text-slate-500">{viewingUnit.ownerPhone}</p>}
                {viewingUnit.ownerEmail && <p className="text-sm text-slate-500">{viewingUnit.ownerEmail}</p>}
              </div>
            )}
            
            {viewingUnit.tenantName && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Tenant</h4>
                <p className="text-sm">{viewingUnit.tenantName}</p>
                {viewingUnit.tenantPhone && <p className="text-sm text-slate-500">{viewingUnit.tenantPhone}</p>}
                {viewingUnit.tenantEmail && <p className="text-sm text-slate-500">{viewingUnit.tenantEmail}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default function EstateUnitsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EstateUnitsContent />
    </Suspense>
  );
}

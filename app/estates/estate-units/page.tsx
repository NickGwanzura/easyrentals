'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  demoEstates, 
  demoEstateUnits, 
  demoEstateLevies 
} from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  Home, 
  Plus, 
  Search, 
  Filter,
  Building2,
  Phone,
  Mail,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

function EstateUnitsContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || 'all');
  
  // Get units
  let units = demoEstateUnits;
  
  if (selectedEstate !== 'all') {
    units = units.filter(u => u.estateId === selectedEstate);
  }
  
  if (searchQuery) {
    units = units.filter(u => 
      u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.estateName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (statusFilter !== 'all') {
    units = units.filter(u => u.status === statusFilter);
  }
  
  const getUnitLevy = (unitId: string) => {
    const levies = demoEstateLevies.filter(l => l.unitId === unitId);
    return levies.reduce((sum, l) => sum + l.balance, 0);
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
          <Button leftIcon={<Plus className="w-4 h-4" />} variant="primary">
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
                      <p className="text-sm text-slate-900">{unit.ownerName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{unit.ownerPhone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {unit.tenantName ? (
                        <div>
                          <p className="text-sm text-slate-900">{unit.tenantName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{unit.tenantPhone}</span>
                          </div>
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
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(unit.monthlyLevy)}/mo</p>
                        {getUnitLevy(unit.id) > 0 && (
                          <p className="text-xs text-danger-600 flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {formatCurrency(getUnitLevy(unit.id))} owed
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View
                      </button>
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

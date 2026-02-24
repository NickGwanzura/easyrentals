'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { demoEstates, demoEstateUnits, demoEstateLevies } from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  DollarSign,
  Phone,
  Mail,
  Shield,
  Wrench,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function EstatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredEstates = demoEstates.filter(estate => 
    estate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estate.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEstateStats = (estateId: string) => {
    const units = demoEstateUnits.filter(u => u.estateId === estateId);
    const levies = demoEstateLevies.filter(l => l.estateId === estateId);
    
    return {
      totalUnits: units.length,
      occupied: units.filter(u => u.status === 'occupied').length,
      outstandingLevies: levies.filter(l => l.status !== 'paid').reduce((sum, l) => sum + l.balance, 0),
    };
  };

  return (
    <DashboardLayout title="Estates">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estates</h1>
            <p className="text-slate-500 mt-1">Manage residential estates, complexes, and gated communities</p>
          </div>
          <Link href="/estates/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Estate
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card padding="sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search estates by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </Card>

        {/* Estates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEstates.map((estate) => {
            const stats = getEstateStats(estate.id);
            
            return (
              <Card key={estate.id} className="hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <StatusBadge status={estate.status} />
                </div>
                
                {/* Info */}
                <h3 className="text-lg font-bold text-slate-900 mb-1">{estate.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  {estate.address}, {estate.city}
                </p>
                
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {estate.description}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{stats.totalUnits}</p>
                    <p className="text-xs text-slate-500">Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-success-600">{stats.occupied}</p>
                    <p className="text-xs text-slate-500">Occupied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-danger-600">
                      {formatCurrency(stats.outstandingLevies)}
                    </p>
                    <p className="text-xs text-slate-500">Outstanding</p>
                  </div>
                </div>
                
                {/* Manager & Services */}
                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Manager: {estate.managerName}</span>
                  </div>
                  {estate.securityCompany && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="w-4 h-4" />
                      <span>Security: {estate.securityCompany}</span>
                    </div>
                  )}
                  {estate.maintenanceCompany && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Wrench className="w-4 h-4" />
                      <span>Maintenance: {estate.maintenanceCompany}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/estates/dashboard?id=${estate.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={`/estates/${estate.id}`} className="flex-1">
                    <Button size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Details
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredEstates.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No estates found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or add a new estate</p>
            <Link href="/estates/new">
              <Button>Add Estate</Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

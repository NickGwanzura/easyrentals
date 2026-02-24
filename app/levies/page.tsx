'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';
import Link from 'next/link';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function LeviesContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || 'all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Get levies
  let levies = demoEstateLevies;
  
  if (selectedEstate !== 'all') {
    levies = levies.filter(l => l.estateId === selectedEstate);
  }
  
  if (searchQuery) {
    levies = levies.filter(l => 
      l.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.estateName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (statusFilter !== 'all') {
    levies = levies.filter(l => l.status === statusFilter);
  }
  
  if (selectedMonth !== 'all') {
    const monthNum = parseInt(selectedMonth);
    levies = levies.filter(l => l.month === monthNum);
  }
  
  // Stats
  const totalLevy = levies.reduce((sum, l) => sum + l.levyAmount, 0);
  const totalPaid = levies.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalOutstanding = levies.reduce((sum, l) => sum + l.balance, 0);
  const paidCount = levies.filter(l => l.status === 'paid').length;
  const unpaidCount = levies.filter(l => l.status !== 'paid').length;

  return (
    <DashboardLayout title="Levy Management">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Estate Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">Levies</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Monthly Levies</h1>
          </div>
          <div className="flex gap-3">
            <Button leftIcon={<Download className="w-4 h-4" />} variant="outline">
              Export
            </Button>
            <Button leftIcon={<Plus className="w-4 h-4" />} variant="primary">
              Generate Levies
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Levy</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalLevy)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Collected</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Outstanding</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Collection Rate</p>
                <p className="text-lg font-bold text-slate-900">
                  {levies.length > 0 ? Math.round((paidCount / levies.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search units or estates..."
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
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Months</option>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </Card>

        {/* Levies Table */}
        <Card>
          <CardHeader title={`${levies.length} Levy Records`} />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Estate</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Levy Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Paid</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {levies.map((levy) => (
                  <tr key={levy.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Unit {levy.unitNumber}</p>
                          <p className="text-xs text-slate-500">{levy.blockName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900">{levy.estateName}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{MONTHS[levy.month - 1]} {levy.year}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(levy.levyAmount)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900">{formatCurrency(levy.paidAmount)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className={`text-sm font-medium ${levy.balance > 0 ? 'text-danger-600' : 'text-slate-900'}`}>
                        {formatCurrency(levy.balance)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={levy.status} />
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600">{levy.dueDate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {levies.length === 0 && (
            <div className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No levy records found</h3>
              <p className="text-slate-500">Try adjusting your search or generate new levies</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function LeviesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LeviesContent />
    </Suspense>
  );
}

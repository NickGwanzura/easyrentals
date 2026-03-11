'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  demoEstates, 
  demoEstateUnits 
} from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  ArrowUpRight,
  Building2,
  Calendar,
  Home,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Key,
  ClipboardCheck,
  Save
} from 'lucide-react';
import Link from 'next/link';

function MoveInContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || '');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  const [formData, setFormData] = useState({
    residentName: '',
    residentPhone: '',
    residentEmail: '',
    moveInDate: '',
    leaseStartDate: '',
    depositPaid: false,
    depositAmount: '',
    keysIssued: false,
    inspectionCompleted: false,
    documentsSigned: false,
    notes: ''
  });
  
  const estate = demoEstates.find(e => e.id === selectedEstate);
  const units = demoEstateUnits.filter(u => u.estateId === selectedEstate && u.status === 'vacant');
  const selectedUnitData = demoEstateUnits.find(u => u.id === selectedUnit);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, just show alert
    alert('Move in recorded successfully! (Demo Mode)');
  };

  return (
    <DashboardLayout title="New Move In">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <Link href="/estate-moves" className="hover:text-slate-700">Move Management</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">New Move In</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Record Move In</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/estate-moves">
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">
                Cancel
              </button>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Unit Selection" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Estate</label>
                  <select
                    value={selectedEstate}
                    onChange={(e) => {
                      setSelectedEstate(e.target.value);
                      setSelectedUnit('');
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Choose an estate</option>
                    {demoEstates.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedEstate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Unit</label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Choose a vacant unit</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>
                          Unit {u.unitNumber} {u.blockName ? `(${u.blockName})` : ''} - Levy: {formatCurrency(u.monthlyLevy)}/mo
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Resident Information" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Resident Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.residentName}
                      onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Full name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.residentPhone}
                        onChange={(e) => setFormData({ ...formData, residentPhone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+263 71 123 4567"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.residentEmail}
                        onChange={(e) => setFormData({ ...formData, residentEmail: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Move In Details" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Move In Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lease Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={formData.leaseStartDate}
                        onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deposit Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Checklist" />
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.depositPaid}
                    onChange={(e) => setFormData({ ...formData, depositPaid: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Deposit Paid</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.keysIssued}
                    onChange={(e) => setFormData({ ...formData, keysIssued: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Keys Issued</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.inspectionCompleted}
                    onChange={(e) => setFormData({ ...formData, inspectionCompleted: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Inspection Completed</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.documentsSigned}
                    onChange={(e) => setFormData({ ...formData, documentsSigned: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Documents Signed</span>
                  </div>
                </label>
              </div>
            </Card>

            {selectedUnitData && (
              <Card className="bg-primary-50 border-primary-200">
                <CardHeader title="Selected Unit" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Unit Number</span>
                    <span className="text-sm font-medium text-slate-900">{selectedUnitData.unitNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Block</span>
                    <span className="text-sm font-medium text-slate-900">{selectedUnitData.blockName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Monthly Levy</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(selectedUnitData.monthlyLevy)}</span>
                  </div>
                </div>
              </Card>
            )}

            <Button type="submit" variant="primary" className="w-full" leftIcon={<Save className="w-4 h-4" />}>
              Record Move In
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function MoveInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <MoveInContent />
    </Suspense>
  );
}

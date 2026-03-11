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
  ArrowDownRight,
  Building2,
  Calendar,
  Home,
  User,
  Phone,
  ClipboardCheck,
  AlertTriangle,
  DollarSign,
  Save,
  FileText
} from 'lucide-react';
import Link from 'next/link';

function MoveOutContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || '');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  const [formData, setFormData] = useState({
    noticeDate: '',
    moveOutDate: '',
    finalInspection: false,
    damageRecorded: false,
    damageNotes: '',
    depositReturned: false,
    depositReturnAmount: '',
    outstandingRent: '',
    outstandingLevies: '',
    notes: ''
  });
  
  const estate = demoEstates.find(e => e.id === selectedEstate);
  const units = demoEstateUnits.filter(u => u.estateId === selectedEstate && (u.status === 'occupied' || u.status === 'owner_occupied'));
  const selectedUnitData = demoEstateUnits.find(u => u.id === selectedUnit);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Move out recorded successfully! (Demo Mode)');
  };

  return (
    <DashboardLayout title="New Move Out">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <Link href="/estate-moves" className="hover:text-slate-700">Move Management</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">New Move Out</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Process Move Out</h1>
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
                      <option value="">Choose an occupied unit</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>
                          Unit {u.unitNumber} {u.blockName ? `(${u.blockName})` : ''} - {u.tenantName || u.ownerName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Move Out Dates" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notice Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.noticeDate}
                      onChange={(e) => setFormData({ ...formData, noticeDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Move Out Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.moveOutDate}
                      onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Financial Settlement" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Outstanding Rent</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.outstandingRent}
                        onChange={(e) => setFormData({ ...formData, outstandingRent: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Outstanding Levies</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.outstandingLevies}
                        onChange={(e) => setFormData({ ...formData, outstandingLevies: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deposit Return Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.depositReturnAmount}
                      onChange={(e) => setFormData({ ...formData, depositReturnAmount: e.target.value })}
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
                    checked={formData.finalInspection}
                    onChange={(e) => setFormData({ ...formData, finalInspection: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Final Inspection Done</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.damageRecorded}
                    onChange={(e) => setFormData({ ...formData, damageRecorded: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Damage Recorded</span>
                  </div>
                </label>
                
                {formData.damageRecorded && (
                  <div className="ml-7">
                    <textarea
                      value={formData.damageNotes}
                      onChange={(e) => setFormData({ ...formData, damageNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      placeholder="Describe damage..."
                    />
                  </div>
                )}
                
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.depositReturned}
                    onChange={(e) => setFormData({ ...formData, depositReturned: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Deposit Returned</span>
                  </div>
                </label>
              </div>
            </Card>

            {selectedUnitData && (
              <Card className="bg-danger-50 border-danger-200">
                <CardHeader title="Unit Summary" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Unit Number</span>
                    <span className="text-sm font-medium text-slate-900">{selectedUnitData.unitNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Current Resident</span>
                    <span className="text-sm font-medium text-slate-900">{selectedUnitData.tenantName || selectedUnitData.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Phone</span>
                    <span className="text-sm font-medium text-slate-900">{selectedUnitData.tenantPhone || selectedUnitData.ownerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Outstanding</span>
                    <span className="text-sm font-medium text-danger-600">{formatCurrency(selectedUnitData.outstandingLevy)}</span>
                  </div>
                </div>
              </Card>
            )}

            <Button type="submit" variant="primary" className="w-full" leftIcon={<Save className="w-4 h-4" />}>
              Process Move Out
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function MoveOutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <MoveOutContent />
    </Suspense>
  );
}

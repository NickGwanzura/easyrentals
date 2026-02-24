'use client';

import React, { useState, Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  demoEstateMoveIns,
  demoEstateMoveOuts,
  demoEstates
} from '@/lib/mockData/estate-management';
import { 
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Building2,
  Calendar,
  Home,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

function EstateMovesContent() {
  const [activeTab, setActiveTab] = useState<'move-ins' | 'move-outs'>('move-ins');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Combine move-ins and move-outs for display
  const moveIns = demoEstateMoveIns.filter(m => 
    m.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const moveOuts = demoEstateMoveOuts.filter(m => 
    m.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Move In/Out Management">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Estate Management</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">Move Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Move In/Out Management</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/estate-moves/move-in">
              <Button leftIcon={<ArrowUpRight className="w-4 h-4" />} variant="outline">
                New Move In
              </Button>
            </Link>
            <Link href="/estate-moves/move-out">
              <Button leftIcon={<ArrowDownRight className="w-4 h-4" />} variant="primary">
                New Move Out
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Move Ins</p>
                <p className="text-lg font-bold text-slate-900">{demoEstateMoveIns.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Move Outs</p>
                <p className="text-lg font-bold text-slate-900">{demoEstateMoveOuts.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-lg font-bold text-slate-900">
                  {demoEstateMoveOuts.filter(m => !m.finalInspection).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-lg font-bold text-slate-900">
                  {demoEstateMoveIns.filter(m => m.documentsSigned).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('move-ins')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'move-ins'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Move Ins ({moveIns.length})
            </button>
            <button
              onClick={() => setActiveTab('move-outs')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'move-outs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Move Outs ({moveOuts.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by resident name or unit number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
          {activeTab === 'move-ins' ? (
            <>
              <CardHeader title={`${moveIns.length} Move In Records`} />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Resident</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Move In Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Deposit</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Checklist</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {moveIns.map((moveIn) => (
                      <tr key={moveIn.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                              <Home className="w-5 h-5 text-success-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Unit {moveIn.unitNumber}</p>
                              <p className="text-xs text-slate-500">{moveIn.estateName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-slate-900">{moveIn.residentName}</p>
                          <p className="text-xs text-slate-500">{moveIn.residentPhone}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-900">{moveIn.moveInDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {moveIn.depositPaid ? (
                            <span className="text-sm text-success-600 font-medium">Paid</span>
                          ) : (
                            <span className="text-sm text-danger-600 font-medium">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {moveIn.keysIssued && <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">Keys</span>}
                            {moveIn.inspectionCompleted && <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">Inspection</span>}
                            {moveIn.documentsSigned && <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">Documents</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <CardHeader title={`${moveOuts.length} Move Out Records`} />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Resident</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Notice Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Move Out Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Checklist</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Deposit</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {moveOuts.map((moveOut) => (
                      <tr key={moveOut.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-danger-50 rounded-lg flex items-center justify-center">
                              <Home className="w-5 h-5 text-danger-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Unit {moveOut.unitNumber}</p>
                              <p className="text-xs text-slate-500">{moveOut.estateName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-slate-900">{moveOut.residentName}</p>
                          <p className="text-xs text-slate-500">{moveOut.residentPhone}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-900">{moveOut.noticeDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-900">{moveOut.moveOutDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {moveOut.finalInspection && <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">Inspection</span>}
                            {!moveOut.damageRecorded && <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">No Damage</span>}
                            {moveOut.depositReturned && <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">Deposit</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {moveOut.depositReturned ? (
                            <span className="text-sm text-success-600 font-medium">Returned</span>
                          ) : (
                            <span className="text-sm text-warning-600 font-medium">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function EstateMovesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EstateMovesContent />
    </Suspense>
  );
}

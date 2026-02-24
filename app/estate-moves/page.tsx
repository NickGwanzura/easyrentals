'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  demoEstateMoveIns,
  demoEstateMoveOuts,
  demoEstates,
  demoEstateUnits,
  type EstateMoveIn,
  type EstateMoveOut 
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
  Clock,
  Eye,
  User,
  Phone,
  Key,
  FileText,
  ClipboardCheck,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

function EstateMovesContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'move-ins' | 'move-outs'>('move-ins');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingMove, setViewingMove] = useState<EstateMoveIn | EstateMoveOut | null>(null);

  const moveIns = demoEstateMoveIns.filter(m => 
    m.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const moveOuts = demoEstateMoveOuts.filter(m => 
    m.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalMoveIns: demoEstateMoveIns.length,
    totalMoveOuts: demoEstateMoveOuts.length,
    pending: demoEstateMoveOuts.filter(m => !m.finalInspectionDate).length,
    completed: demoEstateMoveIns.filter(m => m.documentsSigned).length,
  };

  const isMoveIn = (move: EstateMoveIn | EstateMoveOut | null): move is EstateMoveIn => {
    return move !== null && 'moveInDate' in move;
  };

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
                <p className="text-lg font-bold text-slate-900">{stats.totalMoveIns}</p>
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
                <p className="text-lg font-bold text-slate-900">{stats.totalMoveOuts}</p>
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
                <p className="text-lg font-bold text-slate-900">{stats.pending}</p>
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
                <p className="text-lg font-bold text-slate-900">{stats.completed}</p>
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
                            <span className="text-sm text-success-600 font-medium">
                              {moveIn.depositAmount ? `$${moveIn.depositAmount}` : 'Paid'}
                            </span>
                          ) : (
                            <span className="text-sm text-danger-600 font-medium">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {moveIn.keysIssued && (
                              <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded" title="Keys Issued">
                                <Key className="w-3 h-3 inline mr-1" />
                                Keys
                              </span>
                            )}
                            {moveIn.inspectionCompleted && (
                              <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded" title="Inspection Done">
                                <ClipboardCheck className="w-3 h-3 inline mr-1" />
                                Inspection
                              </span>
                            )}
                            {moveIn.documentsSigned && (
                              <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded" title="Documents Signed">
                                <FileText className="w-3 h-3 inline mr-1" />
                                Docs
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={() => setViewingMove(moveIn)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {moveIns.length === 0 && (
                <div className="py-12 text-center">
                  <ArrowUpRight className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No move-in records</h3>
                  <p className="text-slate-500">Record a new move-in to get started</p>
                </div>
              )}
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
                            <span className="text-sm text-slate-900">{moveOut.moveOutDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {moveOut.finalInspectionDate && (
                              <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">
                                <ClipboardCheck className="w-3 h-3 inline mr-1" />
                                Inspection
                              </span>
                            )}
                            {!moveOut.damagesRecorded && (
                              <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">
                                No Damage
                              </span>
                            )}
                            {moveOut.depositRefunded && (
                              <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">
                                <DollarSign className="w-3 h-3 inline mr-1" />
                                Deposit
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {moveOut.depositRefunded ? (
                            <span className="text-sm text-success-600 font-medium">Returned</span>
                          ) : (
                            <span className="text-sm text-warning-600 font-medium">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={() => setViewingMove(moveOut)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {moveOuts.length === 0 && (
                <div className="py-12 text-center">
                  <ArrowDownRight className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No move-out records</h3>
                  <p className="text-slate-500">Record a new move-out to get started</p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* View Move Modal */}
      <Modal
        isOpen={!!viewingMove}
        onClose={() => setViewingMove(null)}
        title={viewingMove && 'moveInDate' in viewingMove ? 'Move In Details' : 'Move Out Details'}
        size="md"
      >
        {viewingMove && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isMoveIn(viewingMove) ? 'bg-success-100' : 'bg-danger-100'
              }`}>
                {isMoveIn(viewingMove) ? (
                  <ArrowUpRight className="w-6 h-6 text-success-600" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-danger-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{viewingMove.residentName}</h3>
                <p className="text-sm text-slate-500">Unit {viewingMove.unitNumber} • {viewingMove.estateName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-500">Phone</span>
                <p className="text-sm font-medium">{viewingMove.residentPhone}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Email</span>
                <p className="text-sm font-medium">{viewingMove.residentEmail || '-'}</p>
              </div>
            </div>

            {isMoveIn(viewingMove) ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Move In Date</span>
                    <p className="text-sm font-medium">{viewingMove.moveInDate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Lease Start</span>
                    <p className="text-sm font-medium">{viewingMove.leaseStartDate}</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {viewingMove.depositPaid ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Deposit {viewingMove.depositPaid ? 'Paid' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingMove.keysIssued ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Keys {viewingMove.keysIssued ? 'Issued' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingMove.inspectionCompleted ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Inspection {viewingMove.inspectionCompleted ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingMove.documentsSigned ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Documents {viewingMove.documentsSigned ? 'Signed' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Notice Date</span>
                    <p className="text-sm font-medium">{viewingMove.noticeDate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Move Out Date</span>
                    <p className="text-sm font-medium">{viewingMove.moveOutDate}</p>
                  </div>
                </div>

                {(viewingMove.outstandingRent > 0 || viewingMove.outstandingLevies > 0) && (
                  <div className="bg-danger-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-danger-800 mb-2">Outstanding Amounts</h4>
                    {viewingMove.outstandingRent > 0 && (
                      <p className="text-sm text-danger-700">Rent: ${viewingMove.outstandingRent}</p>
                    )}
                    {viewingMove.outstandingLevies > 0 && (
                      <p className="text-sm text-danger-700">Levies: ${viewingMove.outstandingLevies}</p>
                    )}
                  </div>
                )}
                
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {viewingMove.finalInspectionDate ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Final Inspection {viewingMove.finalInspectionDate ? 'Done' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!viewingMove.damagesRecorded ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Damages {viewingMove.damagesRecorded ? 'Recorded' : 'None'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingMove.depositRefunded ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-600" />
                      )}
                      <span className="text-sm">Deposit {viewingMove.depositRefunded ? 'Returned' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
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

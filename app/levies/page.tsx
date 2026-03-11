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
  type Levy,
  type LevyStatus 
} from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Save,
  X,
  Wallet
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function LeviesContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || 'all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLevy, setSelectedLevy] = useState<Levy | null>(null);
  
  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    estateId: '',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    amount: 100,
  });
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as const,
    notes: '',
  });

  let levies = demoEstateLevies;
  
  if (selectedEstate !== 'all') {
    levies = levies.filter(l => l.estateId === selectedEstate);
  }
  
  if (searchQuery) {
    levies = levies.filter(l => 
      l.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.estateName?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleGenerateLevies = (e: React.FormEvent) => {
    e.preventDefault();
    
    const estate = demoEstates.find(e => e.id === generateForm.estateId);
    if (!estate) {
      showToast('Please select an estate', 'error');
      return;
    }
    
    const units = demoEstateUnits.filter(u => u.estateId === generateForm.estateId);
    let generatedCount = 0;
    
    units.forEach(unit => {
      // Check if levy already exists for this unit/month/year
      const existing = demoEstateLevies.find(l => 
        l.unitId === unit.id && 
        l.month === generateForm.month && 
        l.year === generateForm.year
      );
      
      if (!existing) {
        const newLevy: Levy = {
          id: `levy-${Date.now()}-${unit.id}`,
          estateId: generateForm.estateId,
          estateName: estate.name,
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          blockName: unit.blockName,
          month: generateForm.month,
          year: generateForm.year,
          levyAmount: unit.monthlyLevy || generateForm.amount,
          paidAmount: 0,
          balance: unit.monthlyLevy || generateForm.amount,
          status: 'unpaid',
          dueDate: `${generateForm.year}-${String(generateForm.month + 1).padStart(2, '0')}-05`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        demoEstateLevies.push(newLevy);
        generatedCount++;
      }
    });
    
    if (generatedCount > 0) {
      showToast(`Generated ${generatedCount} levy records`, 'success');
    } else {
      showToast('No new levies to generate - records already exist', 'info');
    }
    
    setIsGenerateModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLevy) return;
    
    const levyIndex = demoEstateLevies.findIndex(l => l.id === selectedLevy.id);
    if (levyIndex === -1) return;
    
    const levy = demoEstateLevies[levyIndex];
    const newPaidAmount = levy.paidAmount + paymentForm.amount;
    const newBalance = levy.levyAmount - newPaidAmount;
    
    let newStatus: LevyStatus = 'partial';
    if (newBalance <= 0) newStatus = 'paid';
    else if (newPaidAmount === 0) newStatus = 'unpaid';
    
    demoEstateLevies[levyIndex] = {
      ...levy,
      paidAmount: newPaidAmount,
      balance: Math.max(0, newBalance),
      status: newStatus,
      paymentDate: paymentForm.paymentDate,
      updatedAt: new Date().toISOString(),
    };
    
    showToast(`Payment of ${formatCurrency(paymentForm.amount)} recorded`, 'success');
    setIsPaymentModalOpen(false);
    setSelectedLevy(null);
    setPaymentForm({
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: '',
    });
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Estate', 'Unit', 'Month', 'Year', 'Levy Amount', 'Paid', 'Balance', 'Status'];
    const rows = levies.map(l => [
      l.estateName,
      l.unitNumber,
      MONTHS[l.month],
      l.year,
      l.levyAmount,
      l.paidAmount,
      l.balance,
      l.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levies-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('Levies exported to CSV', 'success');
  };

  const openPaymentModal = (levy: Levy) => {
    setSelectedLevy(levy);
    setPaymentForm({
      ...paymentForm,
      amount: levy.balance,
    });
    setIsPaymentModalOpen(true);
  };

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
            <Button 
              leftIcon={<Download className="w-4 h-4" />} 
              variant="outline"
              onClick={handleExport}
            >
              Export
            </Button>
            <Button 
              leftIcon={<Plus className="w-4 h-4" />} 
              variant="primary"
              onClick={() => setIsGenerateModalOpen(true)}
            >
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
                <option key={i} value={i}>{m}</option>
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
                        <span className="text-sm text-slate-900">{MONTHS[levy.month]} {levy.year}</span>
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
                      {levy.status !== 'paid' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Wallet className="w-3 h-3" />}
                          onClick={() => openPaymentModal(levy)}
                        >
                          Record Payment
                        </Button>
                      )}
                      {levy.status === 'paid' && (
                        <span className="text-sm text-success-600 font-medium">Paid</span>
                      )}
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

      {/* Generate Levies Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Levies"
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateModalOpen(false)}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleGenerateLevies}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Generate
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGenerateLevies} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Estate *</label>
            <select
              required
              value={generateForm.estateId}
              onChange={(e) => setGenerateForm({ ...generateForm, estateId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose an estate</option>
              {demoEstates.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
              <select
                value={generateForm.month}
                onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
              <input
                type="number"
                value={generateForm.year}
                onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <p className="text-sm text-slate-500">
            This will generate levy records for all units in the selected estate. 
            Existing records for the same period will be skipped.
          </p>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedLevy(null);
        }}
        title={`Record Payment - Unit ${selectedLevy?.unitNumber}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPaymentModalOpen(false);
                setSelectedLevy(null);
              }}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleRecordPayment}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Record Payment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {selectedLevy && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Levy Amount</span>
                <span className="text-sm font-medium">{formatCurrency(selectedLevy.levyAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Already Paid</span>
                <span className="text-sm font-medium">{formatCurrency(selectedLevy.paidAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-sm font-medium text-slate-900">Balance Due</span>
                <span className="text-sm font-bold text-danger-600">{formatCurrency(selectedLevy.balance)}</span>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Amount *</label>
            <input
              type="number"
              required
              min="1"
              max={selectedLevy?.balance}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Date *</label>
            <input
              type="date"
              required
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>
        </form>
      </Modal>
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

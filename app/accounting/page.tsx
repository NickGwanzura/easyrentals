'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { demoEstateExpenses, demoEstates } from '@/lib/mockData/estates';
import { demoPayments } from '@/lib/mockData';
import { demoEstateLevies } from '@/lib/mockData/estate-management';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle,
  Plus, Search, Filter, Download, X, Save, CheckCircle2,
  Building2, Receipt, Wallet, BarChart2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ExpenseCategory = 'maintenance' | 'security' | 'cleaning' | 'utilities' | 'landscaping' | 'admin' | 'insurance' | 'other';

interface Expense {
  id: string;
  estateId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vendorName?: string;
  approvedBy?: string;
  notes?: string;
}

// ─── Static demo monthly P&L data ────────────────────────────────────────────

const monthlyPnL = [
  { month: 'Jan', revenue: 42500, expenses: 14200 },
  { month: 'Feb', revenue: 44100, expenses: 12800 },
  { month: 'Mar', revenue: 43800, expenses: 18500 },
  { month: 'Apr', revenue: 46200, expenses: 13100 },
  { month: 'May', revenue: 45500, expenses: 15900 },
  { month: 'Jun', revenue: 47800, expenses: 16200 },
  { month: 'Jul', revenue: 48100, expenses: 14700 },
  { month: 'Aug', revenue: 49200, expenses: 19800 },
  { month: 'Sep', revenue: 47600, expenses: 15300 },
  { month: 'Oct', revenue: 51000, expenses: 17400 },
  { month: 'Nov', revenue: 50200, expenses: 13900 },
  { month: 'Dec', revenue: 53400, expenses: 22100 },
];

const categoryColors: Record<ExpenseCategory, string> = {
  maintenance: 'bg-blue-100 text-blue-700',
  security: 'bg-red-100 text-red-700',
  cleaning: 'bg-green-100 text-green-700',
  utilities: 'bg-yellow-100 text-yellow-700',
  landscaping: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-purple-100 text-purple-700',
  insurance: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

const categoryLabels: Record<ExpenseCategory, string> = {
  maintenance: 'Maintenance',
  security: 'Security',
  cleaning: 'Cleaning',
  utilities: 'Utilities',
  landscaping: 'Landscaping',
  admin: 'Admin',
  insurance: 'Insurance',
  other: 'Other',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const blankExpense = {
  estateId: demoEstates[0]?.id || '',
  category: 'maintenance' as ExpenseCategory,
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  vendorName: '',
  notes: '',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountingPage() {
  const { showToast } = useToast();

  // local expense list (starts from mock, supports adds)
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    (demoEstateExpenses as unknown as Expense[]).slice()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [estateFilter, setEstateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses'>('overview');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(blankExpense);

  // ── Derived totals ──────────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () => monthlyPnL.reduce((s, m) => s + m.revenue, 0),
    []
  );
  const totalExpensesYTD = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const netProfit = totalRevenue - totalExpensesYTD;
  const outstandingArrears = useMemo(
    () => demoEstateLevies.filter(l => l.balance > 0).reduce((s, l) => s + l.balance, 0),
    []
  );

  // ── Filtered expenses ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        e.description.toLowerCase().includes(q) ||
        (e.vendorName || '').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      const matchEstate = estateFilter === 'all' || e.estateId === estateFilter;
      return matchSearch && matchCat && matchEstate;
    });
  }, [expenses, searchQuery, categoryFilter, estateFilter]);

  // ── Expense breakdown by category ──────────────────────────────────────────

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ cat: cat as ExpenseCategory, amt }))
      .sort((a, b) => b.amt - a.amt);
  }, [expenses]);

  // ── Income breakdown ────────────────────────────────────────────────────────

  const rentIncome = useMemo(
    () => demoPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    []
  );
  const levyIncome = useMemo(
    () => demoEstateLevies.filter(l => l.status === 'paid').reduce((s, l) => s + l.levyAmount, 0),
    []
  );

  // ── Add expense ─────────────────────────────────────────────────────────────

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      estateId: form.estateId,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount as string) || 0,
      date: form.date,
      vendorName: form.vendorName || undefined,
      notes: form.notes || undefined,
    };
    setExpenses(prev => [newExp, ...prev]);
    setAddOpen(false);
    setForm(blankExpense);
    showToast('Expense recorded successfully', 'success');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout title="Accounting">
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <BarChart2 className="w-4 h-4" />
              <span>Admin · Accounting Suite</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Accounting</h1>
            <p className="text-slate-500">Full financial overview: income, expenses and P&amp;L</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>Add Expense</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue (YTD)</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-success-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+8.3% vs last year</p>
              </div>
              <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Expenses (YTD)</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpensesYTD)}</p>
                <p className="text-xs text-danger-600 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" />+4.1% vs last year</p>
              </div>
              <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-danger-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Net Profit (YTD)</p>
                <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-xs text-slate-500 mt-1">{((netProfit / totalRevenue) * 100).toFixed(1)}% margin</p>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Outstanding Arrears</p>
                <p className="text-2xl font-bold text-warning-700 mt-1">{formatCurrency(outstandingArrears)}</p>
                <p className="text-xs text-slate-500 mt-1">Levy arrears unpaid</p>
              </div>
              <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {(['overview', 'income', 'expenses'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* P&L Chart */}
            <Card>
              <CardHeader title="Monthly Revenue vs Expenses" subtitle="Full year profit & loss overview" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPnL} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Expense breakdown by category */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title="Expenses by Category" />
                <div className="space-y-3">
                  {byCategory.map(({ cat, amt }) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-28 text-center ${categoryColors[cat]}`}>
                        {categoryLabels[cat]}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (amt / totalExpensesYTD) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-24 text-right">{formatCurrency(amt)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader title="Income Sources" />
                <div className="space-y-4">
                  {[
                    { label: 'Rental Income', icon: Building2, color: 'bg-success-50 text-success-600', amount: rentIncome },
                    { label: 'Levy Collections', icon: Wallet, color: 'bg-primary-50 text-primary-600', amount: levyIncome },
                    { label: 'Late Fees', icon: Receipt, color: 'bg-warning-50 text-warning-600', amount: 4820 },
                    { label: 'Other Income', icon: DollarSign, color: 'bg-violet-50 text-violet-600', amount: 2150 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 border-success-200 bg-success-50">
                    <span className="text-sm font-bold text-success-800">Total Income</span>
                    <span className="text-base font-bold text-success-800">{formatCurrency(rentIncome + levyIncome + 4820 + 2150)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── INCOME TAB ── */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Rent Payments Received" subtitle={`${demoPayments.filter(p => p.status === 'paid').length} paid transactions`} />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Tenant', 'Property', 'Amount', 'Date', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {demoPayments.filter(p => p.status === 'paid').slice(0, 20).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">{p.tenantId}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{p.propertyId}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{formatDate(p.paidDate || p.dueDate)}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-100 text-success-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── EXPENSES TAB ── */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <select
                  value={estateFilter}
                  onChange={e => setEstateFilter(e.target.value)}
                  className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Estates</option>
                  {demoEstates.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>
            </Card>

            <Card>
              <CardHeader
                title={`${filtered.length} Expenses`}
                subtitle={`Total: ${formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}`}
              />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Description', 'Category', 'Estate', 'Vendor', 'Date', 'Amount'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(exp => {
                      const estate = demoEstates.find(e => e.id === exp.estateId);
                      return (
                        <tr key={exp.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{exp.description}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[exp.category as ExpenseCategory] || 'bg-gray-100 text-gray-700'}`}>
                              {categoryLabels[exp.category as ExpenseCategory] || exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{estate?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">{exp.vendorName || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">{formatDate(exp.date)}</td>
                          <td className="py-3 px-4 text-sm font-bold text-danger-700">{formatCurrency(exp.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="py-12 text-center">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No expenses match your filters</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setForm(blankExpense); }}
        title="Record Expense"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" leftIcon={<X className="w-4 h-4" />} onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleAdd}>Save Expense</Button>
          </div>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estate</label>
              <select
                value={form.estateId}
                onChange={e => setForm({ ...form, estateId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {demoEstates.map(est => <option key={est.id} value={est.id}>{est.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <input
              required
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Borehole pump repair"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vendor / Supplier</label>
            <input
              type="text"
              value={form.vendorName}
              onChange={e => setForm({ ...form, vendorName: e.target.value })}
              placeholder="e.g. Trojan Construction"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

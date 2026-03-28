'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { demoRentalInvoices, getBillingSummary, RentalInvoice, InvoiceStatus } from '@/lib/mockData/billing';
import { demoEstates } from '@/lib/mockData/estate-management';
import {
  FileText, DollarSign, CheckCircle2, AlertCircle, Clock,
  Search, Filter, Download, Plus, Eye, ChevronDown,
} from 'lucide-react';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid:     'bg-green-100 text-green-700',
  unpaid:   'bg-yellow-100 text-yellow-700',
  overdue:  'bg-red-100 text-red-700',
  partial:  'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid:    'Paid',
  unpaid:  'Unpaid',
  overdue: 'Overdue',
  partial: 'Partial',
};

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const PERIODS = [
  { label: 'March 2026',   month: 3,  year: 2026 },
  { label: 'February 2026', month: 2, year: 2026 },
  { label: 'January 2026', month: 1,  year: 2026 },
  { label: 'December 2025', month: 12, year: 2025 },
  { label: 'All Periods',  month: 0,  year: 0 },
];

export default function BillingPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [estateFilter, setEstateFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState(PERIODS[0]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const filteredInvoices = useMemo(() => {
    return demoRentalInvoices.filter(inv => {
      if (periodFilter.month !== 0 && (inv.month !== periodFilter.month || inv.year !== periodFilter.year)) return false;
      if (estateFilter !== 'all' && inv.estateId !== estateFilter) return false;
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!inv.tenantName.toLowerCase().includes(q) &&
            !inv.unitNumber.toLowerCase().includes(q) &&
            !inv.invoiceNumber.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, statusFilter, estateFilter, periodFilter]);

  const summary = useMemo(() => getBillingSummary(filteredInvoices), [filteredInvoices]);

  const handleGenerateInvoices = () => {
    setGeneratedSuccess(true);
    setTimeout(() => {
      setShowGenerateModal(false);
      setGeneratedSuccess(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rental Billing</h1>
            <p className="text-slate-500 text-sm mt-0.5">Generate and track rent + levy invoices for all estate units</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Invoices
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Billed"
            value={fmt(summary.totalBilled)}
            icon={<FileText className="w-5 h-5" />}
            color="bg-blue-50 text-blue-600"
          />
          <KpiCard
            label="Collected"
            value={fmt(summary.totalCollected)}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="bg-green-50 text-green-600"
          />
          <KpiCard
            label="Outstanding"
            value={fmt(summary.totalOutstanding)}
            icon={<Clock className="w-5 h-5" />}
            color="bg-yellow-50 text-yellow-600"
          />
          <KpiCard
            label={`Overdue (${summary.overdueCount})`}
            value={fmt(summary.overdueAmount)}
            icon={<AlertCircle className="w-5 h-5" />}
            color="bg-red-50 text-red-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tenant, unit, invoice…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Period */}
            <div className="relative">
              <select
                value={`${periodFilter.month}-${periodFilter.year}`}
                onChange={e => {
                  const found = PERIODS.find(p => `${p.month}-${p.year}` === e.target.value);
                  if (found) setPeriodFilter(found);
                }}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {PERIODS.map(p => (
                  <option key={`${p.month}-${p.year}`} value={`${p.month}-${p.year}`}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Estate */}
            <div className="relative">
              <select
                value={estateFilter}
                onChange={e => setEstateFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Estates</option>
                {demoEstates.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}</p>
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Tenant</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      No invoices match your filters
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{inv.tenantName}</p>
                        <p className="text-xs text-slate-400">{inv.tenantEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{inv.unitNumber}</p>
                        <p className="text-xs text-slate-400">{inv.estateName.split(' ').slice(0, 2).join(' ')}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{inv.periodLabel}</td>
                      <td className="px-4 py-3 text-slate-600">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-right">
                        {inv.balance > 0
                          ? <span className="font-semibold text-red-600">{fmt(inv.balance)}</span>
                          : <span className="text-green-600 font-semibold">Paid</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                          {STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Invoices Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Generate Invoices</h2>
            <p className="text-sm text-slate-500 mb-6">Create rent + levy invoices for all occupied units in the selected period.</p>

            {generatedSuccess ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-semibold text-slate-800">Invoices generated!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Billing Period</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {PERIODS.filter(p => p.month !== 0).map(p => (
                        <option key={`${p.month}-${p.year}`}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estate</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All Estates</option>
                      {demoEstates.map(e => <option key={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                    <input type="date" defaultValue="2026-04-07" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Include estate levy in invoice
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Email invoices to tenants automatically
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateInvoices}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Generate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

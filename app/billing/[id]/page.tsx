'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { demoRentalInvoices } from '@/lib/mockData/billing';
import { demoEstates } from '@/lib/mockData/estate-management';
import {
  ArrowLeft, Printer, Download, CheckCircle2, AlertCircle,
  Clock, XCircle, DollarSign, Building2, User, Calendar,
} from 'lucide-react';

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    icon: CheckCircle2,  cls: 'bg-green-100 text-green-700 border-green-200' },
  unpaid:  { label: 'Unpaid',  icon: Clock,          cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  overdue: { label: 'Overdue', icon: AlertCircle,    cls: 'bg-red-100 text-red-700 border-red-200' },
  partial: { label: 'Partial', icon: DollarSign,     cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  const invoice = demoRentalInvoices.find(i => i.id === params.id);

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center py-24">
          <p className="text-slate-500">Invoice not found.</p>
          <Link href="/billing" className="text-blue-600 mt-4 inline-block">← Back to Billing</Link>
        </div>
      </DashboardLayout>
    );
  }

  const estate = demoEstates.find(e => e.id === invoice.estateId);
  const statusCfg = STATUS_CONFIG[invoice.status];
  const StatusIcon = statusCfg.icon;

  const handleRecordPayment = () => {
    setPaySuccess(true);
    setTimeout(() => {
      setShowPayModal(false);
      setPaySuccess(false);
    }, 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={() => setShowPayModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" /> Record Payment
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden print:border-none print:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">INVOICE</p>
                <h1 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
                <p className="text-blue-200 text-sm mt-1">Period: {invoice.periodLabel}</p>
              </div>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusCfg.label}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Tenant */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" /> Bill To
                </div>
                <p className="font-semibold text-slate-900">{invoice.tenantName}</p>
                <p className="text-sm text-slate-500">{invoice.tenantEmail}</p>
                {invoice.tenantPhone && <p className="text-sm text-slate-500">{invoice.tenantPhone}</p>}
                <p className="text-sm text-slate-500">Unit {invoice.unitNumber}</p>
              </div>

              {/* Estate */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Building2 className="w-3.5 h-3.5" /> Property
                </div>
                <p className="font-semibold text-slate-900">{invoice.estateName}</p>
                {estate && (
                  <>
                    <p className="text-sm text-slate-500">{estate.address}</p>
                    <p className="text-sm text-slate-500">{estate.city}, {estate.country}</p>
                  </>
                )}
              </div>

              {/* Dates */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Dates
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Issued</span>
                    <span className="font-medium text-slate-800">{invoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Due</span>
                    <span className="font-medium text-slate-800">{invoice.dueDate}</span>
                  </div>
                  {invoice.paidDate && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Paid</span>
                      <span className="font-medium text-green-700">{invoice.paidDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="pb-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">Qty</th>
                    <th className="pb-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Unit Price</th>
                    <th className="pb-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 text-slate-700">{item.description}</td>
                      <td className="py-4 text-center text-slate-500">{item.quantity}</td>
                      <td className="py-4 text-right text-slate-700">{fmt(item.unitPrice)}</td>
                      <td className="py-4 text-right font-medium text-slate-900">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800">{fmt(invoice.subtotal)}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax ({invoice.taxRate}%)</span>
                    <span className="text-slate-800">{fmt(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{fmt(invoice.totalAmount)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Amount Paid</span>
                    <span className="text-green-700 font-medium">({fmt(invoice.paidAmount)})</span>
                  </div>
                )}
                <div className={`flex justify-between text-base font-bold border-t-2 pt-2 ${invoice.balance > 0 ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'}`}>
                  <span>Balance Due</span>
                  <span>{fmt(invoice.balance)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
                <strong>Note:</strong> {invoice.notes}
              </div>
            )}

            {/* Bank Details */}
            {estate?.bankName && (
              <div className="bg-slate-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-slate-700 mb-2">Payment Details</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-slate-600">
                  <span className="text-slate-400">Bank</span><span>{estate.bankName}</span>
                  <span className="text-slate-400">Account Name</span><span>{estate.bankAccountName}</span>
                  <span className="text-slate-400">Account Number</span><span className="font-mono">{estate.bankAccountNumber}</span>
                  {estate.bankBranch && <><span className="text-slate-400">Branch</span><span>{estate.bankBranch}</span></>}
                  <span className="text-slate-400">Reference</span><span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Record Payment</h2>
            <p className="text-sm text-slate-500 mb-6">
              Invoice {invoice.invoiceNumber} · Balance: <strong className="text-red-600">{fmt(invoice.balance)}</strong>
            </p>

            {paySuccess ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-semibold text-slate-800">Payment recorded!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Paid (USD)</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      placeholder={String(invoice.balance)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="ecocash">EcoCash</option>
                      <option value="onemoney">OneMoney</option>
                      <option value="zipit">ZipIt</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Date</label>
                    <input
                      type="date"
                      defaultValue="2026-03-16"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Reference / Receipt #</label>
                    <input
                      type="text"
                      value={payRef}
                      onChange={e => setPayRef(e.target.value)}
                      placeholder="e.g. TXN-20260316-001"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecordPayment}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Confirm Payment
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

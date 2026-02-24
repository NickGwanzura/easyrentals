'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { demoEstates, demoEstateExpenses } from '@/lib/mockData/estates';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Filter, Download, DollarSign, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  maintenance: 'bg-blue-100 text-blue-700',
  security: 'bg-red-100 text-red-700',
  cleaning: 'bg-green-100 text-green-700',
  utilities: 'bg-yellow-100 text-yellow-700',
  landscaping: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-purple-100 text-purple-700',
  insurance: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function EstateExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedEstate, setSelectedEstate] = useState(demoEstates[0]);
  
  const estateExpenses = demoEstateExpenses.filter(e => e.estateId === selectedEstate.id);
  
  const filteredExpenses = estateExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardLayout title="Estate Expenses">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estate Expenses</h1>
            <p className="text-slate-500 mt-1">Track and manage estate-level expenses</p>
          </div>
          <Link href="/estate-expenses/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Expense
            </Button>
          </Link>
        </div>

        {/* Summary */}
        <Card className="bg-danger-50 border-danger-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Expenses</p>
              <p className="text-2xl font-bold text-danger-700">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedEstate.id}
              onChange={(e) => setSelectedEstate(demoEstates.find(est => est.id === e.target.value) || demoEstates[0])}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              {demoEstates.map(estate => (
                <option key={estate.id} value={estate.id}>{estate.name}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="cleaning">Cleaning</option>
              <option value="utilities">Utilities</option>
              <option value="landscaping">Landscaping</option>
              <option value="admin">Admin</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </div>
        </Card>

        {/* Expenses Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Vendor</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{formatDate(expense.expenseDate)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[expense.category] || 'bg-gray-100'}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-slate-900">{expense.description}</p>
                      {expense.notes && <p className="text-xs text-slate-500">{expense.notes}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600">{expense.vendorName}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-danger-600">-{formatCurrency(expense.amount)}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {expense.receiptUrl ? (
                        <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          <FileText className="w-5 h-5 mx-auto" />
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredExpenses.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses found</h3>
              <p className="text-slate-500">Try adjusting your filters or add a new expense.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

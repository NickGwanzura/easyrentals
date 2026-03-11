'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import { demoEstates, demoLevies, demoEstateExpenses } from '@/lib/mockData/estates';
import { formatCurrency } from '@/lib/utils';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EstateReportsPage() {
  const [selectedEstate, setSelectedEstate] = useState(demoEstates[0]);
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2024);
  
  const estateLevies = demoLevies.filter(l => l.estateId === selectedEstate.id);
  const estateExpenses = demoEstateExpenses.filter(e => e.estateId === selectedEstate.id);
  
  // Calculate report data
  const filteredLevies = reportType === 'monthly' 
    ? estateLevies.filter(l => l.month === selectedMonth && l.year === selectedYear)
    : estateLevies.filter(l => l.year === selectedYear);
    
  const filteredExpenses = reportType === 'monthly'
    ? estateExpenses.filter(e => new Date(e.expenseDate).getMonth() + 1 === selectedMonth && new Date(e.expenseDate).getFullYear() === selectedYear)
    : estateExpenses.filter(e => new Date(e.expenseDate).getFullYear() === selectedYear);
  
  const totalLevies = filteredLevies.reduce((sum, l) => sum + l.amount, 0);
  const paidLevies = filteredLevies.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.amount, 0);
  const outstandingLevies = filteredLevies.filter(l => l.status !== 'paid').reduce((sum, l) => sum + l.balance, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = paidLevies - totalExpenses;
  
  // Monthly breakdown for annual report
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthLevies = estateLevies.filter(l => l.month === month && l.year === selectedYear);
    const monthExpenses = estateExpenses.filter(e => new Date(e.expenseDate).getMonth() + 1 === month);
    return {
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      levies: monthLevies.reduce((sum, l) => sum + l.amount, 0),
      expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });

  return (
    <DashboardLayout title="Financial Reports">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
            <p className="text-slate-500 mt-1">Generate and view estate financial reports</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedEstate.id}
              onChange={(e) => setSelectedEstate(demoEstates.find(est => est.id === e.target.value) || demoEstates[0])}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              {demoEstates.map(estate => (
                <option key={estate.id} value={estate.id}>{estate.name}</option>
              ))}
            </select>
            
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'monthly' | 'annual')}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value="monthly">Monthly Report</option>
              <option value="annual">Annual Report</option>
            </select>
            
            {reportType === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
        </Card>

        {/* Report Summary */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-sm">Total Levies</p>
              <p className="text-2xl font-bold">{formatCurrency(totalLevies)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-success-400">{formatCurrency(paidLevies)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-warning-400">{formatCurrency(outstandingLevies)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Net Balance</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {formatCurrency(netBalance)}
              </p>
            </div>
          </div>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="Levy Collection" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Levies</span>
                <span className="font-semibold">{formatCurrency(totalLevies)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Collected</span>
                <span className="font-semibold text-success-600">{formatCurrency(paidLevies)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Outstanding</span>
                <span className="font-semibold text-warning-600">{formatCurrency(outstandingLevies)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Collection Rate</span>
                  <span className="font-bold text-lg">
                    {totalLevies > 0 ? ((paidLevies / totalLevies) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Expenses" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Expenses</span>
                <span className="font-semibold text-danger-600">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">By Category</p>
                {['maintenance', 'security', 'cleaning', 'utilities'].map(cat => {
                  const catExpenses = filteredExpenses.filter(e => e.category === cat);
                  const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                  return (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="capitalize text-slate-600">{cat}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Unit Statistics" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Units</span>
                <span className="font-semibold">{selectedEstate.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Paid in Full</span>
                <span className="font-semibold text-success-600">
                  {filteredLevies.filter(l => l.status === 'paid').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Partial</span>
                <span className="font-semibold text-warning-600">
                  {filteredLevies.filter(l => l.status === 'partial').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Unpaid</span>
                <span className="font-semibold text-danger-600">
                  {filteredLevies.filter(l => l.status === 'unpaid').length}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        {reportType === 'annual' && (
          <Card>
            <CardHeader title="Monthly Breakdown" />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="levies" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Levies" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

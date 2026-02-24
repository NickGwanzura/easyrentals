'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { 
  Building2, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Receipt,
  Wallet,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { demoEstates, demoLevies, demoEstateExpenses } from '@/lib/mockData/estates';
import Link from 'next/link';

export default function EstateFinancePage() {
  const [selectedEstate, setSelectedEstate] = useState(demoEstates[0]);
  
  // Filter data for selected estate
  const estateLevies = demoLevies.filter(l => l.estateId === selectedEstate.id);
  const estateExpenses = demoEstateExpenses.filter(e => e.estateId === selectedEstate.id);
  
  // Calculate stats
  const totalLevies = estateLevies.reduce((sum, l) => sum + l.amount, 0);
  const collectedLevies = estateLevies.reduce((sum, l) => sum + l.amountPaid, 0);
  const outstandingLevies = estateLevies.reduce((sum, l) => sum + l.balance, 0);
  const totalExpenses = estateExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = collectedLevies - totalExpenses;
  
  const collectionRate = totalLevies > 0 ? (collectedLevies / totalLevies) * 100 : 0;
  
  // Monthly data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = i + 1;
    const monthLevies = estateLevies.filter(l => l.month === month);
    const monthExpenses = estateExpenses.filter(e => {
      const expMonth = new Date(e.expenseDate).getMonth() + 1;
      return expMonth === month;
    });
    
    return {
      month: new Date(2024, month - 1).toLocaleString('default', { month: 'short' }),
      levies: monthLevies.reduce((sum, l) => sum + l.amount, 0),
      collected: monthLevies.reduce((sum, l) => sum + l.amountPaid, 0),
      expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });
  
  // Status breakdown
  const statusData = [
    { name: 'Paid', value: estateLevies.filter(l => l.status === 'paid').length, color: '#22c55e' },
    { name: 'Partial', value: estateLevies.filter(l => l.status === 'partial').length, color: '#f59e0b' },
    { name: 'Unpaid', value: estateLevies.filter(l => l.status === 'unpaid').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout title="Estate Finance">
      <div className="space-y-6 animate-fade-in">
        {/* Estate Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estate Financial Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage levies, expenses, and budgets</p>
          </div>
          <select
            value={selectedEstate.id}
            onChange={(e) => {
              const estate = demoEstates.find(est => est.id === e.target.value);
              if (estate) setSelectedEstate(estate);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            {demoEstates.map(estate => (
              <option key={estate.id} value={estate.id}>{estate.name}</option>
            ))}
          </select>
        </div>

        {/* Estate Info Card */}
        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{selectedEstate.name}</h2>
              <p className="text-primary-100">{selectedEstate.address}, {selectedEstate.city}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-primary-100">
                <span>{selectedEstate.totalUnits} Units</span>
                <span>•</span>
                <span>Levy: {formatCurrency(selectedEstate.defaultLevyAmount)}/month</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/estates/budget">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white backdrop-blur-sm">
                  Budget
                </button>
              </Link>
              <Link href="/estates/reports">
                <button className="px-4 py-2 bg-white text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-50">
                  Reports
                </button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Levies"
            value={formatCurrency(totalLevies)}
            icon={Receipt}
            iconColor="text-primary-600"
            iconBgColor="bg-primary-50"
          />
          <StatCard
            title="Collected"
            value={formatCurrency(collectedLevies)}
            change={parseFloat(collectionRate.toFixed(1))}
            changeLabel="collection rate"
            icon={Wallet}
            iconColor="text-success-600"
            iconBgColor="bg-success-50"
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(outstandingLevies)}
            icon={AlertCircle}
            iconColor="text-warning-600"
            iconBgColor="bg-warning-50"
          />
          <StatCard
            title="Net Balance"
            value={formatCurrency(netBalance)}
            icon={TrendingUp}
            iconColor={netBalance >= 0 ? 'text-success-600' : 'text-danger-600'}
            iconBgColor={netBalance >= 0 ? 'bg-success-50' : 'bg-danger-50'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader title="Monthly Levies & Expenses" />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="levies" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Levies" />
                  <Bar dataKey="collected" fill="#22c55e" radius={[4, 4, 0, 0]} name="Collected" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Levy Status" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-slate-600">{s.name}</span>
                  </div>
                  <span className="text-sm font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/estates/levies">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <p className="text-sm font-medium">Manage Levies</p>
            </Card>
          </Link>
          <Link href="/estate-expenses">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-danger-600" />
              <p className="text-sm font-medium">Expenses</p>
            </Card>
          </Link>
          <Link href="/estates/arrears">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-warning-600" />
              <p className="text-sm font-medium">Arrears</p>
            </Card>
          </Link>
          <Link href="/owners/statements">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-success-600" />
              <p className="text-sm font-medium">Statements</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

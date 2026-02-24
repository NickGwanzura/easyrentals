'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth } from '@/lib/auth/context';
import Card, { CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2,
  ArrowUpRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 52000, expenses: 30000 },
  { month: 'Mar', revenue: 48000, expenses: 27500 },
  { month: 'Apr', revenue: 61000, expenses: 32000 },
  { month: 'May', revenue: 55000, expenses: 29000 },
  { month: 'Jun', revenue: 67000, expenses: 35000 },
];

const occupancyData = [
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 87 },
  { month: 'Mar', rate: 86 },
  { month: 'Apr', rate: 90 },
  { month: 'May', rate: 92 },
  { month: 'Jun', rate: 94 },
];

export default function AnalyticsPage() {
  const { user } = useRequireAuth(['admin', 'landlord']);
  
  if (!user) return null;

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">Insights into your portfolio performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(328000)}
            change={12.5}
            icon={DollarSign}
            iconColor="text-success-600"
            iconBgColor="bg-success-50"
          />
          <StatCard
            title="Net Income"
            value={formatCurrency(187000)}
            change={8.2}
            icon={TrendingUp}
            iconColor="text-primary-600"
            iconBgColor="bg-primary-50"
          />
          <StatCard
            title="Avg. Occupancy"
            value="89%"
            change={3.1}
            icon={Building2}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
          <StatCard
            title="Tenant Retention"
            value="94%"
            change={1.5}
            icon={Users}
            iconColor="text-warning-600"
            iconBgColor="bg-warning-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Revenue vs Expenses" />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Occupancy Rate Trend" />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    name="Occupancy Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="Top Performing Properties" />
            <div className="space-y-3">
              {[
                { name: 'Modern Downtown Loft', revenue: 42000, change: 8 },
                { name: 'Luxury Waterfront Condo', revenue: 50400, change: 12 },
                { name: 'Executive Penthouse', revenue: 102000, change: 15 },
              ].map((property, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{property.name}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(property.revenue)} / year</p>
                  </div>
                  <div className="flex items-center gap-1 text-success-600 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    {property.change}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent Expenses" />
            <div className="space-y-3">
              {[
                { category: 'Maintenance', amount: 4500, change: -5 },
                { category: 'Utilities', amount: 3200, change: 2 },
                { category: 'Insurance', amount: 2800, change: 0 },
                { category: 'Marketing', amount: 1200, change: -12 },
              ].map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900">{expense.category}</p>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(expense.amount)}</p>
                    <p className={`text-xs ${expense.change > 0 ? 'text-danger-600' : expense.change < 0 ? 'text-success-600' : 'text-slate-500'}`}>
                      {expense.change > 0 ? '+' : ''}{expense.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Key Metrics" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Avg. Days to Lease</span>
                <span className="font-semibold text-slate-900">18 days</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Tenant Satisfaction</span>
                <span className="font-semibold text-slate-900">4.8/5.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-success-500 h-2 rounded-full" style={{ width: '96%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Maintenance Response</span>
                <span className="font-semibold text-slate-900">2.4 hours</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-warning-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

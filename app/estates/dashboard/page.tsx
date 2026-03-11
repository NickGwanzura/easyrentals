'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import { 
  demoEstates, 
  demoEstateUnits, 
  demoEstateLevies, 
  demoEstateMoveIns,
  demoEstateMoveOuts 
} from '@/lib/mockData/estate-management';
import { formatCurrency } from '@/lib/utils';
import { 
  Building2, 
  Users, 
  Home, 
  DollarSign, 
  Wrench,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6'];

function EstateDashboardContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('id') || demoEstates[0].id;
  const estate = demoEstates.find(e => e.id === estateId) || demoEstates[0];
  
  // Get estate data
  const units = demoEstateUnits.filter(u => u.estateId === estate.id);
  const levies = demoEstateLevies.filter(l => l.estateId === estate.id);
  const moveIns = demoEstateMoveIns.filter(m => m.estateId === estate.id);
  const moveOuts = demoEstateMoveOuts.filter(m => m.estateId === estate.id);
  
  // Calculate stats
  const totalUnits = units.length;
  const occupied = units.filter(u => u.status === 'occupied').length;
  const vacant = units.filter(u => u.status === 'vacant').length;
  const ownerOccupied = units.filter(u => u.status === 'owner_occupied').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
  
  const monthlyCollected = levies.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.paidAmount, 0);
  const outstanding = levies.filter(l => l.status !== 'paid').reduce((sum, l) => sum + l.balance, 0);
  
  // Status data for pie chart
  const statusData = [
    { name: 'Occupied', value: occupied, color: '#22c55e' },
    { name: 'Vacant', value: vacant, color: '#f59e0b' },
    { name: 'Owner Occupied', value: ownerOccupied, color: '#3b82f6' },
  ].filter(d => d.value > 0);
  
  // Monthly levy data
  const monthlyData = [
    { month: 'Jan', collected: monthlyCollected * 0.8, outstanding: outstanding * 0.6 },
    { month: 'Feb', collected: monthlyCollected * 0.9, outstanding: outstanding * 0.8 },
    { month: 'Mar', collected: monthlyCollected, outstanding: outstanding },
  ];

  return (
    <DashboardLayout title={`${estate.name} - Dashboard`}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Estate Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{estate.name}</h1>
            <p className="text-slate-500">{estate.address}, {estate.city}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/estates?id=${estate.id}`}>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                Back to Estates
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Units"
            value={totalUnits}
            icon={Home}
            iconColor="text-primary-600"
            iconBgColor="bg-primary-50"
          />
          <StatCard
            title="Occupied"
            value={occupied}
            change={occupancyRate}
            changeLabel="occupancy rate"
            icon={Users}
            iconColor="text-success-600"
            iconBgColor="bg-success-50"
          />
          <StatCard
            title="Monthly Collected"
            value={formatCurrency(monthlyCollected)}
            icon={DollarSign}
            iconColor="text-warning-600"
            iconBgColor="bg-warning-50"
          />
          <StatCard
            title="Outstanding Levies"
            value={formatCurrency(outstanding)}
            icon={TrendingDown}
            iconColor="text-danger-600"
            iconBgColor="bg-danger-50"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Occupancy Chart */}
          <Card>
            <CardHeader title="Unit Occupancy" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Levy Collection Chart */}
          <Card className="lg:col-span-2">
            <CardHeader title="Levy Collection Trend" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="collected" fill="#22c55e" radius={[4, 4, 0, 0]} name="Collected" />
                  <Bar dataKey="outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Outstanding" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Moves */}
          <Card>
            <CardHeader title="Recent Activity" />
            <div className="space-y-3">
              {moveIns.slice(0, 3).map((moveIn) => (
                <div key={moveIn.id} className="flex items-center gap-3 p-3 bg-success-50 rounded-lg">
                  <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Move In - Unit {moveIn.unitNumber}</p>
                    <p className="text-xs text-slate-500">{moveIn.residentName}</p>
                  </div>
                  <span className="text-xs text-slate-400">{moveIn.moveInDate}</span>
                </div>
              ))}
              {moveOuts.slice(0, 2).map((moveOut) => (
                <div key={moveOut.id} className="flex items-center gap-3 p-3 bg-danger-50 rounded-lg">
                  <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-danger-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Move Out - Unit {moveOut.unitNumber}</p>
                    <p className="text-xs text-slate-500">{moveOut.residentName}</p>
                  </div>
                  <span className="text-xs text-slate-400">{moveOut.moveOutDate}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/estates/estate-units?estate=${estate.id}`}>
                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                  <Home className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <p className="text-sm font-medium text-slate-900">View Units</p>
                </div>
              </Link>
              <Link href={`/levies?estate=${estate.id}`}>
                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-success-600" />
                  <p className="text-sm font-medium text-slate-900">Manage Levies</p>
                </div>
              </Link>
              <Link href={`/estate-moves/move-in?estate=${estate.id}`}>
                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                  <ArrowUpRight className="w-8 h-8 mx-auto mb-2 text-warning-600" />
                  <p className="text-sm font-medium text-slate-900">New Move In</p>
                </div>
              </Link>
              <Link href={`/estate-moves/move-out?estate=${estate.id}`}>
                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-center">
                  <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 text-danger-600" />
                  <p className="text-sm font-medium text-slate-900">Process Move Out</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function EstateDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EstateDashboardContent />
    </Suspense>
  );
}

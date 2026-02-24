'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import { demoEstates, demoLevyArrears } from '@/lib/mockData/estates';
import { ArrearsRiskLevel } from '@/types/estate';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Bell, Mail, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';

const riskConfig: Record<ArrearsRiskLevel, { color: string; bg: string; icon: typeof AlertCircle; label: string }> = {
  low: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Bell, label: 'Low Risk' },
  medium: { color: 'text-warning-600', bg: 'bg-warning-50', icon: AlertCircle, label: 'Medium Risk' },
  high: { color: 'text-danger-600', bg: 'bg-danger-50', icon: AlertTriangle, label: 'High Risk' },
  critical: { color: 'text-purple-600', bg: 'bg-purple-50', icon: AlertTriangle, label: 'Critical' },
};

export default function LevyArrearsPage() {
  const [selectedEstate, setSelectedEstate] = useState(demoEstates[0]);
  const [riskFilter, setRiskFilter] = useState<ArrearsRiskLevel | 'all'>('all');
  
  const estateArrears = demoLevyArrears.filter(a => a.estateId === selectedEstate.id);
  
  const filteredArrears = riskFilter === 'all' 
    ? estateArrears 
    : estateArrears.filter(a => a.riskLevel === riskFilter);
  
  const totalOutstanding = estateArrears.reduce((sum, a) => sum + a.totalOutstanding, 0);
  const criticalCount = estateArrears.filter(a => a.riskLevel === 'critical').length;
  const highCount = estateArrears.filter(a => a.riskLevel === 'high').length;

  return (
    <DashboardLayout title="Levy Arrears">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Levy Arrears Tracking</h1>
            <p className="text-slate-500 mt-1">Monitor and manage outstanding levies</p>
          </div>
          <select
            value={selectedEstate.id}
            onChange={(e) => setSelectedEstate(demoEstates.find(est => est.id === e.target.value) || demoEstates[0])}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            {demoEstates.map(estate => (
              <option key={estate.id} value={estate.id}>{estate.name}</option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-danger-50 border-danger-100">
            <div className="text-center">
              <p className="text-sm text-slate-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-danger-700">{formatCurrency(totalOutstanding)}</p>
            </div>
          </Card>
          <Card className="bg-purple-50 border-purple-100">
            <div className="text-center">
              <p className="text-sm text-slate-600">Critical</p>
              <p className="text-2xl font-bold text-purple-700">{criticalCount}</p>
            </div>
          </Card>
          <Card className="bg-warning-50 border-warning-100">
            <div className="text-center">
              <p className="text-sm text-slate-600">High Risk</p>
              <p className="text-2xl font-bold text-warning-700">{highCount}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-slate-600">Total in Arrears</p>
              <p className="text-2xl font-bold text-slate-900">{estateArrears.length}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${riskFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              All
            </button>
            {(['critical', 'high', 'medium', 'low'] as ArrearsRiskLevel[]).map(risk => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${riskFilter === risk ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {risk}
              </button>
            ))}
          </div>
        </Card>

        {/* Arrears List */}
        <div className="space-y-4">
          {filteredArrears.map((arrear) => {
            const risk = riskConfig[arrear.riskLevel];
            const RiskIcon = risk.icon;
            
            return (
              <Card key={arrear.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${risk.bg} flex items-center justify-center flex-shrink-0`}>
                      <RiskIcon className={`w-6 h-6 ${risk.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">Unit {arrear.unitNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
                          {risk.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{arrear.ownerName}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {arrear.ownerEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {arrear.ownerPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:items-end gap-2">
                    <p className="text-2xl font-bold text-danger-600">{formatCurrency(arrear.totalOutstanding)}</p>
                    <p className="text-sm text-slate-500">{arrear.monthsOverdue} months overdue</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Remind
                      </Button>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Unpaid Levies */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Unpaid Levies</p>
                  <div className="flex flex-wrap gap-2">
                    {arrear.unpaidLevies.map((levy) => (
                      <div key={levy.levyId} className="px-3 py-1 bg-slate-100 rounded-lg text-sm">
                        <span className="text-slate-600">
                          {new Date(levy.year, levy.month - 1).toLocaleString('default', { month: 'short' })} {levy.year}:
                        </span>
                        <span className="font-medium text-slate-900 ml-1">{formatCurrency(levy.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
          
          {filteredArrears.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Arrears Found</h3>
              <p className="text-slate-500">All levies are up to date for this estate.</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

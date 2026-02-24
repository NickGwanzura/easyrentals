'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { demoEstates, demoOwnerStatements } from '@/lib/mockData/estates';
import { formatCurrency } from '@/lib/utils';
import { FileText, Download, Mail, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OwnerStatementsPage() {
  const [selectedEstate, setSelectedEstate] = useState(demoEstates[0]);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2024);
  
  const estateStatements = demoOwnerStatements.filter(
    s => s.estateId === selectedEstate.id && s.month === selectedMonth && s.year === selectedYear
  );

  return (
    <DashboardLayout title="Owner Statements">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Owner Statements</h1>
            <p className="text-slate-500 mt-1">Generate and manage owner levy statements</p>
          </div>
          <Button leftIcon={<FileText className="w-4 h-4" />}>
            Generate Statements
          </Button>
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

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-slate-600">Total Statements</p>
            <p className="text-2xl font-bold text-slate-900">{estateStatements.length}</p>
          </Card>
          <Card className="bg-success-50">
            <p className="text-sm text-slate-600">Paid</p>
            <p className="text-2xl font-bold text-success-700">
              {estateStatements.filter(s => s.status === 'paid').length}
            </p>
          </Card>
          <Card className="bg-warning-50">
            <p className="text-sm text-slate-600">Outstanding</p>
            <p className="text-2xl font-bold text-warning-700">
              {estateStatements.filter(s => s.status !== 'paid').length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Total Value</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(estateStatements.reduce((sum, s) => sum + s.totalCharged, 0))}
            </p>
          </Card>
        </div>

        {/* Statements Table */}
        <Card>
          <CardHeader 
            title={`${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear} Statements`}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Owner</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Levies</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Paid</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Balance</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estateStatements.map((statement) => (
                  <tr key={statement.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-900">Unit {statement.unitNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900">{statement.ownerName}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-sm text-slate-900">{formatCurrency(statement.leviesCharged)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-sm text-success-600">{formatCurrency(statement.leviesPaid)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className={`text-sm font-medium ${statement.totalBalance > 0 ? 'text-danger-600' : 'text-slate-900'}`}>
                        {formatCurrency(statement.totalBalance)}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        statement.status === 'paid' ? 'bg-success-100 text-success-700' :
                        statement.status === 'viewed' ? 'bg-primary-100 text-primary-700' :
                        statement.status === 'sent' ? 'bg-warning-100 text-warning-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {statement.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {statement.status === 'sent' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {estateStatements.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Statements Found</h3>
              <p className="text-slate-500">Generate statements for this period to see them here.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

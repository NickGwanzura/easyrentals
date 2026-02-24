'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import { demoEstates, demoEstateBudgets, demoEstateExpenses } from '@/lib/mockData/estates';
import { BudgetCategory } from '@/types/estate';
import { formatCurrency } from '@/lib/utils';
import { Wallet, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

const categoryLabels: Record<BudgetCategory, string> = {
  maintenance: 'Maintenance',
  security: 'Security',
  cleaning: 'Cleaning',
  utilities: 'Utilities',
  landscaping: 'Landscaping',
  admin: 'Administration',
  insurance: 'Insurance',
  other: 'Other',
};

const categoryColors: Record<BudgetCategory, string> = {
  maintenance: 'bg-blue-500',
  security: 'bg-red-500',
  cleaning: 'bg-green-500',
  utilities: 'bg-yellow-500',
  landscaping: 'bg-emerald-500',
  admin: 'bg-purple-500',
  insurance: 'bg-pink-500',
  other: 'bg-gray-500',
};

export default function EstateBudgetPage() {
  const [selectedEstate, setSelectedEstate] = useState(demoEstates[0]);
  const [selectedMonth, setSelectedMonth] = useState(2); // February
  
  const budget = demoEstateBudgets.find(
    b => b.estateId === selectedEstate.id && b.month === selectedMonth && b.year === 2024
  );
  
  const expenses = demoEstateExpenses.filter(e => {
    const expMonth = new Date(e.expenseDate).getMonth() + 1;
    return e.estateId === selectedEstate.id && expMonth === selectedMonth;
  });

  const categories: BudgetCategory[] = ['maintenance', 'security', 'cleaning', 'utilities', 'landscaping', 'admin', 'insurance', 'other'];

  return (
    <DashboardLayout title="Estate Budget">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500 mt-1">Track planned vs actual spending</p>
          </div>
          <div className="flex gap-3">
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
          </div>
        </div>

        {/* Summary Cards */}
        {budget && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-primary-50 border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Budgeted</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(budget.totalBudgeted)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-danger-50 border-danger-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-danger-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Actual</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(budget.totalActual)}</p>
                </div>
              </div>
            </Card>
            <Card className={budget.totalVariance >= 0 ? 'bg-success-50 border-success-100' : 'bg-warning-50 border-warning-100'}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${budget.totalVariance >= 0 ? 'bg-success-100' : 'bg-warning-100'}`}>
                  {budget.totalVariance >= 0 ? (
                    <CheckCircle2 className="w-6 h-6 text-success-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-warning-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Variance</p>
                  <p className={`text-2xl font-bold ${budget.totalVariance >= 0 ? 'text-success-700' : 'text-warning-700'}`}>
                    {formatCurrency(budget.totalVariance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Budget vs Actual Table */}
        <Card>
          <CardHeader title="Budget vs Actual by Category" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Budgeted</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actual</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Variance</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => {
                  const catData = budget?.budgets[category];
                  const variance = catData ? catData.budgeted - catData.actual : 0;
                  const percentUsed = catData ? (catData.actual / catData.budgeted) * 100 : 0;
                  
                  return (
                    <tr key={category} className="hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`} />
                          <span className="font-medium text-slate-900">{categoryLabels[category]}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600">
                        {catData ? formatCurrency(catData.budgeted) : formatCurrency(0)}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600">
                        {catData ? formatCurrency(catData.actual) : formatCurrency(0)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={variance >= 0 ? 'text-success-600' : 'text-danger-600'}>
                          {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${percentUsed > 100 ? 'bg-danger-500' : percentUsed > 80 ? 'bg-warning-500' : 'bg-success-500'}`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-12 text-right">{percentUsed.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader title="Recent Expenses" />
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{expense.description}</p>
                  <p className="text-xs text-slate-500 capitalize">{expense.category} • {expense.vendorName}</p>
                </div>
                <p className="font-semibold text-danger-600">-{formatCurrency(expense.amount)}</p>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No expenses this month</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

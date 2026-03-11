'use client';

import React from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
}

const defaultData: RevenueData[] = [
  { month: 'Jan', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 52000, expenses: 30000 },
  { month: 'Mar', revenue: 48000, expenses: 27500 },
  { month: 'Apr', revenue: 61000, expenses: 32000 },
  { month: 'May', revenue: 55000, expenses: 29000 },
  { month: 'Jun', revenue: 67000, expenses: 35000 },
  { month: 'Jul', revenue: 71000, expenses: 38000 },
  { month: 'Aug', revenue: 68000, expenses: 36000 },
  { month: 'Sep', revenue: 74000, expenses: 40000 },
  { month: 'Oct', revenue: 78000, expenses: 42000 },
  { month: 'Nov', revenue: 82000, expenses: 45000 },
  { month: 'Dec', revenue: 85000, expenses: 46000 },
];

export default function RevenueChart({ data = defaultData }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader 
        title="Revenue Overview"
        subtitle="Monthly rental income vs expenses"
      />
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExpenses)" 
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-sm text-slate-600">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger-500" />
          <span className="text-sm text-slate-600">Expenses</span>
        </div>
      </div>
    </Card>
  );
}

'use client';

import React from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OccupancyData {
  name: string;
  value: number;
  color: string;
}

interface OccupancyChartProps {
  data?: OccupancyData[];
}

const defaultData: OccupancyData[] = [
  { name: 'Occupied', value: 60, color: '#22c55e' },
  { name: 'Vacant', value: 20, color: '#3b82f6' },
  { name: 'Maintenance', value: 10, color: '#f59e0b' },
  { name: 'Inactive', value: 10, color: '#64748b' },
];

export default function OccupancyChart({ data = defaultData }: OccupancyChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader title="Property Status Overview" />
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} units (${Math.round((value/total)*100)}%)`, '']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

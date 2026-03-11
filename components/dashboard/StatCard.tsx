'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-50',
  trend = 'neutral',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <Card className="card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'flex items-center text-xs font-medium',
                  isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-slate-500'
                )}
              >
                {isPositive && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                {isNegative && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-slate-400">{changeLabel}</span>
            </div>
          )}
        </div>
        
        <div className={cn('p-3 rounded-xl', iconBgColor)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </Card>
  );
}

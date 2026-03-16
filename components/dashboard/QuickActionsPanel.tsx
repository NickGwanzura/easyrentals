'use client';

import React from 'react';
import Link from 'next/link';
import Card, { CardHeader } from '@/components/ui/Card';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  toneClass: string;
}

interface QuickActionsPanelProps {
  title?: string;
  subtitle?: string;
  actions: QuickActionItem[];
}

export default function QuickActionsPanel({
  title = 'Quick Actions',
  subtitle = 'Jump straight into the work you do most often.',
  actions,
}: QuickActionsPanelProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              href={action.href}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', action.toneClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-primary-600" />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-1 text-sm text-slate-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

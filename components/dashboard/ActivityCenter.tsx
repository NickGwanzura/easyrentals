'use client';

import React from 'react';
import Link from 'next/link';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LucideIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActivityTone = 'healthy' | 'attention' | 'overdue' | 'blocked';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  tone: ActivityTone;
  icon: LucideIcon;
  meta?: string;
}

interface ActivityCenterProps {
  title?: string;
  subtitle?: string;
  items: ActivityItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}

const toneStyles: Record<ActivityTone, { badge: React.ComponentProps<typeof Badge>['variant']; icon: string }> = {
  healthy: { badge: 'success', icon: 'bg-success-50 text-success-600' },
  attention: { badge: 'warning', icon: 'bg-warning-50 text-warning-600' },
  overdue: { badge: 'danger', icon: 'bg-danger-50 text-danger-600' },
  blocked: { badge: 'outline', icon: 'bg-slate-100 text-slate-600' },
};

export default function ActivityCenter({
  title = 'Action Center',
  subtitle = 'The highest-priority items that need attention right now.',
  items,
  emptyTitle = 'Everything looks under control',
  emptyDescription = 'No urgent work is currently waiting for you.',
}: ActivityCenterProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const tone = toneStyles[item.tone];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tone.icon)}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <Badge variant={tone.badge} size="sm">
                        {item.tone}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    {item.meta && <p className="mt-1 text-xs font-medium text-slate-500">{item.meta}</p>}
                  </div>
                </div>

                <Link href={item.href} className="md:flex-shrink-0">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {item.actionLabel}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">{emptyTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
        </div>
      )}
    </Card>
  );
}

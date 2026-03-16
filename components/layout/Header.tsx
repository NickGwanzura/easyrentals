'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, ListTodo, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useWorkflow } from '@/lib/workflow/context';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { isDemoMode, user } = useAuth();
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const inboxRef = useRef<HTMLDivElement | null>(null);
  const { inbox, dismissNotification, completeTask } = useWorkflow();

  useEffect(() => {
    if (!isInboxOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(event.target as Node)) {
        setIsInboxOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInboxOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isInboxOpen]);

  return (
    <>
      {isDemoMode && (
        <div className="fixed left-64 right-0 top-0 z-50 hidden bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-center text-sm font-medium text-white shadow-md lg:block">
          Demo Mode - Data resets on refresh
        </div>
      )}

      <header
        className={cn(
          'fixed right-0 z-40 hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:flex lg:px-8',
          isDemoMode ? 'left-64 top-8' : 'left-64 top-0'
        )}
      >
        <div className="flex items-center gap-4">
          {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={inboxRef}>
            <button
              type="button"
              onClick={() => setIsInboxOpen((current) => !current)}
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              aria-label="Open notifications and tasks"
            >
              <Bell className="h-5 w-5" />
              {inbox.unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1.5 text-[10px] font-semibold text-white">
                  {inbox.unreadCount}
                </span>
              )}
            </button>

            {isInboxOpen && (
              <div className="absolute right-0 top-14 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Notifications & Tasks</p>
                  <p className="mt-1 text-xs text-slate-500">Stay on top of the work that needs attention.</p>
                </div>

                <div className="max-h-[440px] overflow-y-auto">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="mb-3 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary-600" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notifications</p>
                    </div>

                    <div className="space-y-3">
                      {inbox.notifications.length > 0 ? (
                        inbox.notifications.map((notification) => (
                          <div key={notification.id} className="rounded-2xl bg-slate-50 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                                  <Badge
                                    size="sm"
                                    variant={
                                      notification.tone === 'danger'
                                        ? 'danger'
                                        : notification.tone === 'warning'
                                          ? 'warning'
                                          : notification.tone === 'success'
                                            ? 'success'
                                            : 'info'
                                    }
                                  >
                                    {notification.tone}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">{notification.description}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => dismissNotification(notification.id)}
                                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                                aria-label="Dismiss notification"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-3">
                              <Link
                                href={notification.href}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                onClick={() => setIsInboxOpen(false)}
                              >
                                Open item
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                          No new notifications right now.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <div className="mb-3 flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-primary-600" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task Queue</p>
                    </div>

                    <div className="space-y-3">
                      {inbox.tasks.length > 0 ? (
                        inbox.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-2xl border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                              <Badge
                                size="sm"
                                variant={
                                  task.priority === 'critical'
                                    ? 'danger'
                                    : task.priority === 'high'
                                      ? 'warning'
                                      : 'outline'
                                }
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {task.ownerLabel} • Due {task.dueLabel}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <Link
                                href={task.href}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                onClick={() => setIsInboxOpen(false)}
                              >
                                Open task
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => completeTask(task.id)}
                              >
                                Mark done
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                          No outstanding tasks.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                <span className="text-sm font-medium text-primary-700">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs capitalize text-slate-500">{user.role}</p>
                  {inbox.unreadCount === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

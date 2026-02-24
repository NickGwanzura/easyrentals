'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { isDemoMode } = useAuth();

  return (
    <>
      {isDemoMode && (
        <div className="fixed top-0 left-64 right-0 z-30 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium py-2 px-4 text-center">
          🎮 Demo Mode - Data resets on refresh
        </div>
      )}
      <header className={cn(
        "h-16 bg-white border-b border-slate-200 fixed right-0 z-20 flex items-center justify-between px-4 lg:px-8",
        isDemoMode ? "top-8 left-64" : "top-0 left-64"
      )}>
        <div className="flex items-center gap-4">
          {title && (
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-48"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>
        </div>
      </header>
    </>
  );
}

'use client';

import React from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar & Top Bar */}
      <MobileSidebar />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={cn(
        "lg:ml-64 transition-all duration-300",
        "pt-16 lg:pt-0"
      )}>
        {/* Desktop Header */}
        <Header title={title} />
        
        <main className={cn(
          "p-4 lg:p-8",
          isDemoMode ? "pt-20 lg:pt-24" : "pt-20 lg:pt-20"
        )}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

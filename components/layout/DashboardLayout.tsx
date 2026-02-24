'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "lg:ml-64 transition-all duration-300",
        isDemoMode ? "pt-24" : "pt-16"
      )}>
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          title={title}
        />
        
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

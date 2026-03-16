'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { useBranding } from '@/lib/branding/context';
import {
  adminAccountingNavigation,
  estateAccountingNavigation,
  estateManagementNavigation,
  primaryNavigation,
} from './navigation';
import {
  LogOut,
  Home,
  UserCircle,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isDemoMode } = useAuth();
  const { branding } = useBranding();

  const filteredNav = primaryNavigation.filter(item => 
    user && item.roles.includes(user.role)
  );
  
  const filteredEstateManagementNav = estateManagementNavigation.filter(item => 
    user && item.roles.includes(user.role)
  );
  
  const filteredEstateAccountingNav = estateAccountingNavigation.filter(item =>
    user && item.roles.includes(user.role)
  );

  const filteredAdminAccountingNav = adminAccountingNavigation.filter(item =>
    user && item.roles.includes(user.role)
  );

  // Get logo based on branding
  const logoUrl = branding.logoUrl;
  const companyName = branding.agencyName;
  const primaryColor = branding.colors.primary;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={companyName}
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Home className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-xl font-bold text-slate-900 truncate">
            {companyName}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-[var(--brand-primary)]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              style={{
                backgroundColor: isActive ? `${primaryColor}15` : undefined,
              }}
            >
              <item.icon 
                className={cn('w-5 h-5')} 
                style={{ color: isActive ? primaryColor : undefined }}
              />
              {item.name}
            </Link>
          );
        })}
        
        {/* Estate Management Section */}
        {filteredEstateManagementNav.length > 0 && (
          <>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Estate Management
              </p>
            </div>
            {filteredEstateManagementNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-[var(--brand-primary)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  style={{
                    backgroundColor: isActive ? `${primaryColor}15` : undefined,
                  }}
                >
                  <item.icon 
                    className={cn('w-5 h-5')} 
                    style={{ color: isActive ? primaryColor : undefined }}
                  />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* Admin Accounting */}
        {filteredAdminAccountingNav.length > 0 && (
          <>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Accounting
              </p>
            </div>
            {filteredAdminAccountingNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive ? 'text-[var(--brand-primary)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  style={{ backgroundColor: isActive ? `${primaryColor}15` : undefined }}
                >
                  <item.icon className="w-5 h-5" style={{ color: isActive ? primaryColor : undefined }} />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* Estate Accounting Section */}
        {filteredEstateAccountingNav.length > 0 && (
          <>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Estate Accounting
              </p>
            </div>
            {filteredEstateAccountingNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-[var(--brand-primary)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  style={{
                    backgroundColor: isActive ? `${primaryColor}15` : undefined,
                  }}
                >
                  <item.icon 
                    className={cn('w-5 h-5')} 
                    style={{ color: isActive ? primaryColor : undefined }}
                  />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.firstName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-6 h-6" style={{ color: primaryColor }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 capitalize truncate">
              {user?.role}
              {isDemoMode && ' (Demo)'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

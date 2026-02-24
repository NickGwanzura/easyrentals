'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Home,
  UserCircle,
  ClipboardList,
  BarChart3,
  Landmark,
  Receipt,
  DollarSign,
  FileText,
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'landlord', 'agent', 'tenant'] },
  { name: 'Properties', href: '/properties', icon: Building2, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Tenants', href: '/tenants', icon: Users, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin', 'landlord', 'tenant'] },
  { name: 'Leads', href: '/leads', icon: ClipboardList, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'landlord'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'landlord', 'agent', 'tenant'] },
];

// Estate Accounting Navigation
const estateNavigation: NavItem[] = [
  { name: 'Estate Finance', href: '/estates/finance', icon: Landmark, roles: ['admin', 'landlord'] },
  { name: 'Budget', href: '/estates/budget', icon: BarChart3, roles: ['admin', 'landlord'] },
  { name: 'Expenses', href: '/estate-expenses', icon: DollarSign, roles: ['admin', 'landlord'] },
  { name: 'Arrears', href: '/estates/arrears', icon: Receipt, roles: ['admin', 'landlord'] },
  { name: 'Statements', href: '/owners/statements', icon: FileText, roles: ['admin', 'landlord'] },
  { name: 'Reports', href: '/estates/reports', icon: BarChart3, roles: ['admin', 'landlord'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isDemoMode } = useAuth();

  const filteredNav = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );
  
  const filteredEstateNav = estateNavigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">EazyRentals</span>
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
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-slate-400')} />
              {item.name}
            </Link>
          );
        })}
        
        {/* Estate Accounting Section */}
        {filteredEstateNav.length > 0 && (
          <>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Estate Accounting
              </p>
            </div>
            {filteredEstateNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-slate-400')} />
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
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-primary-600" />
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

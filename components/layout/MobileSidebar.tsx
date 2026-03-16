'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useBranding } from '@/lib/branding/context';
import { cn } from '@/lib/utils';
import {
  estateAccountingNavigation,
  estateManagementNavigation,
  primaryNavigation,
} from './navigation';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  close: () => void;
  isActive?: boolean;
}

function MenuItem({ icon, label, href, close, isActive }: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={close}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition",
        isActive 
          ? "bg-primary-50 text-primary-700" 
          : "hover:bg-slate-50 text-slate-700"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
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

  const logoUrl = branding.logoUrl;
  const companyName = branding.agencyName;
  const primaryColor = branding.colors.primary;
  const allNavItems = [
    ...primaryNavigation,
    ...estateManagementNavigation,
    ...estateAccountingNavigation,
  ];
  const currentPage = allNavItems.find(item =>
    pathname === item.href || pathname?.startsWith(`${item.href}/`)
  );

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 transition"
          aria-label="Open navigation menu"
        >
          <Menu size={22} className="text-slate-600" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            {companyName}
          </p>
          <p className="truncate text-base font-semibold text-slate-900">
            {currentPage?.name || 'Dashboard'}
          </p>
        </div>

        {isDemoMode ? (
          <div className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            Demo
          </div>
        ) : (
          <div className="w-11" />
        )}
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
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
            <span className="font-bold text-lg text-slate-900">{companyName}</span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 transition"
            aria-label="Close navigation menu"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <UserCircle className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">
            Main
          </p>

          {filteredNav.map((item) => (
            <MenuItem
              key={item.name}
              icon={<item.icon size={18} />}
              label={item.name}
              href={item.href}
              close={() => setOpen(false)}
              isActive={isActive(item.href)}
            />
          ))}

          {filteredEstateManagementNav.length > 0 && (
            <>
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
                Estate Management
              </p>
              {filteredEstateManagementNav.map((item) => (
                <MenuItem
                  key={item.name}
                  icon={<item.icon size={18} />}
                  label={item.name}
                  href={item.href}
                  close={() => setOpen(false)}
                  isActive={isActive(item.href)}
                />
              ))}
            </>
          )}

          {filteredEstateAccountingNav.length > 0 && (
            <>
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
                Estate Accounting
              </p>
              {filteredEstateAccountingNav.map((item) => (
                <MenuItem
                  key={item.name}
                  icon={<item.icon size={18} />}
                  label={item.name}
                  href={item.href}
                  close={() => setOpen(false)}
                  isActive={isActive(item.href)}
                />
              ))}
            </>
          )}
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-700 w-full transition"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText,
  Settings,
  LogOut,
  Landmark,
  Receipt,
  BarChart3,
  ClipboardList,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

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
  const { user, logout } = useAuth();

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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b bg-white">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Menu size={22} className="text-slate-600" />
        </button>

        <div className="font-bold text-lg text-slate-900">
          EazyRentals
        </div>

        <div className="w-10" />
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
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">EazyRentals</span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary-600" />
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

          <MenuItem
            icon={<Home size={18} />}
            label="Dashboard"
            href="/dashboard"
            close={() => setOpen(false)}
            isActive={isActive('/dashboard')}
          />

          <MenuItem
            icon={<Building2 size={18} />}
            label="Properties"
            href="/properties"
            close={() => setOpen(false)}
            isActive={isActive('/properties')}
          />

          <MenuItem
            icon={<Users size={18} />}
            label="Tenants"
            href="/tenants"
            close={() => setOpen(false)}
            isActive={isActive('/tenants')}
          />

          <MenuItem
            icon={<CreditCard size={18} />}
            label="Payments"
            href="/payments"
            close={() => setOpen(false)}
            isActive={isActive('/payments')}
          />

          <MenuItem
            icon={<ClipboardList size={18} />}
            label="Leads"
            href="/leads"
            close={() => setOpen(false)}
            isActive={isActive('/leads')}
          />

          {/* Estate Accounting Section */}
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Estate Accounting
          </p>

          <MenuItem
            icon={<Landmark size={18} />}
            label="Finance Dashboard"
            href="/estates/finance"
            close={() => setOpen(false)}
            isActive={isActive('/estates/finance')}
          />

          <MenuItem
            icon={<BarChart3 size={18} />}
            label="Budget"
            href="/estates/budget"
            close={() => setOpen(false)}
            isActive={isActive('/estates/budget')}
          />

          <MenuItem
            icon={<DollarSign size={18} />}
            label="Expenses"
            href="/estate-expenses"
            close={() => setOpen(false)}
            isActive={isActive('/estate-expenses')}
          />

          <MenuItem
            icon={<Receipt size={18} />}
            label="Levy Arrears"
            href="/estates/arrears"
            close={() => setOpen(false)}
            isActive={isActive('/estates/arrears')}
          />

          <MenuItem
            icon={<FileText size={18} />}
            label="Owner Statements"
            href="/owners/statements"
            close={() => setOpen(false)}
            isActive={isActive('/owners/statements')}
          />

          <MenuItem
            icon={<BarChart3 size={18} />}
            label="Reports"
            href="/estates/reports"
            close={() => setOpen(false)}
            isActive={isActive('/estates/reports')}
          />

          {/* Settings */}
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            System
          </p>

          <MenuItem
            icon={<Settings size={18} />}
            label="Settings"
            href="/settings"
            close={() => setOpen(false)}
            isActive={isActive('/settings')}
          />
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

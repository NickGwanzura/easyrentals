import { UserRole } from '@/types';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  ClipboardList,
  BarChart3,
  Landmark,
  Receipt,
  DollarSign,
  FileText,
  MapPin,
  HomeIcon,
  Wallet,
  ArrowRightLeft,
  FileCheck,
  ClipboardCheck,
  BookOpen,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export const primaryNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'landlord', 'agent', 'tenant'] },
  { name: 'Properties', href: '/properties', icon: Building2, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Tenants', href: '/tenants', icon: Users, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin', 'landlord', 'tenant'] },
  { name: 'Leads', href: '/leads', icon: ClipboardList, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Inspections', href: '/inspections', icon: ClipboardCheck, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Lease Reviews', href: '/lease-reviews', icon: FileCheck, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'landlord'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'landlord', 'agent', 'tenant'] },
];

export const estateManagementNavigation: NavItem[] = [
  { name: 'Estates', href: '/estates', icon: MapPin, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Units', href: '/estates/estate-units', icon: HomeIcon, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Levies', href: '/levies', icon: Wallet, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Moves', href: '/estate-moves', icon: ArrowRightLeft, roles: ['admin', 'landlord', 'agent'] },
  { name: 'Billing', href: '/billing', icon: Receipt, roles: ['admin', 'landlord'] },
];

export const adminAccountingNavigation: NavItem[] = [
  { name: 'Accounting', href: '/accounting', icon: BookOpen, roles: ['admin'] },
];

export const estateAccountingNavigation: NavItem[] = [
  { name: 'Estate Finance', href: '/estates/finance', icon: Landmark, roles: ['admin', 'landlord'] },
  { name: 'Budget', href: '/estates/budget', icon: BarChart3, roles: ['admin', 'landlord'] },
  { name: 'Expenses', href: '/estate-expenses', icon: DollarSign, roles: ['admin', 'landlord'] },
  { name: 'Arrears', href: '/estates/arrears', icon: Receipt, roles: ['admin', 'landlord'] },
  { name: 'Statements', href: '/owners/statements', icon: FileText, roles: ['admin', 'landlord'] },
  { name: 'Reports', href: '/estates/reports', icon: BarChart3, roles: ['admin', 'landlord'] },
];

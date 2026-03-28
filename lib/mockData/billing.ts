// ============================================================================
// EasyRentals Rental Billing & Invoicing Mock Data
// ============================================================================

import { demoEstateUnits, demoEstates } from './estate-management';

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'partial';
export type InvoiceType = 'rent' | 'levy' | 'combined';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RentalInvoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;

  // Estate / Unit
  estateId: string;
  estateName: string;
  unitId: string;
  unitNumber: string;

  // Tenant
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;

  // Period
  month: number;
  year: number;
  periodLabel: string; // e.g. "March 2026"

  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;

  // Line Items
  lineItems: InvoiceLineItem[];

  // Totals
  subtotal: number;
  taxRate: number;   // 0 by default (Zimbabwe)
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;

  // Status
  status: InvoiceStatus;

  // Notes
  notes?: string;

  // Metadata
  createdAt: string;
  createdBy: string;
}

// ============================================================================
// Generator helpers
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

// Generate invoices for the last 3 months + current month
function generateInvoices(): RentalInvoice[] {
  const invoices: RentalInvoice[] = [];
  let counter = 1;

  // Current date anchor: 2026-03-16
  const months = [
    { month: 12, year: 2025 },
    { month: 1,  year: 2026 },
    { month: 2,  year: 2026 },
    { month: 3,  year: 2026 },
  ];

  const occupiedUnits = demoEstateUnits.filter(u => u.status === 'occupied' && u.tenantName && u.monthlyRent);

  occupiedUnits.forEach((unit) => {
    const estate = demoEstates.find(e => e.id === unit.estateId);
    if (!estate) return;

    months.forEach(({ month, year }, mIdx) => {
      const invoiceId = `inv-${String(counter).padStart(4, '0')}`;
      const invoiceNumber = `INV-${year}-${pad(month)}-${String(counter).padStart(3, '0')}`;
      const issueDate = isoDate(year, month, 1);
      const dueDate = isoDate(year, month, 7);

      const rent = unit.monthlyRent!;
      const levy = unit.levyAmount ?? estate.defaultLevyAmount;

      const lineItems: InvoiceLineItem[] = [
        {
          description: `Monthly Rent — ${unit.unitNumber} (${MONTH_NAMES[month - 1]} ${year})`,
          quantity: 1,
          unitPrice: rent,
          total: rent,
        },
        {
          description: `Estate Levy — ${estate.name} (${MONTH_NAMES[month - 1]} ${year})`,
          quantity: 1,
          unitPrice: levy,
          total: levy,
        },
      ];

      const subtotal = rent + levy;
      const totalAmount = subtotal;

      // Determine realistic status based on month index
      // Dec, Jan → paid; Feb → mix; Mar → unpaid/partial
      let status: InvoiceStatus;
      let paidAmount: number;
      let paidDate: string | undefined;

      const seed = (unit.id.charCodeAt(unit.id.length - 1) + mIdx) % 10;

      if (mIdx === 0) {
        // December — all paid
        status = 'paid';
        paidAmount = totalAmount;
        paidDate = isoDate(year, month, Math.floor(seed % 7) + 2);
      } else if (mIdx === 1) {
        // January — mostly paid
        if (seed < 8) {
          status = 'paid';
          paidAmount = totalAmount;
          paidDate = isoDate(year, month, (seed % 10) + 3);
        } else {
          status = 'overdue';
          paidAmount = 0;
          paidDate = undefined;
        }
      } else if (mIdx === 2) {
        // February — mix
        if (seed < 5) {
          status = 'paid';
          paidAmount = totalAmount;
          paidDate = isoDate(year, month, (seed % 10) + 4);
        } else if (seed < 7) {
          status = 'partial';
          paidAmount = rent; // paid rent but not levy
          paidDate = isoDate(year, month, (seed % 5) + 5);
        } else {
          status = 'overdue';
          paidAmount = 0;
          paidDate = undefined;
        }
      } else {
        // March — current month, mostly unpaid/partial
        if (seed < 3) {
          status = 'paid';
          paidAmount = totalAmount;
          paidDate = isoDate(year, month, (seed % 5) + 2);
        } else if (seed < 5) {
          status = 'partial';
          paidAmount = rent;
          paidDate = isoDate(year, month, (seed % 5) + 2);
        } else {
          status = 'unpaid';
          paidAmount = 0;
          paidDate = undefined;
        }
      }

      invoices.push({
        id: invoiceId,
        invoiceNumber,
        type: 'combined',
        estateId: estate.id,
        estateName: estate.name,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        tenantName: unit.tenantName!,
        tenantEmail: unit.tenantEmail ?? `${unit.tenantName!.toLowerCase().replace(' ', '.')}@gmail.com`,
        tenantPhone: unit.tenantPhone,
        month,
        year,
        periodLabel: `${MONTH_NAMES[month - 1]} ${year}`,
        issueDate,
        dueDate,
        paidDate,
        lineItems,
        subtotal,
        taxRate: 0,
        taxAmount: 0,
        totalAmount,
        paidAmount,
        balance: totalAmount - paidAmount,
        status,
        notes: status === 'partial' ? 'Partial payment received. Outstanding balance due immediately.' : undefined,
        createdAt: `${issueDate}T08:00:00Z`,
        createdBy: 'user-admin-1',
      });

      counter++;
    });
  });

  return invoices;
}

export const demoRentalInvoices: RentalInvoice[] = generateInvoices();

// ============================================================================
// Summary helpers
// ============================================================================

export function getBillingSummary(invoices: RentalInvoice[]) {
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.balance, 0);

  return { totalBilled, totalCollected, totalOutstanding, overdueCount, overdueAmount };
}

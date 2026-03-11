// ============================================================================
// Estate Accounting System Types
// ============================================================================

// ============================================================================
// Estate
// ============================================================================

export interface Estate {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  description?: string;
  totalUnits: number;
  
  // Financial Settings
  defaultLevyAmount: number;
  levyDueDay: number; // Day of month levy is due
  
  // Penalty Settings
  penaltyEnabled: boolean;
  penaltyType: 'fixed' | 'percentage';
  penaltyValue: number; // Amount or percentage
  gracePeriodDays: number;
  
  // Bank Details
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  
  // Status
  status: 'active' | 'inactive';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  managedBy: string; // User ID of estate manager/admin
}

// ============================================================================
// Estate Units
// ============================================================================

export interface EstateUnit {
  id: string;
  estateId: string;
  unitNumber: string;
  unitType: 'apartment' | 'house' | 'townhouse' | 'commercial' | 'other';
  
  // Owner/Tenant Info
  ownerId?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  
  // Levy Settings
  levyAmount: number; // Can override estate default
  
  // Unit Details
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  
  // Status
  status: 'occupied' | 'vacant' | 'rented';
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Levies
// ============================================================================

export type LevyStatus = 'unpaid' | 'paid' | 'partial';

export interface Levy {
  id: string;
  estateId: string;
  unitId: string;
  unitNumber: string;
  ownerName: string;
  
  // Levy Period
  month: number; // 1-12
  year: number;
  
  // Amounts
  amount: number;
  amountPaid: number;
  balance: number;
  
  // Status
  status: LevyStatus;
  
  // Due Date
  dueDate: string;
  
  // Payment Tracking
  paidDate?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'online';
  paymentReference?: string;
  
  // Penalty
  penaltyAmount: number;
  totalAmount: number; // amount + penalty
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  generatedBy: 'auto' | 'manual';
}

// ============================================================================
// Levy Penalties
// ============================================================================

export interface LevyPenalty {
  id: string;
  levyId: string;
  estateId: string;
  unitId: string;
  
  // Penalty Details
  penaltyType: 'fixed' | 'percentage';
  penaltyValue: number;
  calculatedAmount: number;
  
  // Applied Date
  appliedDate: string;
  
  // Status
  status: 'active' | 'waived' | 'paid';
  waivedReason?: string;
  waivedBy?: string;
  waivedAt?: string;
  
  createdAt: string;
}

// ============================================================================
// Estate Budgets
// ============================================================================

export type BudgetCategory = 
  | 'maintenance' 
  | 'security' 
  | 'cleaning' 
  | 'utilities' 
  | 'landscaping'
  | 'admin'
  | 'insurance'
  | 'other';

export interface EstateBudget {
  id: string;
  estateId: string;
  year: number;
  month: number;
  
  // Budget Categories
  budgets: {
    [key in BudgetCategory]: {
      budgeted: number;
      actual: number;
      variance: number;
    };
  };
  
  // Totals
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  
  // Status
  status: 'draft' | 'active' | 'closed';
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Estate Expenses
// ============================================================================

export interface EstateExpense {
  id: string;
  estateId: string;
  
  // Expense Details
  category: BudgetCategory;
  description: string;
  amount: number;
  
  // Date
  expenseDate: string;
  
  // Vendor/Payee
  vendorName?: string;
  vendorContact?: string;
  
  // Payment
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  paymentDate?: string;
  
  // Receipt/Invoice
  receiptUrl?: string;
  invoiceNumber?: string;
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// Owner Statements
// ============================================================================

export interface OwnerStatement {
  id: string;
  estateId: string;
  unitId: string;
  ownerId: string;
  ownerName: string;
  unitNumber: string;
  
  // Statement Period
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  
  // Levies
  leviesCharged: number;
  leviesPaid: number;
  leviesBalance: number;
  
  // Penalties
  penaltiesCharged: number;
  penaltiesPaid: number;
  penaltiesBalance: number;
  
  // Total
  totalCharged: number;
  totalPaid: number;
  totalBalance: number;
  
  // Opening/Closing Balance
  openingBalance: number;
  closingBalance: number;
  
  // Transactions
  transactions: StatementTransaction[];
  
  // Statement Status
  status: 'draft' | 'sent' | 'viewed' | 'paid';
  sentAt?: string;
  viewedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface StatementTransaction {
  id: string;
  date: string;
  description: string;
  type: 'charge' | 'payment' | 'penalty' | 'adjustment';
  amount: number;
  balance: number;
}

// ============================================================================
// Levy Arrears
// ============================================================================

export type ArrearsRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface LevyArrear {
  id: string;
  estateId: string;
  unitId: string;
  unitNumber: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  
  // Arrears Summary
  totalOutstanding: number;
  monthsOverdue: number;
  oldestUnpaidMonth: number;
  oldestUnpaidYear: number;
  
  // Risk Level
  riskLevel: ArrearsRiskLevel;
  
  // Unpaid Levies
  unpaidLevies: {
    levyId: string;
    month: number;
    year: number;
    amount: number;
    penalty: number;
    total: number;
    dueDate: string;
    daysOverdue: number;
  }[];
  
  // Last Payment
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  
  // Actions
  reminderSent?: string;
  legalNoticeSent?: string;
  
  updatedAt: string;
}

// ============================================================================
// Financial Reports
// ============================================================================

export interface MonthlyFinancialReport {
  estateId: string;
  month: number;
  year: number;
  
  // Levies
  levies: {
    total: number;
    paid: number;
    outstanding: number;
    collectionRate: number;
  };
  
  // Expenses
  expenses: {
    total: number;
    byCategory: { [key in BudgetCategory]: number };
  };
  
  // Net
  netBalance: number;
  
  // Penalties
  penalties: {
    charged: number;
    collected: number;
    outstanding: number;
  };
  
  // Unit Stats
  unitStats: {
    totalUnits: number;
    paidInFull: number;
    partial: number;
    unpaid: number;
  };
}

export interface AnnualFinancialReport {
  estateId: string;
  year: number;
  
  // Annual Summary
  totalLeviesCharged: number;
  totalLeviesCollected: number;
  totalLeviesOutstanding: number;
  
  totalExpenses: number;
  totalPenaltiesCharged: number;
  totalPenaltiesCollected: number;
  
  // Net Balance
  netBalance: number;
  
  // Monthly Breakdown
  monthlyData: MonthlyFinancialReport[];
  
  // Category Breakdown
  expensesByCategory: { [key in BudgetCategory]: number };
  
  // Comparison
  previousYearComparison?: {
    leviesChange: number;
    expensesChange: number;
    netChange: number;
  };
}

// ============================================================================
// Notifications
// ============================================================================

export interface EstateNotification {
  id: string;
  estateId: string;
  unitId?: string;
  userId?: string;
  
  // Notification Details
  type: 'late_levy' | 'high_arrears' | 'budget_overrun' | 'payment_received' | 'penalty_applied';
  title: string;
  message: string;
  
  // Severity
  severity: 'info' | 'warning' | 'critical';
  
  // Status
  status: 'unread' | 'read' | 'dismissed';
  readAt?: string;
  
  // Action Links
  actionLink?: string;
  actionLabel?: string;
  
  createdAt: string;
}

// ============================================================================
// Filters
// ============================================================================

export interface LevyFilters {
  estateId?: string;
  unitId?: string;
  status?: LevyStatus;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseFilters {
  estateId?: string;
  category?: BudgetCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ArrearsFilters {
  estateId?: string;
  riskLevel?: ArrearsRiskLevel;
  minAmount?: number;
  monthsOverdue?: number;
}

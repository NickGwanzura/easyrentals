import {
  EstateLevy,
} from '@/types/estate-management';
import {
  EstateBudget,
  EstateExpense,
  BudgetCategory,
  MonthlyFinancialReport,
  AnnualFinancialReport,
} from '@/types/estate';
import { Levy } from '@/types/estate';

// ============================================================================
// Agency Financial Calculations
// ============================================================================

export interface AgencyFinancialSummary {
  // Time Period
  period: {
    type: 'monthly' | 'quarterly' | 'annual' | 'custom';
    startDate: string;
    endDate: string;
    month?: number;
    year?: number;
    quarter?: number;
  };
  
  // Income
  income: {
    totalLeviesCharged: number;
    totalLeviesCollected: number;
    totalLeviesOutstanding: number;
    collectionRate: number; // Percentage
    penaltiesCharged: number;
    penaltiesCollected: number;
    otherIncome: number;
    totalIncome: number;
  };
  
  // Expenses
  expenses: {
    totalExpenses: number;
    byCategory: Record<BudgetCategory, number>;
    breakdown: Record<BudgetCategory, number>;
  };
  
  // Profit/Loss
  profit: {
    grossProfit: number; // totalIncome - totalExpenses
    netProfit: number;   // grossProfit - agencyFee (if applicable)
    profitMargin: number; // (netProfit / totalIncome) * 100
  };
  
  // Key Metrics
  metrics: {
    averageLevyPerUnit: number;
    expenseToIncomeRatio: number;
    outstandingRatio: number;
    projectedAnnualIncome: number;
  };
}

export interface EstateFinancialSummary {
  estateId: string;
  estateName: string;
  period: {
    month?: number;
    year?: number;
    startDate: string;
    endDate: string;
  };
  
  // Levy Summary
  levies: {
    totalUnits: number;
    unitsPaid: number;
    unitsPartial: number;
    unitsUnpaid: number;
    totalCharged: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
  };
  
  // Expenses
  expenses: {
    total: number;
    byCategory: Record<BudgetCategory, number>;
  };
  
  // Profit/Loss
  netPosition: number;
  profitMargin: number;
}

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate agency financial summary for a given period
 */
export function calculateAgencyFinancials(
  levies: EstateLevy[],
  expenses: EstateExpense[],
  period: {
    type: 'monthly' | 'quarterly' | 'annual' | 'custom';
    startDate: string;
    endDate: string;
    month?: number;
    year?: number;
    quarter?: number;
  },
  options?: {
    agencyFeePercentage?: number; // e.g., 10 for 10%
    otherIncome?: number;
  }
): AgencyFinancialSummary {
  // Filter levies and expenses by date range
  const filteredLevies = filterByDateRange(levies, period.startDate, period.endDate);
  const filteredExpenses = filterByDateRange(expenses, period.startDate, period.endDate);
  
  // Calculate Income
  const totalLeviesCharged = filteredLevies.reduce((sum, l) => sum + l.levyAmount, 0);
  const totalLeviesCollected = filteredLevies.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalLeviesOutstanding = filteredLevies.reduce((sum, l) => sum + l.balance, 0);
  const collectionRate = totalLeviesCharged > 0 
    ? (totalLeviesCollected / totalLeviesCharged) * 100 
    : 0;
  
  const penaltiesCharged = 0; // Would need penalties data
  const penaltiesCollected = 0;
  const otherIncome = options?.otherIncome || 0;
  const totalIncome = totalLeviesCollected + penaltiesCollected + otherIncome;
  
  // Calculate Expenses
  const expenseBreakdown = calculateExpenseBreakdown(filteredExpenses);
  const totalExpenses = Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0);
  
  // Calculate Profit
  const grossProfit = totalIncome - totalExpenses;
  const agencyFee = options?.agencyFeePercentage 
    ? (grossProfit * options.agencyFeePercentage) / 100 
    : 0;
  const netProfit = grossProfit - agencyFee;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
  // Calculate Metrics
  const totalUnits = new Set(filteredLevies.map(l => l.unitId)).size;
  const averageLevyPerUnit = totalUnits > 0 ? totalLeviesCharged / totalUnits : 0;
  const expenseToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const outstandingRatio = totalLeviesCharged > 0 
    ? (totalLeviesOutstanding / totalLeviesCharged) * 100 
    : 0;
  
  // Projected annual income based on current period
  const daysInPeriod = getDaysBetween(period.startDate, period.endDate);
  const projectedAnnualIncome = daysInPeriod > 0 
    ? (totalIncome / daysInPeriod) * 365 
    : 0;
  
  return {
    period,
    income: {
      totalLeviesCharged,
      totalLeviesCollected,
      totalLeviesOutstanding,
      collectionRate: roundToTwoDecimals(collectionRate),
      penaltiesCharged,
      penaltiesCollected,
      otherIncome,
      totalIncome: roundToTwoDecimals(totalIncome),
    },
    expenses: {
      totalExpenses: roundToTwoDecimals(totalExpenses),
      byCategory: expenseBreakdown,
      breakdown: expenseBreakdown,
    },
    profit: {
      grossProfit: roundToTwoDecimals(grossProfit),
      netProfit: roundToTwoDecimals(netProfit),
      profitMargin: roundToTwoDecimals(profitMargin),
    },
    metrics: {
      averageLevyPerUnit: roundToTwoDecimals(averageLevyPerUnit),
      expenseToIncomeRatio: roundToTwoDecimals(expenseToIncomeRatio),
      outstandingRatio: roundToTwoDecimals(outstandingRatio),
      projectedAnnualIncome: roundToTwoDecimals(projectedAnnualIncome),
    },
  };
}

/**
 * Calculate financial summary for a specific estate
 */
export function calculateEstateFinancials(
  estateId: string,
  estateName: string,
  levies: EstateLevy[],
  expenses: EstateExpense[],
  period: {
    startDate: string;
    endDate: string;
    month?: number;
    year?: number;
  }
): EstateFinancialSummary {
  // Filter by estate and date
  const estateLevies = levies.filter(l => 
    l.estateId === estateId && 
    isWithinDateRange(l.createdAt, period.startDate, period.endDate)
  );
  const estateExpenses = expenses.filter(e => 
    e.estateId === estateId && 
    isWithinDateRange(e.expenseDate, period.startDate, period.endDate)
  );
  
  // Levy calculations
  const totalUnits = new Set(estateLevies.map(l => l.unitId)).size;
  const unitsPaid = estateLevies.filter(l => l.status === 'paid').length;
  const unitsPartial = estateLevies.filter(l => l.status === 'partial').length;
  const unitsUnpaid = estateLevies.filter(l => l.status === 'unpaid').length;
  
  const totalCharged = estateLevies.reduce((sum, l) => sum + l.levyAmount, 0);
  const totalCollected = estateLevies.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalOutstanding = estateLevies.reduce((sum, l) => sum + l.balance, 0);
  const collectionRate = totalCharged > 0 ? (totalCollected / totalCharged) * 100 : 0;
  
  // Expense calculations
  const expenseBreakdown = calculateExpenseBreakdown(estateExpenses);
  const totalExpenses = Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0);
  
  // Net position
  const netPosition = totalCollected - totalExpenses;
  const profitMargin = totalCollected > 0 ? (netPosition / totalCollected) * 100 : 0;
  
  return {
    estateId,
    estateName,
    period,
    levies: {
      totalUnits,
      unitsPaid,
      unitsPartial,
      unitsUnpaid,
      totalCharged: roundToTwoDecimals(totalCharged),
      totalCollected: roundToTwoDecimals(totalCollected),
      totalOutstanding: roundToTwoDecimals(totalOutstanding),
      collectionRate: roundToTwoDecimals(collectionRate),
    },
    expenses: {
      total: roundToTwoDecimals(totalExpenses),
      byCategory: expenseBreakdown,
    },
    netPosition: roundToTwoDecimals(netPosition),
    profitMargin: roundToTwoDecimals(profitMargin),
  };
}

/**
 * Calculate monthly financial report
 */
export function calculateMonthlyReport(
  estateId: string,
  month: number,
  year: number,
  levies: EstateLevy[],
  expenses: EstateExpense[]
): MonthlyFinancialReport {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = getLastDayOfMonth(year, month);
  
  const monthLevies = levies.filter(l => 
    l.estateId === estateId && 
    l.month === month && 
    l.year === year
  );
  const monthExpenses = expenses.filter(e => 
    e.estateId === estateId && 
    isWithinDateRange(e.expenseDate, startDate, endDate)
  );
  
  const totalLevies = monthLevies.reduce((sum, l) => sum + l.levyAmount, 0);
  const paidLevies = monthLevies.filter(l => l.status === 'paid');
  const totalPaid = paidLevies.reduce((sum, l) => sum + l.paidAmount, 0);
  const outstanding = totalLevies - totalPaid;
  const collectionRate = totalLevies > 0 ? (totalPaid / totalLevies) * 100 : 0;
  
  const expenseByCategory = calculateExpenseBreakdown(monthExpenses);
  const totalExpenses = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);
  
  const netBalance = totalPaid - totalExpenses;
  
  const totalUnits = monthLevies.length;
  const paidInFull = paidLevies.length;
  const partial = monthLevies.filter(l => l.status === 'partial').length;
  const unpaid = monthLevies.filter(l => l.status === 'unpaid').length;
  
  return {
    estateId,
    month,
    year,
    levies: {
      total: roundToTwoDecimals(totalLevies),
      paid: roundToTwoDecimals(totalPaid),
      outstanding: roundToTwoDecimals(outstanding),
      collectionRate: roundToTwoDecimals(collectionRate),
    },
    expenses: {
      total: roundToTwoDecimals(totalExpenses),
      byCategory: expenseByCategory,
    },
    netBalance: roundToTwoDecimals(netBalance),
    penalties: {
      charged: 0,
      collected: 0,
      outstanding: 0,
    },
    unitStats: {
      totalUnits,
      paidInFull,
      partial,
      unpaid,
    },
  };
}

/**
 * Calculate annual financial report
 */
export function calculateAnnualReport(
  estateId: string,
  year: number,
  levies: EstateLevy[],
  expenses: EstateExpense[]
): AnnualFinancialReport {
  const monthlyData: MonthlyFinancialReport[] = [];
  
  for (let month = 1; month <= 12; month++) {
    monthlyData.push(calculateMonthlyReport(estateId, month, year, levies, expenses));
  }
  
  const totalLeviesCharged = monthlyData.reduce((sum, m) => sum + m.levies.total, 0);
  const totalLeviesCollected = monthlyData.reduce((sum, m) => sum + m.levies.paid, 0);
  const totalLeviesOutstanding = monthlyData.reduce((sum, m) => sum + m.levies.outstanding, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses.total, 0);
  
  // Aggregate expenses by category
  const expensesByCategory: Record<BudgetCategory, number> = {
    maintenance: 0,
    security: 0,
    cleaning: 0,
    utilities: 0,
    landscaping: 0,
    admin: 0,
    insurance: 0,
    other: 0,
  };
  
  monthlyData.forEach(month => {
    Object.entries(month.expenses.byCategory).forEach(([category, amount]) => {
      expensesByCategory[category as BudgetCategory] += amount as number;
    });
  });
  
  const netBalance = totalLeviesCollected - totalExpenses;
  
  return {
    estateId,
    year,
    totalLeviesCharged: roundToTwoDecimals(totalLeviesCharged),
    totalLeviesCollected: roundToTwoDecimals(totalLeviesCollected),
    totalLeviesOutstanding: roundToTwoDecimals(totalLeviesOutstanding),
    totalExpenses: roundToTwoDecimals(totalExpenses),
    totalPenaltiesCharged: 0,
    totalPenaltiesCollected: 0,
    netBalance: roundToTwoDecimals(netBalance),
    monthlyData,
    expensesByCategory,
  };
}

/**
 * Compare current period with previous period
 */
export function calculatePeriodComparison(
  current: AgencyFinancialSummary,
  previous: AgencyFinancialSummary
) {
  const incomeChange = previous.income.totalIncome > 0
    ? ((current.income.totalIncome - previous.income.totalIncome) / previous.income.totalIncome) * 100
    : 0;
    
  const expenseChange = previous.expenses.totalExpenses > 0
    ? ((current.expenses.totalExpenses - previous.expenses.totalExpenses) / previous.expenses.totalExpenses) * 100
    : 0;
    
  const profitChange = previous.profit.netProfit > 0
    ? ((current.profit.netProfit - previous.profit.netProfit) / previous.profit.netProfit) * 100
    : 0;
    
  const collectionRateChange = current.income.collectionRate - previous.income.collectionRate;
  
  return {
    incomeChange: roundToTwoDecimals(incomeChange),
    expenseChange: roundToTwoDecimals(expenseChange),
    profitChange: roundToTwoDecimals(profitChange),
    collectionRateChange: roundToTwoDecimals(collectionRateChange),
    isIncomeUp: incomeChange >= 0,
    isExpensesUp: expenseChange >= 0,
    isProfitUp: profitChange >= 0,
    isCollectionRateUp: collectionRateChange >= 0,
  };
}

/**
 * Calculate budget variance (actual vs budgeted)
 */
export function calculateBudgetVariance(
  actualExpenses: EstateExpense[],
  budget: EstateBudget
) {
  const actualByCategory = calculateExpenseBreakdown(actualExpenses);
  
  const variances: Record<BudgetCategory, { budgeted: number; actual: number; variance: number; percentage: number }> = {
    maintenance: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    security: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    cleaning: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    utilities: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    landscaping: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    admin: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    insurance: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
    other: { budgeted: 0, actual: 0, variance: 0, percentage: 0 },
  };
  
  Object.keys(budget.budgets).forEach(category => {
    const cat = category as BudgetCategory;
    const budgeted = budget.budgets[cat]?.budgeted || 0;
    const actual = actualByCategory[cat] || 0;
    const variance = actual - budgeted;
    const percentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;
    
    variances[cat] = {
      budgeted,
      actual,
      variance,
      percentage: roundToTwoDecimals(percentage),
    };
  });
  
  return variances;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateExpenseBreakdown(expenses: EstateExpense[]): Record<BudgetCategory, number> {
  const breakdown: Record<BudgetCategory, number> = {
    maintenance: 0,
    security: 0,
    cleaning: 0,
    utilities: 0,
    landscaping: 0,
    admin: 0,
    insurance: 0,
    other: 0,
  };
  
  expenses.forEach(expense => {
    if (breakdown.hasOwnProperty(expense.category)) {
      breakdown[expense.category] += expense.amount;
    }
  });
  
  // Round all values
  Object.keys(breakdown).forEach(key => {
    breakdown[key as BudgetCategory] = roundToTwoDecimals(breakdown[key as BudgetCategory]);
  });
  
  return breakdown;
}

function filterByDateRange<T extends { createdAt?: string; expenseDate?: string }>(
  items: T[],
  startDate: string,
  endDate: string
): T[] {
  return items.filter(item => {
    const date = item.expenseDate || item.createdAt;
    return date ? isWithinDateRange(date, startDate, endDate) : false;
  });
}

function isWithinDateRange(date: string, startDate: string, endDate: string): boolean {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

// ============================================================================
// Formatting Helpers
// ============================================================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getProfitStatus(profitMargin: number): 'profit' | 'break-even' | 'loss' {
  if (profitMargin > 5) return 'profit';
  if (profitMargin < -5) return 'loss';
  return 'break-even';
}

export function getCollectionStatus(collectionRate: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (collectionRate >= 95) return 'excellent';
  if (collectionRate >= 80) return 'good';
  if (collectionRate >= 60) return 'fair';
  return 'poor';
}

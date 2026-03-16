'use client';

import { useMemo, useCallback } from 'react';
import {
  EstateLevy,
} from '@/types/estate-management';
import {
  EstateBudget,
  EstateExpense,
  MonthlyFinancialReport,
  AnnualFinancialReport,
} from '@/types/estate';
import {
  calculateAgencyFinancials,
  calculateEstateFinancials,
  calculateMonthlyReport,
  calculateAnnualReport,
  calculatePeriodComparison,
  calculateBudgetVariance,
  AgencyFinancialSummary,
  EstateFinancialSummary,
  formatCurrency,
  formatPercentage,
  getProfitStatus,
  getCollectionStatus,
} from './calculations';

// ============================================================================
// React Hooks for Financial Calculations
// ============================================================================

interface UseAgencyFinancialsOptions {
  levies: EstateLevy[];
  expenses: EstateExpense[];
  period: {
    type: 'monthly' | 'quarterly' | 'annual' | 'custom';
    startDate: string;
    endDate: string;
    month?: number;
    year?: number;
    quarter?: number;
  };
  agencyFeePercentage?: number;
  otherIncome?: number;
}

/**
 * Hook to calculate agency-wide financial summary
 */
export function useAgencyFinancials(options: UseAgencyFinancialsOptions): {
  summary: AgencyFinancialSummary;
  formatted: {
    totalIncome: string;
    totalExpenses: string;
    netProfit: string;
    collectionRate: string;
    profitMargin: string;
  };
  status: {
    profit: 'profit' | 'break-even' | 'loss';
    collection: 'excellent' | 'good' | 'fair' | 'poor';
  };
} {
  const { levies, expenses, period, agencyFeePercentage, otherIncome } = options;

  const summary = useMemo(() => {
    return calculateAgencyFinancials(levies, expenses, period, {
      agencyFeePercentage,
      otherIncome,
    });
  }, [levies, expenses, period, agencyFeePercentage, otherIncome]);

  const formatted = useMemo(() => ({
    totalIncome: formatCurrency(summary.income.totalIncome),
    totalExpenses: formatCurrency(summary.expenses.totalExpenses),
    netProfit: formatCurrency(summary.profit.netProfit),
    collectionRate: formatPercentage(summary.income.collectionRate),
    profitMargin: formatPercentage(summary.profit.profitMargin),
  }), [summary]);

  const status = useMemo(() => ({
    profit: getProfitStatus(summary.profit.profitMargin),
    collection: getCollectionStatus(summary.income.collectionRate),
  }), [summary]);

  return { summary, formatted, status };
}

interface UseEstateFinancialsOptions {
  estateId: string;
  estateName: string;
  levies: EstateLevy[];
  expenses: EstateExpense[];
  period: {
    startDate: string;
    endDate: string;
    month?: number;
    year?: number;
  };
}

/**
 * Hook to calculate financial summary for a specific estate
 */
export function useEstateFinancials(options: UseEstateFinancialsOptions): {
  summary: EstateFinancialSummary;
  formatted: {
    totalCollected: string;
    totalExpenses: string;
    netPosition: string;
    collectionRate: string;
    profitMargin: string;
  };
} {
  const { estateId, estateName, levies, expenses, period } = options;

  const summary = useMemo(() => {
    return calculateEstateFinancials(estateId, estateName, levies, expenses, period);
  }, [estateId, estateName, levies, expenses, period]);

  const formatted = useMemo(() => ({
    totalCollected: formatCurrency(summary.levies.totalCollected),
    totalExpenses: formatCurrency(summary.expenses.total),
    netPosition: formatCurrency(summary.netPosition),
    collectionRate: formatPercentage(summary.levies.collectionRate),
    profitMargin: formatPercentage(summary.profitMargin),
  }), [summary]);

  return { summary, formatted };
}

interface UseMonthlyReportOptions {
  estateId: string;
  month: number;
  year: number;
  levies: EstateLevy[];
  expenses: EstateExpense[];
}

/**
 * Hook to calculate monthly financial report
 */
export function useMonthlyReport(options: UseMonthlyReportOptions): MonthlyFinancialReport {
  const { estateId, month, year, levies, expenses } = options;

  return useMemo(() => {
    return calculateMonthlyReport(estateId, month, year, levies, expenses);
  }, [estateId, month, year, levies, expenses]);
}

interface UseAnnualReportOptions {
  estateId: string;
  year: number;
  levies: EstateLevy[];
  expenses: EstateExpense[];
}

/**
 * Hook to calculate annual financial report
 */
export function useAnnualReport(options: UseAnnualReportOptions): AnnualFinancialReport {
  const { estateId, year, levies, expenses } = options;

  return useMemo(() => {
    return calculateAnnualReport(estateId, year, levies, expenses);
  }, [estateId, year, levies, expenses]);
}

interface UsePeriodComparisonOptions {
  current: AgencyFinancialSummary;
  previous: AgencyFinancialSummary;
}

/**
 * Hook to compare current period with previous period
 */
export function usePeriodComparison(options: UsePeriodComparisonOptions) {
  const { current, previous } = options;

  return useMemo(() => {
    return calculatePeriodComparison(current, previous);
  }, [current, previous]);
}

interface UseBudgetVarianceOptions {
  actualExpenses: EstateExpense[];
  budget: EstateBudget;
}

/**
 * Hook to calculate budget variance
 */
export function useBudgetVariance(options: UseBudgetVarianceOptions) {
  const { actualExpenses, budget } = options;

  return useMemo(() => {
    return calculateBudgetVariance(actualExpenses, budget);
  }, [actualExpenses, budget]);
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get period date range based on type
 */
export function usePeriodDates(
  type: 'monthly' | 'quarterly' | 'annual',
  year: number,
  month?: number,
  quarter?: number
): { startDate: string; endDate: string } {
  return useMemo(() => {
    switch (type) {
      case 'monthly':
        if (!month) throw new Error('Month is required for monthly period');
        return {
          startDate: `${year}-${String(month).padStart(2, '0')}-01`,
          endDate: getLastDayOfMonth(year, month),
        };
      case 'quarterly':
        if (!quarter) throw new Error('Quarter is required for quarterly period');
        const quarterMonths = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
        ];
        const months = quarterMonths[quarter - 1];
        return {
          startDate: `${year}-${String(months[0]).padStart(2, '0')}-01`,
          endDate: getLastDayOfMonth(year, months[2]),
        };
      case 'annual':
        return {
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        };
      default:
        throw new Error('Invalid period type');
    }
  }, [type, year, month, quarter]);
}

/**
 * Hook to format currency with memoization
 */
export function useFormattedCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return useMemo(() => formatCurrency(amount, currency), [amount, currency]);
}

/**
 * Hook to format percentage with memoization
 */
export function useFormattedPercentage(
  value: number,
  decimals: number = 1
): string {
  return useMemo(() => formatPercentage(value, decimals), [value, decimals]);
}

// ============================================================================
// Helper Functions
// ============================================================================

function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

// ============================================================================
// Estate Accounting Mock Data
// 500 Levy Records | 50 Expenses | 10 Budgets
// ============================================================================

import { 
  Estate, EstateUnit, Levy, LevyStatus, EstateExpense, 
  EstateBudget, BudgetCategory, OwnerStatement, LevyArrear,
  ArrearsRiskLevel 
} from '@/types/estate';
import { DEMO_CREDENTIALS } from './index';

// ============================================================================
// Demo Estates
// ============================================================================

export const demoEstates: Estate[] = [
  {
    id: 'estate-1',
    name: 'Sunset Heights Estate',
    address: '123 Sunset Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90028',
    country: 'USA',
    description: 'Luxury residential estate with 50 units',
    totalUnits: 50,
    defaultLevyAmount: 250,
    levyDueDay: 1,
    penaltyEnabled: true,
    penaltyType: 'percentage',
    penaltyValue: 5,
    gracePeriodDays: 5,
    bankName: 'Chase Bank',
    bankAccountNumber: '****1234',
    bankRoutingNumber: '021000021',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-2',
    name: 'Green Valley Gardens',
    address: '456 Green Valley Road',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
    description: 'Family-friendly estate with 75 units',
    totalUnits: 75,
    defaultLevyAmount: 180,
    levyDueDay: 5,
    penaltyEnabled: true,
    penaltyType: 'fixed',
    penaltyValue: 25,
    gracePeriodDays: 7,
    bankName: 'Bank of America',
    bankAccountNumber: '****5678',
    bankRoutingNumber: '111000025',
    status: 'active',
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-3',
    name: 'Marina Bay Residences',
    address: '789 Marina Drive',
    city: 'Miami',
    state: 'FL',
    zipCode: '33131',
    country: 'USA',
    description: 'Waterfront estate with 40 luxury units',
    totalUnits: 40,
    defaultLevyAmount: 350,
    levyDueDay: 1,
    penaltyEnabled: true,
    penaltyType: 'percentage',
    penaltyValue: 3,
    gracePeriodDays: 3,
    bankName: 'Wells Fargo',
    bankAccountNumber: '****9012',
    bankRoutingNumber: '121042882',
    status: 'active',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-4',
    name: 'Oakwood Commons',
    address: '321 Oakwood Avenue',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'USA',
    description: 'Suburban estate with 60 townhouses',
    totalUnits: 60,
    defaultLevyAmount: 200,
    levyDueDay: 10,
    penaltyEnabled: false,
    penaltyType: 'fixed',
    penaltyValue: 0,
    gracePeriodDays: 10,
    bankName: 'US Bank',
    bankAccountNumber: '****3456',
    bankRoutingNumber: '122105155',
    status: 'active',
    createdAt: '2023-04-20T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-5',
    name: 'Downtown Plaza Estate',
    address: '555 Downtown Plaza',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    description: 'Urban estate with 30 commercial units',
    totalUnits: 30,
    defaultLevyAmount: 400,
    levyDueDay: 1,
    penaltyEnabled: true,
    penaltyType: 'percentage',
    penaltyValue: 10,
    gracePeriodDays: 0,
    bankName: 'PNC Bank',
    bankAccountNumber: '****7890',
    bankRoutingNumber: '043000096',
    status: 'active',
    createdAt: '2023-05-05T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
];

// ============================================================================
// Demo Estate Units (225 total units across 5 estates)
// ============================================================================

export const demoEstateUnits: EstateUnit[] = [];

// Generate units for each estate
const estateUnitCounts = [50, 75, 40, 60, 30];
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

let unitIdCounter = 1;
demoEstates.forEach((estate, estateIndex) => {
  const unitCount = estateUnitCounts[estateIndex];
  
  for (let i = 1; i <= unitCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    demoEstateUnits.push({
      id: `unit-${unitIdCounter}`,
      estateId: estate.id,
      unitNumber: `${i}`,
      unitType: ['apartment', 'house', 'townhouse'][Math.floor(Math.random() * 3)] as any,
      ownerId: `owner-${unitIdCounter}`,
      ownerName: `${firstName} ${lastName}`,
      ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      ownerPhone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      levyAmount: estate.defaultLevyAmount + Math.floor(Math.random() * 50) - 25,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      squareFeet: 800 + Math.floor(Math.random() * 1500),
      status: Math.random() > 0.1 ? 'occupied' : 'vacant',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    
    unitIdCounter++;
  }
});

// ============================================================================
// Demo Levies (500 records)
// ============================================================================

export const demoLevies: Levy[] = [];

const currentYear = 2024;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Generate levies for occupied units
let levyIdCounter = 1;
const statuses: LevyStatus[] = ['unpaid', 'paid', 'partial'];

demoEstateUnits.forEach((unit) => {
  if (unit.status === 'vacant') return;
  
  // Generate 2-4 months of levy history per unit
  const monthsToGenerate = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < monthsToGenerate; i++) {
    const month = months[i];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = unit.levyAmount;
    const penaltyAmount = status === 'unpaid' && Math.random() > 0.5 ? amount * 0.05 : 0;
    const amountPaid = status === 'paid' ? amount + penaltyAmount : status === 'partial' ? amount * 0.5 : 0;
    
    demoLevies.push({
      id: `levy-${levyIdCounter}`,
      estateId: unit.estateId,
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      ownerName: unit.ownerName,
      month,
      year: currentYear,
      amount,
      amountPaid,
      balance: amount + penaltyAmount - amountPaid,
      status,
      dueDate: `${currentYear}-${String(month).padStart(2, '0')}-01`,
      paidDate: status === 'paid' ? `${currentYear}-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : undefined,
      paymentMethod: status === 'paid' ? ['cash', 'bank_transfer', 'online'][Math.floor(Math.random() * 3)] as any : undefined,
      paymentReference: status === 'paid' ? `PAY-${Date.now()}-${levyIdCounter}` : undefined,
      penaltyAmount,
      totalAmount: amount + penaltyAmount,
      notes: Math.random() > 0.9 ? 'Special assessment included' : undefined,
      createdAt: `${currentYear}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
      updatedAt: `${currentYear}-${String(month).padStart(2, '0')}-15T00:00:00Z`,
      generatedBy: 'auto',
    });
    
    levyIdCounter++;
  }
});

// Ensure we have at least 500 levies
while (demoLevies.length < 500) {
  const unit = demoEstateUnits[Math.floor(Math.random() * demoEstateUnits.length)];
  if (unit.status === 'vacant') continue;
  
  const month = months[Math.floor(Math.random() * 12)];
  
  // Skip if levy already exists for this unit/month/year
  if (demoLevies.some(l => l.unitId === unit.id && l.month === month && l.year === currentYear)) {
    continue;
  }
  
  const status: LevyStatus = 'unpaid';
  const amount = unit.levyAmount;
  
  demoLevies.push({
    id: `levy-${levyIdCounter}`,
    estateId: unit.estateId,
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    ownerName: unit.ownerName,
    month,
    year: currentYear,
    amount,
    amountPaid: 0,
    balance: amount,
    status,
    dueDate: `${currentYear}-${String(month).padStart(2, '0')}-01`,
    penaltyAmount: 0,
    totalAmount: amount,
    createdAt: `${currentYear}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
    updatedAt: `${currentYear}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
    generatedBy: 'auto',
  });
  
  levyIdCounter++;
}

// ============================================================================
// Demo Estate Expenses (50 records)
// ============================================================================

export const demoEstateExpenses: EstateExpense[] = [];

const expenseCategories: BudgetCategory[] = ['maintenance', 'security', 'cleaning', 'utilities', 'landscaping', 'admin', 'insurance', 'other'];
const expenseDescriptions: Record<BudgetCategory, string[]> = {
  maintenance: ['Elevator repair', 'Roof maintenance', 'Painting common areas', 'Pool maintenance', 'Gate repair', 'Plumbing work'],
  security: ['Security guard salary', 'CCTV maintenance', 'Access control upgrade', 'Security patrol', 'Alarm system service'],
  cleaning: ['Common area cleaning', 'Window washing', 'Carpet cleaning', 'Trash removal', 'Pressure washing'],
  utilities: ['Electricity bill', 'Water bill', 'Gas bill', 'Internet service', 'Waste management'],
  landscaping: ['Lawn mowing', 'Tree trimming', 'Garden maintenance', 'Irrigation repair', 'Fertilization'],
  admin: ['Office supplies', 'Legal fees', 'Accounting fees', 'Software subscription', 'Meeting expenses'],
  insurance: ['Property insurance', 'Liability insurance', 'Flood insurance', 'Fire insurance'],
  other: ['Miscellaneous repairs', 'Emergency fund', 'Reserve contribution', 'Special project'],
};

const vendors = ['ABC Services', 'Premium Maintenance', 'City Utilities', 'Green Landscaping', 'SecureGuard', 'CleanPro', 'Tech Solutions', 'Legal Associates'];

for (let i = 1; i <= 50; i++) {
  const estate = demoEstates[Math.floor(Math.random() * demoEstates.length)];
  const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
  const descriptions = expenseDescriptions[category];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  demoEstateExpenses.push({
    id: `expense-${i}`,
    estateId: estate.id,
    category,
    description,
    amount: Math.floor(Math.random() * 2000) + 100,
    expenseDate: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    vendorName: vendors[Math.floor(Math.random() * vendors.length)],
    vendorContact: 'contact@vendor.com',
    paymentMethod: ['bank_transfer', 'check', 'credit_card'][Math.floor(Math.random() * 3)] as any,
    paymentDate: `2024-${String(month).padStart(2, '0')}-${String(day + 5).padStart(2, '0')}`,
    receiptUrl: Math.random() > 0.3 ? `https://receipts.eazyrentals.com/expense-${i}.pdf` : undefined,
    invoiceNumber: `INV-${Date.now()}-${i}`,
    approvedBy: 'user-admin-1',
    approvedAt: `2024-${String(month).padStart(2, '0')}-${String(day + 2).padStart(2, '0')}T00:00:00Z`,
    notes: Math.random() > 0.7 ? 'Urgent repair required' : undefined,
    createdAt: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`,
    updatedAt: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`,
    createdBy: 'user-admin-1',
  });
}

// ============================================================================
// Demo Estate Budgets (10 records - 2 months per estate)
// ============================================================================

export const demoEstateBudgets: EstateBudget[] = [];

let budgetIdCounter = 1;
demoEstates.forEach((estate) => {
  [1, 2].forEach((month) => {
    const categories: BudgetCategory[] = ['maintenance', 'security', 'cleaning', 'utilities', 'landscaping', 'admin', 'insurance', 'other'];
    const budgets: any = {};
    let totalBudgeted = 0;
    let totalActual = 0;
    
    categories.forEach((cat) => {
      const budgeted = Math.floor(Math.random() * 3000) + 500;
      const variance = Math.floor(Math.random() * 400) - 200;
      const actual = budgeted + variance;
      
      budgets[cat] = {
        budgeted,
        actual,
        variance: budgeted - actual,
      };
      
      totalBudgeted += budgeted;
      totalActual += actual;
    });
    
    demoEstateBudgets.push({
      id: `budget-${budgetIdCounter}`,
      estateId: estate.id,
      year: 2024,
      month,
      budgets,
      totalBudgeted,
      totalActual,
      totalVariance: totalBudgeted - totalActual,
      status: month === 1 ? 'closed' : 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    });
    
    budgetIdCounter++;
  });
});

// ============================================================================
// Demo Levy Arrears (Calculated from levies)
// ============================================================================

export const demoLevyArrears: LevyArrear[] = [];

// Group unpaid levies by unit
const unpaidByUnit = new Map<string, Levy[]>();
demoLevies.filter(l => l.status !== 'paid').forEach(levy => {
  if (!unpaidByUnit.has(levy.unitId)) {
    unpaidByUnit.set(levy.unitId, []);
  }
  unpaidByUnit.get(levy.unitId)!.push(levy);
});

let arrearIdCounter = 1;
unpaidByUnit.forEach((levies, unitId) => {
  const unit = demoEstateUnits.find(u => u.id === unitId);
  if (!unit) return;
  
  const totalOutstanding = levies.reduce((sum, l) => sum + l.totalAmount, 0);
  const monthsOverdue = levies.length;
  const oldestLevy = levies.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month))[0];
  
  let riskLevel: ArrearsRiskLevel = 'low';
  if (monthsOverdue >= 4) riskLevel = 'critical';
  else if (monthsOverdue >= 2) riskLevel = 'high';
  else if (monthsOverdue >= 1) riskLevel = 'medium';
  
  demoLevyArrears.push({
    id: `arrear-${arrearIdCounter}`,
    estateId: unit.estateId,
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    ownerName: unit.ownerName,
    ownerEmail: unit.ownerEmail,
    ownerPhone: unit.ownerPhone,
    totalOutstanding,
    monthsOverdue,
    oldestUnpaidMonth: oldestLevy.month,
    oldestUnpaidYear: oldestLevy.year,
    riskLevel,
    unpaidLevies: levies.map(l => ({
      levyId: l.id,
      month: l.month,
      year: l.year,
      amount: l.amount,
      penalty: l.penaltyAmount,
      total: l.totalAmount,
      dueDate: l.dueDate,
      daysOverdue: Math.floor((Date.now() - new Date(l.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
    })),
    lastPaymentDate: Math.random() > 0.5 ? '2024-01-15' : undefined,
    lastPaymentAmount: Math.random() > 0.5 ? unit.levyAmount : undefined,
    reminderSent: Math.random() > 0.7 ? '2024-02-01' : undefined,
    legalNoticeSent: riskLevel === 'critical' ? '2024-02-15' : undefined,
    updatedAt: '2024-02-20T00:00:00Z',
  });
  
  arrearIdCounter++;
});

// ============================================================================
// Demo Owner Statements
// ============================================================================

export const demoOwnerStatements: OwnerStatement[] = [];

let statementIdCounter = 1;
demoEstateUnits.slice(0, 20).forEach((unit) => {
  if (unit.status === 'vacant') return;
  
  const month = 1;
  const year = 2024;
  
  const unitLevies = demoLevies.filter(l => l.unitId === unit.id && l.month === month && l.year === year);
  const leviesCharged = unitLevies.reduce((sum, l) => sum + l.amount, 0);
  const leviesPaid = unitLevies.reduce((sum, l) => sum + l.amountPaid, 0);
  const penaltiesCharged = unitLevies.reduce((sum, l) => sum + l.penaltyAmount, 0);
  const penaltiesPaid = unitLevies.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.penaltyAmount, 0);
  
  demoOwnerStatements.push({
    id: `statement-${statementIdCounter}`,
    estateId: unit.estateId,
    unitId: unit.id,
    ownerId: unit.ownerId,
    ownerName: unit.ownerName,
    unitNumber: unit.unitNumber,
    month,
    year,
    startDate: `${year}-${String(month).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month).padStart(2, '0')}-31`,
    leviesCharged,
    leviesPaid,
    leviesBalance: leviesCharged - leviesPaid,
    penaltiesCharged,
    penaltiesPaid,
    penaltiesBalance: penaltiesCharged - penaltiesPaid,
    totalCharged: leviesCharged + penaltiesCharged,
    totalPaid: leviesPaid + penaltiesPaid,
    totalBalance: (leviesCharged + penaltiesCharged) - (leviesPaid + penaltiesPaid),
    openingBalance: 0,
    closingBalance: (leviesCharged + penaltiesCharged) - (leviesPaid + penaltiesPaid),
    transactions: unitLevies.map(l => ({
      id: l.id,
      date: l.dueDate,
      description: `Levy - ${new Date(l.year, l.month - 1).toLocaleString('default', { month: 'long' })} ${l.year}`,
      type: 'charge',
      amount: l.amount,
      balance: l.balance,
    })),
    status: leviesPaid >= leviesCharged ? 'paid' : 'sent',
    sentAt: '2024-02-01T00:00:00Z',
    viewedAt: Math.random() > 0.5 ? '2024-02-05T00:00:00Z' : undefined,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  });
  
  statementIdCounter++;
});

// ============================================================================
// Export Summary
// ============================================================================

export const estateMockData = {
  estates: demoEstates,
  units: demoEstateUnits,
  levies: demoLevies,
  expenses: demoEstateExpenses,
  budgets: demoEstateBudgets,
  arrears: demoLevyArrears,
  statements: demoOwnerStatements,
};

export default estateMockData;

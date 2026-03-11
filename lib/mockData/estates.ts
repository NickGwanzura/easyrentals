// ============================================================================
// Zimbabwe Estate Accounting Mock Data
// 500 Levy Records | 50 Expenses | 10 Budgets
// Currency: USD (commonly used in Zimbabwe)
// ============================================================================

import { 
  Estate, EstateUnit, Levy, LevyStatus, EstateExpense, 
  EstateBudget, BudgetCategory, OwnerStatement, LevyArrear,
  ArrearsRiskLevel 
} from '@/types/estate';

// ============================================================================
// Zimbabwean Names
// ============================================================================

const zimbabweanFirstNames = [
  'Tatenda', 'Tendai', 'Farai', 'Blessing', 'Memory', 'Precious', 'Beauty', 'Lovemore',
  'Tawanda', 'Shingirai', 'Nyarai', 'Rumbidzai', 'Simbarashe', 'Tinotenda', 'Munashe',
  'Tanaka', 'Anesu', 'Kudakwashe', 'Kudzai', 'Tinashe', 'Paidamoyo', 'Makanaka',
  'Takudzwa', 'Rutendo', 'Tariro', 'Munyaradzi', 'Ngonidzashe', 'Vimbai', 'Thandiwe',
  'Sibongile', 'Nokuthula', 'Prudence', 'Gracious', 'Talent', 'Wisdom', 'Joy',
  'Junior', 'Progress', 'Trust', 'Trymore', 'Learnmore', 'Clever', 'Gift', 'Patience',
  'Fortunate', 'Hope', 'Faith', 'Mercy', 'Grace', 'Blessed'
];

const zimbabweanLastNames = [
  'Moyo', 'Sibanda', 'Ncube', 'Dube', 'Ndlovu', 'Khumalo', 'Mhlanga', 'Shumba',
  'Chiweshe', 'Gumbo', 'Muchena', 'Mudzuri', 'Chingono', 'Marufu', 'Chifamba',
  'Tshuma', 'Muzenda', 'Banda', 'Mapfumo', 'Makoni', 'Gwenzi', 'Charamba',
  'Mupfumi', 'Chikowore', 'Mutasa', 'Zvobgo', 'Chidzero', 'Muchinguri',
  'Mangwende', 'Chitepo', 'Tongogara', 'Sithole', 'Malianga', 'Mhondoro',
  'Chihuri', 'Mupandawana', 'Chombo', 'Kasukuwere', 'Mzembi', 'Mpofu',
  'Khaya', 'Dongo', 'Nyandoro', 'Chikukwa', 'Mashayamombe', 'Mudzengi'
];

// ============================================================================
// Zimbabwe Demo Estates
// ============================================================================

export const demoEstates: Estate[] = [
  {
    id: 'estate-1',
    name: 'Borrowdale Brooke Estate',
    address: '1 Borrowdale Road, Borrowdale',
    city: 'Harare',
    state: 'Harare Province',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Premium residential estate in Harare northern suburbs with 50 units',
    totalUnits: 50,
    defaultLevyAmount: 150, // USD
    levyDueDay: 1,
    penaltyEnabled: true,
    penaltyType: 'percentage',
    penaltyValue: 5,
    gracePeriodDays: 5,
    bankName: 'CBZ Bank',
    bankAccountNumber: '****4567',
    bankRoutingNumber: '6101',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-2',
    name: 'Helensvale Gardens',
    address: '123 Helensvale Drive',
    city: 'Harare',
    state: 'Harare Province',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Family-friendly estate in Helensvale with 75 units',
    totalUnits: 75,
    defaultLevyAmount: 100, // USD
    levyDueDay: 5,
    penaltyEnabled: true,
    penaltyType: 'fixed',
    penaltyValue: 15, // USD
    gracePeriodDays: 7,
    bankName: 'Stanbic Bank',
    bankAccountNumber: '****8901',
    bankRoutingNumber: '6201',
    status: 'active',
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-3',
    name: 'Bulawayo Hills Estate',
    address: '45 Hillside Road',
    city: 'Bulawayo',
    state: 'Bulawayo Province',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Luxury estate in Bulawayo with 40 units',
    totalUnits: 40,
    defaultLevyAmount: 120, // USD
    levyDueDay: 1,
    penaltyEnabled: true,
    penaltyType: 'percentage',
    penaltyValue: 3,
    gracePeriodDays: 3,
    bankName: 'CABS',
    bankAccountNumber: '****2345',
    bankRoutingNumber: '6301',
    status: 'active',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-4',
    name: 'Mutare Green Valley',
    address: '78 Palmerstone Road',
    city: 'Mutare',
    state: 'Manicaland',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Peaceful estate in Mutare with 60 units',
    totalUnits: 60,
    defaultLevyAmount: 80, // USD
    levyDueDay: 10,
    penaltyEnabled: false,
    penaltyType: 'fixed',
    penaltyValue: 0,
    gracePeriodDays: 10,
    bankName: 'Nedbank Zimbabwe',
    bankAccountNumber: '****6789',
    bankRoutingNumber: '6401',
    status: 'active',
    createdAt: '2023-04-20T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
  {
    id: 'estate-5',
    name: 'Victoria Falls Residences',
    address: '12 Livingstone Way',
    city: 'Victoria Falls',
    state: 'Matabeleland North',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Premier estate near Victoria Falls with 30 luxury units',
    totalUnits: 30,
    defaultLevyAmount: 200, // USD
    levyDueDay: 1,
    penaltyEnabled: true,
    penaltyType: 'percentage',
    penaltyValue: 10,
    gracePeriodDays: 0,
    bankName: 'First Capital Bank',
    bankAccountNumber: '****0123',
    bankRoutingNumber: '6501',
    status: 'active',
    createdAt: '2023-05-05T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    managedBy: 'user-admin-1',
  },
];

// ============================================================================
// Zimbabwe Estate Units (225 total units across 5 estates)
// ============================================================================

export const demoEstateUnits: EstateUnit[] = [];

const estateUnitCounts = [50, 75, 40, 60, 30];

let unitIdCounter = 1;
demoEstates.forEach((estate, estateIndex) => {
  const unitCount = estateUnitCounts[estateIndex];
  
  for (let i = 1; i <= unitCount; i++) {
    const firstName = zimbabweanFirstNames[Math.floor(Math.random() * zimbabweanFirstNames.length)];
    const lastName = zimbabweanLastNames[Math.floor(Math.random() * zimbabweanLastNames.length)];
    
    // Zimbabwe mobile number format: +263 7XX XXX XXX
    const mobileNetwork = ['71', '73', '77', '78'][Math.floor(Math.random() * 4)];
    const phoneNumber = `+263 ${mobileNetwork}${Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`;
    
    demoEstateUnits.push({
      id: `unit-${unitIdCounter}`,
      estateId: estate.id,
      unitNumber: `${i}`,
      unitType: ['apartment', 'house', 'townhouse'][Math.floor(Math.random() * 3)] as any,
      ownerId: `owner-${unitIdCounter}`,
      ownerName: `${firstName} ${lastName}`,
      ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      ownerPhone: phoneNumber,
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

let levyIdCounter = 1;
const statuses: LevyStatus[] = ['unpaid', 'paid', 'partial'];

demoEstateUnits.forEach((unit) => {
  if (unit.status === 'vacant') return;
  
  const monthsToGenerate = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < monthsToGenerate; i++) {
    const month = months[i];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = unit.levyAmount;
    const penaltyAmount = status === 'unpaid' && Math.random() > 0.5 ? Math.round(amount * 0.05) : 0;
    const amountPaid = status === 'paid' ? amount + penaltyAmount : status === 'partial' ? Math.round(amount * 0.5) : 0;
    
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
      paymentReference: status === 'paid' ? `ECO${Date.now().toString().slice(-6)}${levyIdCounter}` : undefined,
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

while (demoLevies.length < 500) {
  const unit = demoEstateUnits[Math.floor(Math.random() * demoEstateUnits.length)];
  if (unit.status === 'vacant') continue;
  
  const month = months[Math.floor(Math.random() * 12)];
  
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
// Demo Estate Expenses (50 records) - Zimbabwe Context
// ============================================================================

export const demoEstateExpenses: EstateExpense[] = [];

const expenseCategories: BudgetCategory[] = ['maintenance', 'security', 'cleaning', 'utilities', 'landscaping', 'admin', 'insurance', 'other'];
const expenseDescriptions: Record<BudgetCategory, string[]> = {
  maintenance: ['Borehole pump repair', 'Gate motor service', 'Perimeter wall painting', 'Road resurfacing', 'Electrical repairs', 'Plumbing maintenance'],
  security: ['Security guard wages', 'CCTV maintenance', 'Electric fence repair', 'Security patrol vehicle fuel', 'Alarm system service'],
  cleaning: ['Common area cleaning', 'Septic tank emptying', ' refuse collection', 'Storm drain clearing', 'Gutter cleaning'],
  utilities: ['ZESA electricity bill', 'City of Harare water', 'ZOL internet', 'TelOne landline', 'Generator diesel'],
  landscaping: ['Lawn mowing service', 'Tree pruning', 'Flower bed maintenance', 'Irrigation system repair', 'Weed control'],
  admin: ['Estate manager salary', 'Legal fees', 'Audit fees', 'Software subscriptions', 'AGM costs'],
  insurance: ['Buildings insurance', 'Public liability insurance', 'Fidelity guarantee', 'Vehicle insurance'],
  other: ['Emergency repairs', 'Sinking fund contribution', 'Reserve fund', 'Special projects'],
};

const zimbabweVendors = [
  'Trojan Construction', 'Nash Paints', 'PG Industries', 'Lafarge Cement', 
  'ZimSecurity Services', 'Safeguard Security', 'Redan Security',
  'City of Harare', 'ZESA Holdings', 'ZOL Zimbabwe', 'TelOne',
  'Pump & Plant Services', 'Electrosales', 'Plumblink Harare',
  'Garden Services Zimbabwe', 'Greencare Landscaping'
];

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
    amount: Math.floor(Math.random() * 1500) + 50, // USD amounts
    expenseDate: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    vendorName: zimbabweVendors[Math.floor(Math.random() * zimbabweVendors.length)],
    vendorContact: 'info@vendor.co.zw',
    paymentMethod: ['cash', 'bank_transfer', 'check'][Math.floor(Math.random() * 3)] as any,
    paymentDate: `2024-${String(month).padStart(2, '0')}-${String(day + 5).padStart(2, '0')}`,
    receiptUrl: Math.random() > 0.3 ? `https://receipts.eazyrentals.co.zw/expense-${i}.pdf` : undefined,
    invoiceNumber: `INV-ZW-${Date.now().toString().slice(-6)}-${i}`,
    approvedBy: 'user-admin-1',
    approvedAt: `2024-${String(month).padStart(2, '0')}-${String(day + 2).padStart(2, '0')}T00:00:00Z`,
    notes: Math.random() > 0.7 ? 'Urgent repair required' : undefined,
    createdAt: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`,
    updatedAt: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`,
    createdBy: 'user-admin-1',
  });
}

// ============================================================================
// Demo Estate Budgets (10 records)
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
      const budgeted = Math.floor(Math.random() * 2000) + 200; // USD
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
// Demo Levy Arrears
// ============================================================================

export const demoLevyArrears: LevyArrear[] = [];

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

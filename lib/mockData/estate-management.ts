// ============================================================================
// EasyRentals Estate Management Mock Data
// Zimbabwe Localization
// ============================================================================

import { 
  Estate, EstateBlock, EstateUnit, EstateLevy, 
  EstateMoveIn, EstateMoveOut, EstateAmenity, EstateDashboardSummary 
} from '@/types/estate-management';

// ============================================================================
// Zimbabwean Names
// ============================================================================

const firstNames = [
  'Tatenda', 'Tendai', 'Farai', 'Blessing', 'Memory', 'Precious', 'Beauty', 'Lovemore',
  'Tawanda', 'Shingirai', 'Nyarai', 'Rumbidzai', 'Simbarashe', 'Tinotenda', 'Munashe',
  'Tanaka', 'Anesu', 'Kudakwashe', 'Kudzai', 'Tinashe', 'Paidamoyo', 'Makanaka',
  'Takudzwa', 'Rutendo', 'Tariro', 'Munyaradzi', 'Ngonidzashe', 'Vimbai', 'Thandiwe',
  'Sibongile', 'Nokuthula', 'Prudence', 'Gracious', 'Talent', 'Wisdom', 'Joy',
  'Junior', 'Progress', 'Trust', 'Trymore', 'Learnmore', 'Clever', 'Gift', 'Patience',
  'Fortunate', 'Hope', 'Faith', 'Mercy', 'Grace', 'Blessed'
];

const lastNames = [
  'Moyo', 'Sibanda', 'Ncube', 'Dube', 'Ndlovu', 'Khumalo', 'Mhlanga', 'Shumba',
  'Chiweshe', 'Gumbo', 'Muchena', 'Mudzuri', 'Chingono', 'Marufu', 'Chifamba',
  'Tshuma', 'Muzenda', 'Banda', 'Mapfumo', 'Makoni', 'Gwenzi', 'Charamba',
  'Mupfumi', 'Chikowore', 'Mutasa', 'Zvobgo', 'Chidzero', 'Muchinguri',
  'Mangwende', 'Chitepo', 'Tongogara', 'Sithole', 'Malianga', 'Mhondoro',
  'Chihuri', 'Mupandawana', 'Chombo', 'Kasukuwere', 'Mzembi', 'Mpofu'
];

// ============================================================================
// Demo Estates (3 estates)
// ============================================================================

export const demoEstates: Estate[] = [
  {
    id: 'estate-1',
    name: 'Borrowdale Brooke Estate',
    address: '1 Borrowdale Road, Borrowdale',
    city: 'Harare',
    province: 'Harare Province',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Premier residential estate in Harare northern suburbs featuring luxury homes, townhouses, and apartments with 24/7 security and world-class amenities.',
    managerId: 'user-admin-1',
    managerName: 'Michael Anderson',
    managerPhone: '+263 77 123 4567',
    managerEmail: 'manager@borrowdalebrooke.co.zw',
    totalUnits: 25,
    hasBlocks: true,
    securityCompany: 'Safeguard Security',
    securityContact: '+263 77 999 8888',
    maintenanceCompany: 'Trojan Construction',
    maintenanceContact: '+263 71 234 5678',
    defaultLevyAmount: 200,
    levyDueDay: 1,
    bankName: 'CBZ Bank',
    bankAccountName: 'Borrowdale Brooke Estate',
    bankAccountNumber: '1234567890',
    bankBranch: 'Borrowdale Branch',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-admin-1',
  },
  {
    id: 'estate-2',
    name: 'Highlands Gardens Estate',
    address: '45 Enterprise Road, Highlands',
    city: 'Harare',
    province: 'Harare Province',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Family-friendly estate with modern townhouses, beautiful gardens, playground facilities, and community center.',
    managerId: 'user-admin-1',
    managerName: 'Sarah Johnson',
    managerPhone: '+263 77 987 6543',
    managerEmail: 'manager@highlandsgardens.co.zw',
    totalUnits: 18,
    hasBlocks: false,
    securityCompany: 'Redan Security',
    securityContact: '+263 77 888 7777',
    maintenanceCompany: 'Garden Services Zimbabwe',
    maintenanceContact: '+263 71 876 5432',
    defaultLevyAmount: 150,
    levyDueDay: 5,
    bankName: 'Stanbic Bank',
    bankAccountName: 'Highlands Gardens Estate',
    bankAccountNumber: '0987654321',
    bankBranch: 'Samora Machel Branch',
    status: 'active',
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-admin-1',
  },
  {
    id: 'estate-3',
    name: 'Bulawayo Hills Complex',
    address: '78 Hillside Road, Hillside',
    city: 'Bulawayo',
    province: 'Bulawayo Province',
    zipCode: '00000',
    country: 'Zimbabwe',
    description: 'Modern apartment complex in Bulawayo offering secure living with underground parking, gym, and swimming pool.',
    managerId: 'user-admin-1',
    managerName: 'Robert Williams',
    managerPhone: '+263 77 456 7890',
    managerEmail: 'manager@bulawayohills.co.zw',
    totalUnits: 7,
    hasBlocks: true,
    securityCompany: 'ZimSecurity Services',
    securityContact: '+263 77 777 6666',
    maintenanceCompany: 'Pump & Plant Services',
    maintenanceContact: '+263 71 345 6789',
    defaultLevyAmount: 120,
    levyDueDay: 1,
    bankName: 'CABS',
    bankAccountName: 'Bulawayo Hills Complex',
    bankAccountNumber: '5678901234',
    bankBranch: 'Jason Moyo Branch',
    status: 'active',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-admin-1',
  },
];

// ============================================================================
// Demo Blocks (for estates with blocks)
// ============================================================================

export const demoEstateBlocks: EstateBlock[] = [
  // Borrowdale Brooke - has blocks
  { id: 'block-1', estateId: 'estate-1', blockName: 'Block A', blockCode: 'A', description: 'Luxury Townhouses', totalUnits: 10, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'block-2', estateId: 'estate-1', blockName: 'Block B', blockCode: 'B', description: 'Garden Apartments', totalUnits: 8, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'block-3', estateId: 'estate-1', blockName: 'Block C', blockCode: 'C', description: 'Penthouse Suites', totalUnits: 7, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  
  // Bulawayo Hills - has blocks
  { id: 'block-4', estateId: 'estate-3', blockName: 'Tower 1', blockCode: 'T1', description: 'Ground to 3rd Floor', totalUnits: 4, createdAt: '2023-06-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'block-5', estateId: 'estate-3', blockName: 'Tower 2', blockCode: 'T2', description: '4th to 7th Floor', totalUnits: 3, createdAt: '2023-06-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

// ============================================================================
// Demo Units (50 units total)
// ============================================================================

export const demoEstateUnits: EstateUnit[] = [];

const unitTypes: EstateUnit['unitType'][] = ['apartment', 'house', 'townhouse', 'duplex', 'penthouse'];
const unitStatuses: EstateUnit['status'][] = ['occupied', 'vacant', 'owner_occupied'];

let unitIdCounter = 1;

// Generate units for Borrowdale Brooke (25 units)
const bbBlocks = ['block-1', 'block-2', 'block-3'];
const bbUnitsPerBlock = [10, 8, 7];

bbBlocks.forEach((blockId, blockIndex) => {
  const unitsInBlock = bbUnitsPerBlock[blockIndex];
  for (let i = 1; i <= unitsInBlock; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const status = unitStatuses[Math.floor(Math.random() * unitStatuses.length)];
    const mobileNetwork = ['71', '73', '77', '78'][Math.floor(Math.random() * 4)];
    
    demoEstateUnits.push({
      id: `unit-${unitIdCounter}`,
      estateId: 'estate-1',
      blockId: blockId,
      blockName: demoEstateBlocks.find(b => b.id === blockId)?.blockName,
      unitNumber: `${demoEstateBlocks.find(b => b.id === blockId)?.blockCode}-${String(i).padStart(2, '0')}`,
      unitType: unitTypes[Math.floor(Math.random() * unitTypes.length)],
      bedrooms: Math.floor(Math.random() * 4) + 2,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      squareMeters: 120 + Math.floor(Math.random() * 200),
      parkingSpaces: Math.floor(Math.random() * 3) + 1,
      ownerId: `owner-${unitIdCounter}`,
      ownerName: `${firstName} ${lastName}`,
      ownerPhone: `+263 ${mobileNetwork}${Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,
      ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      ownerAddress: `${Math.floor(Math.random() * 100) + 1} Borrowdale Road, Harare`,
      tenantName: status === 'occupied' ? 'Tenant Name' : undefined,
      tenantPhone: status === 'occupied' ? `+263 77 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}` : undefined,
      levyAmount: 200 + Math.floor(Math.random() * 100),
      outstandingLevy: status === 'occupied' ? Math.floor(Math.random() * 400) : 0,
      status: status,
      purchaseDate: '2020-01-01',
      occupancyDate: status !== 'vacant' ? '2023-02-01' : undefined,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    
    unitIdCounter++;
  }
});

// Generate units for Highlands Gardens (18 units - no blocks)
for (let i = 1; i <= 18; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const status = unitStatuses[Math.floor(Math.random() * unitStatuses.length)];
  const mobileNetwork = ['71', '73', '77', '78'][Math.floor(Math.random() * 4)];
  
  demoEstateUnits.push({
    id: `unit-${unitIdCounter}`,
    estateId: 'estate-2',
    unitNumber: String(i),
    unitType: unitTypes[Math.floor(Math.random() * 3)],
    bedrooms: Math.floor(Math.random() * 3) + 2,
    bathrooms: Math.floor(Math.random() * 2) + 1,
    squareMeters: 100 + Math.floor(Math.random() * 150),
    parkingSpaces: Math.floor(Math.random() * 2) + 1,
    ownerId: `owner-${unitIdCounter}`,
    ownerName: `${firstName} ${lastName}`,
    ownerPhone: `+263 ${mobileNetwork}${Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,
    ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    ownerAddress: `${Math.floor(Math.random() * 100) + 1} Enterprise Road, Highlands, Harare`,
    tenantName: status === 'occupied' ? 'Tenant Name' : undefined,
    levyAmount: 150 + Math.floor(Math.random() * 50),
    outstandingLevy: status === 'occupied' ? Math.floor(Math.random() * 300) : 0,
    status: status,
    purchaseDate: '2021-01-01',
    occupancyDate: status !== 'vacant' ? '2023-03-01' : undefined,
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  });
  
  unitIdCounter++;
}

// Generate units for Bulawayo Hills (7 units)
const bhBlocks = ['block-4', 'block-5'];
const bhUnitsPerBlock = [4, 3];

bhBlocks.forEach((blockId, blockIndex) => {
  const unitsInBlock = bhUnitsPerBlock[blockIndex];
  for (let i = 1; i <= unitsInBlock; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const status = unitStatuses[Math.floor(Math.random() * unitStatuses.length)];
    const mobileNetwork = ['71', '73', '77', '78'][Math.floor(Math.random() * 4)];
    
    demoEstateUnits.push({
      id: `unit-${unitIdCounter}`,
      estateId: 'estate-3',
      blockId: blockId,
      blockName: demoEstateBlocks.find(b => b.id === blockId)?.blockName,
      unitNumber: `${demoEstateBlocks.find(b => b.id === blockId)?.blockCode}-${String(i).padStart(2, '0')}`,
      unitType: 'apartment',
      bedrooms: Math.floor(Math.random() * 2) + 1,
      bathrooms: 1,
      squareMeters: 80 + Math.floor(Math.random() * 60),
      parkingSpaces: 1,
      ownerId: `owner-${unitIdCounter}`,
      ownerName: `${firstName} ${lastName}`,
      ownerPhone: `+263 ${mobileNetwork}${Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,
      ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      ownerAddress: `${Math.floor(Math.random() * 100) + 1} Hillside Road, Bulawayo`,
      tenantName: status === 'occupied' ? 'Tenant Name' : undefined,
      levyAmount: 120 + Math.floor(Math.random() * 30),
      outstandingLevy: status === 'occupied' ? Math.floor(Math.random() * 240) : 0,
      status: status,
      purchaseDate: '2022-01-01',
      occupancyDate: status !== 'vacant' ? '2023-06-01' : undefined,
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    
    unitIdCounter++;
  }
});

// ============================================================================
// Demo Levies (100 records)
// ============================================================================

export const demoEstateLevies: EstateLevy[] = [];

let levyIdCounter = 1;
const currentYear = 2024;
const months = [1, 2, 3];

// Generate 2-3 months of levies for occupied units
demoEstateUnits.forEach((unit) => {
  if (unit.status === 'vacant') return;
  
  const monthsToGenerate = Math.floor(Math.random() * 2) + 2; // 2-3 months
  
  for (let i = 0; i < monthsToGenerate; i++) {
    const month = months[i];
    const isPaid = Math.random() > 0.3; // 70% paid
    const levyAmount = unit.levyAmount || 150;
    const paidAmount = isPaid ? levyAmount : Math.floor(Math.random() * levyAmount * 0.5);
    
    demoEstateLevies.push({
      id: `levy-${levyIdCounter}`,
      estateId: unit.estateId,
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      estateName: demoEstates.find(e => e.id === unit.estateId)?.name,
      month,
      year: currentYear,
      levyAmount,
      paidAmount,
      balance: levyAmount - paidAmount,
      status: paidAmount === levyAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
      dueDate: `${currentYear}-${String(month).padStart(2, '0')}-01`,
      paidDate: paidAmount > 0 ? `${currentYear}-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : undefined,
      paymentMethod: paidAmount > 0 ? ['ecocash', 'bank_transfer', 'cash'][Math.floor(Math.random() * 3)] as any : undefined,
      paymentReference: paidAmount > 0 ? `REF${Date.now().toString().slice(-6)}${levyIdCounter}` : undefined,
      notes: Math.random() > 0.9 ? 'Partial payment arrangement' : undefined,
      createdAt: `${currentYear}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
      updatedAt: `${currentYear}-${String(month).padStart(2, '0')}-15T00:00:00Z`,
    });
    
    levyIdCounter++;
  }
});

// Ensure we have exactly 100 levies
while (demoEstateLevies.length < 100) {
  const unit = demoEstateUnits[Math.floor(Math.random() * demoEstateUnits.length)];
  if (unit.status === 'vacant') continue;
  
  const month = months[Math.floor(Math.random() * months.length)];
  
  if (demoEstateLevies.some(l => l.unitId === unit.id && l.month === month && l.year === currentYear)) {
    continue;
  }
  
  const levyAmount = unit.levyAmount || 150;
  
  demoEstateLevies.push({
    id: `levy-${levyIdCounter}`,
    estateId: unit.estateId,
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    estateName: demoEstates.find(e => e.id === unit.estateId)?.name,
    month,
    year: currentYear,
    levyAmount,
    paidAmount: 0,
    balance: levyAmount,
    status: 'unpaid',
    dueDate: `${currentYear}-${String(month).padStart(2, '0')}-01`,
    createdAt: `${currentYear}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
    updatedAt: `${currentYear}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
  });
  
  levyIdCounter++;
}

// ============================================================================
// Demo Move Ins (10 records)
// ============================================================================

export const demoEstateMoveIns: EstateMoveIn[] = [];

for (let i = 1; i <= 10; i++) {
  const unit = demoEstateUnits.filter(u => u.status !== 'vacant')[i - 1];
  if (!unit) continue;
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const mobileNetwork = ['71', '73', '77', '78'][Math.floor(Math.random() * 4)];
  
  demoEstateMoveIns.push({
    id: `movein-${i}`,
    estateId: unit.estateId,
    unitId: unit.id,
    estateName: demoEstates.find(e => e.id === unit.estateId)?.name,
    unitNumber: unit.unitNumber,
    residentName: `${firstName} ${lastName}`,
    residentPhone: `+263 ${mobileNetwork}${Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,
    residentEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    residentIdNumber: `${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 900000) + 100000} L ${Math.floor(Math.random() * 90) + 10}`,
    moveInDate: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    leaseStartDate: '2024-01-01',
    leaseEndDate: '2024-12-31',
    depositPaid: 400,
    depositAmount: 400,
    firstMonthLevyPaid: true,
    keysIssued: true,
    keysIssuedDate: '2024-01-01',
    accessCardsIssued: 2,
    inspectionCompleted: true,
    inspectionDate: '2024-01-01',
    inspectionNotes: 'Unit in good condition',
    documentsSigned: true,
    documentsSignedDate: '2024-01-01',
    emergencyContactName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    emergencyContactPhone: `+263 77 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,
    emergencyContactRelationship: 'Spouse',
    vehicleRegistration: `ABC ${Math.floor(Math.random() * 9000) + 1000}`,
    vehicleMakeModel: ['Toyota Hilux', 'Nissan X-Trail', 'Ford Ranger', 'VW Golf'][Math.floor(Math.random() * 4)],
    vehicleColor: ['White', 'Silver', 'Black', 'Blue'][Math.floor(Math.random() * 4)],
    notes: 'Welcome to the estate!',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-admin-1',
  });
}

// ============================================================================
// Demo Move Outs (10 records)
// ============================================================================

export const demoEstateMoveOuts: EstateMoveOut[] = [];

for (let i = 1; i <= 10; i++) {
  const unit = demoEstateUnits.filter(u => u.status === 'vacant')[i - 1] || demoEstateUnits[i];
  if (!unit) continue;
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  demoEstateMoveOuts.push({
    id: `moveout-${i}`,
    estateId: unit.estateId,
    unitId: unit.id,
    moveInId: `movein-${i}`,
    estateName: demoEstates.find(e => e.id === unit.estateId)?.name,
    unitNumber: unit.unitNumber,
    residentName: `${firstName} ${lastName}`,
    noticeDate: '2023-12-01',
    noticePeriodDays: 30,
    moveOutDate: '2023-12-31',
    actualMoveOutDate: '2023-12-31',
    keysReturned: true,
    keysReturnedDate: '2023-12-31',
    accessCardsReturned: 2,
    finalInspectionCompleted: true,
    finalInspectionDate: '2023-12-31',
    finalInspectionNotes: 'Minor wear and tear noted',
    damagesRecorded: false,
    damageDescription: undefined,
    damageCharges: 0,
    cleaningRequired: true,
    cleaningCharges: 50,
    outstandingRent: 0,
    outstandingLevies: 0,
    otherCharges: 50,
    totalDeductions: 50,
    depositRefunded: true,
    depositRefundAmount: 350,
    depositRefundDate: '2024-01-05',
    depositRefundMethod: 'Bank Transfer',
    forwardingAddress: 'New Address, Harare',
    notes: 'Tenant left in good standing',
    status: 'completed',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    createdBy: 'user-admin-1',
  });
}

// ============================================================================
// Demo Amenities
// ============================================================================

export const demoEstateAmenities: EstateAmenity[] = [
  { id: 'amenity-1', estateId: 'estate-1', amenityName: 'Swimming Pool', description: 'Olympic-sized swimming pool', isPaid: false, additionalCost: 0, createdAt: '2023-01-01T00:00:00Z' },
  { id: 'amenity-2', estateId: 'estate-1', amenityName: 'Gym', description: '24/7 fitness center', isPaid: false, additionalCost: 0, createdAt: '2023-01-01T00:00:00Z' },
  { id: 'amenity-3', estateId: 'estate-1', amenityName: 'Tennis Court', description: 'Two tennis courts', isPaid: false, additionalCost: 0, createdAt: '2023-01-01T00:00:00Z' },
  { id: 'amenity-4', estateId: 'estate-1', amenityName: 'Clubhouse', description: 'Event venue for hire', isPaid: true, additionalCost: 100, createdAt: '2023-01-01T00:00:00Z' },
  { id: 'amenity-5', estateId: 'estate-2', amenityName: 'Playground', description: 'Children playground', isPaid: false, additionalCost: 0, createdAt: '2023-03-15T00:00:00Z' },
  { id: 'amenity-6', estateId: 'estate-2', amenityName: 'Community Hall', description: 'Community gathering space', isPaid: false, additionalCost: 0, createdAt: '2023-03-15T00:00:00Z' },
  { id: 'amenity-7', estateId: 'estate-3', amenityName: 'Gym', description: 'Fitness center', isPaid: false, additionalCost: 0, createdAt: '2023-06-01T00:00:00Z' },
  { id: 'amenity-8', estateId: 'estate-3', amenityName: 'Underground Parking', description: 'Secure parking', isPaid: true, additionalCost: 30, createdAt: '2023-06-01T00:00:00Z' },
];

// ============================================================================
// Dashboard Summaries
// ============================================================================

export const demoEstateDashboardSummaries: EstateDashboardSummary[] = demoEstates.map(estate => {
  const estateUnits = demoEstateUnits.filter(u => u.estateId === estate.id);
  const estateLevies = demoEstateLevies.filter(l => l.estateId === estate.id);
  
  return {
    estateId: estate.id,
    estateName: estate.name,
    totalUnits: estateUnits.length,
    occupiedUnits: estateUnits.filter(u => u.status === 'occupied').length,
    vacantUnits: estateUnits.filter(u => u.status === 'vacant').length,
    ownerOccupiedUnits: estateUnits.filter(u => u.status === 'owner_occupied').length,
    occupancyRate: Math.round((estateUnits.filter(u => u.status === 'occupied').length / estateUnits.length) * 100),
    monthlyLeviesCollected: estateLevies.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.paidAmount, 0),
    outstandingLevies: estateLevies.filter(l => l.status !== 'paid').reduce((sum, l) => sum + l.balance, 0),
    openRepairs: Math.floor(Math.random() * 5),
    recentMoveIns: demoEstateMoveIns.filter(m => m.estateId === estate.id).length,
    recentMoveOuts: demoEstateMoveOuts.filter(m => m.estateId === estate.id).length,
  };
});

// ============================================================================
// Export All
// ============================================================================

export const estateManagementMockData = {
  estates: demoEstates,
  blocks: demoEstateBlocks,
  units: demoEstateUnits,
  levies: demoEstateLevies,
  moveIns: demoEstateMoveIns,
  moveOuts: demoEstateMoveOuts,
  amenities: demoEstateAmenities,
  dashboardSummaries: demoEstateDashboardSummaries,
};

export default estateManagementMockData;

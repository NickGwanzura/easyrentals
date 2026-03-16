'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useToast } from '@/components/ui/Toast';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  demoEstates,
  demoEstateUnits,
  demoEstateLevies,
} from '@/lib/mockData/estate-management';
import { demoUsers } from '@/lib/mockData';
import { useRequireAuth } from '@/lib/auth/context';
import { useWorkflow } from '@/lib/workflow/context';
import type { EstateUnit, EstateUnitStatus, User } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Eye,
  Home,
  KeyRound,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundMinus,
  X,
} from 'lucide-react';

const ownerCandidates = demoUsers.filter((candidate) =>
  candidate.role === 'admin' || candidate.role === 'landlord'
);

function createInitialFormData(user: User | null) {
  const isLandlord = user?.role === 'landlord';

  return {
    unitNumber: '',
    estateId: '',
    blockName: '',
    ownerUserId: isLandlord ? user.id : '',
    ownerName: isLandlord ? `${user.firstName} ${user.lastName}` : '',
    ownerPhone: isLandlord ? user.phone || '' : '',
    ownerEmail: isLandlord ? user.email : '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    status: 'vacant' as EstateUnitStatus,
    monthlyLevy: 0,
    monthlyRent: 0,
    securityDeposit: 0,
    leaseStartDate: '',
    leaseEndDate: '',
  };
}

function getOwnerDetails(ownerUserId: string) {
  const owner = ownerCandidates.find((candidate) => candidate.id === ownerUserId);
  if (!owner) return null;

  return {
    ownerUserId: owner.id,
    ownerName: `${owner.firstName} ${owner.lastName}`,
    ownerPhone: owner.phone || '',
    ownerEmail: owner.email,
  };
}

function EstateUnitsContent() {
  const searchParams = useSearchParams();
  const estateId = searchParams.get('estate');
  const { showToast } = useToast();
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { addEvent } = useWorkflow();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEstate, setSelectedEstate] = useState<string>(estateId || 'all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<EstateUnit | null>(null);
  const [unitPendingRemoval, setUnitPendingRemoval] = useState<EstateUnit | null>(null);
  const [delegatedOwnerId, setDelegatedOwnerId] = useState('');
  const [unitRecords, setUnitRecords] = useState<EstateUnit[]>(() => [...demoEstateUnits]);
  const [formData, setFormData] = useState(() => createInitialFormData(user));

  useEffect(() => {
    if (user?.role === 'landlord') {
      setFormData((current) => (
        current.ownerUserId
          ? current
          : createInitialFormData(user)
      ));
    }
  }, [user]);

  const visibleUnits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return unitRecords
      .filter((unit) => {
        if (selectedEstate !== 'all' && unit.estateId !== selectedEstate) {
          return false;
        }

        if (statusFilter !== 'all' && unit.status !== statusFilter) {
          return false;
        }

        if (user?.role === 'landlord') {
          const isAssignedOwner =
            unit.ownerUserId === user.id ||
            unit.ownerEmail?.toLowerCase() === user.email.toLowerCase();
          if (!isAssignedOwner) {
            return false;
          }
        }

        if (!query) {
          return true;
        }

        return [
          unit.unitNumber,
          unit.estateName,
          unit.blockName,
          unit.ownerName,
          unit.tenantName,
        ].some((value) => value?.toLowerCase().includes(query));
      });
  }, [searchQuery, selectedEstate, statusFilter, unitRecords, user]);

  const summary = useMemo(() => ({
    total: visibleUnits.length,
    rentals: visibleUnits.filter((unit) => unit.status === 'occupied').length,
    ownerOccupied: visibleUnits.filter((unit) => unit.status === 'owner_occupied').length,
    vacant: visibleUnits.filter((unit) => unit.status === 'vacant').length,
  }), [visibleUnits]);

  const canAssignOwner = user?.role === 'admin';

  const syncGlobalUnitRecord = (updatedUnit: EstateUnit) => {
    const globalIndex = demoEstateUnits.findIndex((unit) => unit.id === updatedUnit.id);

    if (globalIndex >= 0) {
      demoEstateUnits[globalIndex] = updatedUnit;
    } else {
      demoEstateUnits.push(updatedUnit);
    }
  };

  const updateUnitRecord = (updatedUnit: EstateUnit) => {
    setUnitRecords((current) =>
      current.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
    );
    syncGlobalUnitRecord(updatedUnit);
  };

  const getUnitLevy = (unitId: string) => {
    const levies = demoEstateLevies.filter((levy) => levy.unitId === unitId);
    return levies.reduce((sum, levy) => sum + levy.balance, 0);
  };

  const canManageUnitTenant = (unit: EstateUnit) =>
    !!user &&
    unit.status === 'occupied' &&
    !!unit.tenantName &&
    (user.role === 'admin' || unit.ownerUserId === user.id);

  const resetForm = () => {
    setFormData(createInitialFormData(user));
  };

  const handleStatusChange = (nextStatus: EstateUnitStatus) => {
    setFormData((current) => ({
      ...current,
      status: nextStatus,
      tenantName: nextStatus === 'occupied' ? current.tenantName : '',
      tenantPhone: nextStatus === 'occupied' ? current.tenantPhone : '',
      tenantEmail: nextStatus === 'occupied' ? current.tenantEmail : '',
      monthlyRent: nextStatus === 'occupied' ? current.monthlyRent : 0,
      securityDeposit: nextStatus === 'occupied' ? current.securityDeposit : 0,
      leaseStartDate: nextStatus === 'occupied' ? current.leaseStartDate : '',
      leaseEndDate: nextStatus === 'occupied' ? current.leaseEndDate : '',
    }));
  };

  const handleOwnerSelection = (ownerUserId: string) => {
    const ownerDetails = getOwnerDetails(ownerUserId);

    setFormData((current) => ({
      ...current,
      ownerUserId,
      ownerName: ownerDetails?.ownerName || current.ownerName,
      ownerPhone: ownerDetails?.ownerPhone || current.ownerPhone,
      ownerEmail: ownerDetails?.ownerEmail || current.ownerEmail,
    }));
  };

  const handleOpenUnit = (unit: EstateUnit) => {
    setViewingUnit(unit);
    setDelegatedOwnerId(unit.ownerUserId || '');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();

    const estate = demoEstates.find((estateItem) => estateItem.id === formData.estateId);
    if (!estate) {
      showToast('Select an estate before creating a unit.', 'error');
      return;
    }

    if (canAssignOwner && !formData.ownerUserId) {
      showToast('Assign a property owner before saving the unit.', 'error');
      return;
    }

    const isRentalUnit = formData.status === 'occupied';
    const nextOwnerDetails = getOwnerDetails(formData.ownerUserId);

    const newUnit: EstateUnit = {
      id: `unit-${Date.now()}`,
      estateId: formData.estateId,
      estateName: estate.name,
      unitNumber: formData.unitNumber,
      blockName: formData.blockName || undefined,
      ownerId: formData.ownerUserId || undefined,
      ownerUserId: formData.ownerUserId || undefined,
      ownerName: nextOwnerDetails?.ownerName || formData.ownerName || undefined,
      ownerPhone: nextOwnerDetails?.ownerPhone || formData.ownerPhone || undefined,
      ownerEmail: nextOwnerDetails?.ownerEmail || formData.ownerEmail || undefined,
      tenantName: isRentalUnit ? formData.tenantName || undefined : undefined,
      tenantPhone: isRentalUnit ? formData.tenantPhone || undefined : undefined,
      tenantEmail: isRentalUnit ? formData.tenantEmail || undefined : undefined,
      status: formData.status,
      monthlyLevy: formData.monthlyLevy,
      levyAmount: formData.monthlyLevy,
      outstandingLevy: 0,
      monthlyRent: isRentalUnit ? formData.monthlyRent || undefined : undefined,
      securityDeposit: isRentalUnit ? formData.securityDeposit || undefined : undefined,
      leaseStartDate: isRentalUnit ? formData.leaseStartDate || undefined : undefined,
      leaseEndDate: isRentalUnit ? formData.leaseEndDate || undefined : undefined,
      unitType: 'apartment',
      parkingSpaces: 1,
      occupancyDate: formData.status === 'vacant' ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoEstateUnits.push(newUnit);
    setUnitRecords((current) => [...current, newUnit]);
    estate.totalUnits += 1;

    showToast('Estate unit created successfully.', 'success');
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleRemoveTenant = (unit: EstateUnit) => {
    if (!canManageUnitTenant(unit)) {
      showToast('You do not have permission to remove this tenant.', 'error');
      return;
    }

    setUnitPendingRemoval(unit);
  };

  const confirmRemoveTenant = () => {
    if (!unitPendingRemoval) {
      return;
    }

    const unit = unitPendingRemoval;

    if (!canManageUnitTenant(unit)) {
      showToast('You do not have permission to remove this tenant.', 'error');
      return;
    }

    const updatedUnit: EstateUnit = {
      ...unit,
      status: 'vacant',
      tenantId: undefined,
      tenantName: undefined,
      tenantPhone: undefined,
      tenantEmail: undefined,
      monthlyRent: undefined,
      securityDeposit: undefined,
      leaseStartDate: undefined,
      leaseEndDate: undefined,
      occupancyDate: undefined,
      updatedAt: new Date().toISOString(),
    };

    updateUnitRecord(updatedUnit);

    if (viewingUnit?.id === unit.id) {
      setViewingUnit(updatedUnit);
      setDelegatedOwnerId(updatedUnit.ownerUserId || '');
    }

    addEvent({
      type: 'tenant_removed',
      entityId: unit.id,
      title: `Tenant removed from Unit ${unit.unitNumber}`,
      description: `${unit.estateName || 'Estate unit'} is now vacant and should move into turnover or remarketing.`,
      href: '/estates/estate-units',
      actorUserId: user?.id,
      ownerUserId: unit.ownerUserId,
    });

    setUnitPendingRemoval(null);
    showToast(`Tenant removed from Unit ${unit.unitNumber}.`, 'success');
  };

  const handleDelegateOwner = () => {
    if (!viewingUnit || !canAssignOwner) {
      return;
    }

    if (!delegatedOwnerId) {
      showToast('Choose a property owner to delegate this unit.', 'error');
      return;
    }

    const ownerDetails = getOwnerDetails(delegatedOwnerId);
    if (!ownerDetails) {
      showToast('Selected property owner could not be found.', 'error');
      return;
    }

    const updatedUnit: EstateUnit = {
      ...viewingUnit,
      ownerId: ownerDetails.ownerUserId,
      ownerUserId: ownerDetails.ownerUserId,
      ownerName: ownerDetails.ownerName,
      ownerPhone: ownerDetails.ownerPhone || viewingUnit.ownerPhone,
      ownerEmail: ownerDetails.ownerEmail,
      updatedAt: new Date().toISOString(),
    };

    updateUnitRecord(updatedUnit);
    setViewingUnit(updatedUnit);
    addEvent({
      type: 'owner_delegated',
      entityId: updatedUnit.id,
      title: `Owner delegated to Unit ${updatedUnit.unitNumber}`,
      description: `${ownerDetails.ownerName} now has owner-level access for ${updatedUnit.estateName || 'this estate unit'}.`,
      href: '/estates/estate-units',
      actorUserId: user?.id,
      ownerUserId: ownerDetails.ownerUserId,
    });
    showToast(`Unit ${viewingUnit.unitNumber} assigned to ${ownerDetails.ownerName}.`, 'success');
  };

  return (
    <DashboardLayout title="Estate Units">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
              <Building2 className="h-4 w-4" />
              <span>Estate Management</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-700">Units & Rentals</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Estate Units</h1>
            <p className="mt-1 text-sm text-slate-500">
              Rentals live inside each estate unit, with delegated owner access for tenant management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="min-w-[120px]">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Units</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
            </Card>
            <Card className="min-w-[120px]">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rentals</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.rentals}</p>
            </Card>
            <Card className="min-w-[120px]">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Owner Occupied</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.ownerOccupied}</p>
            </Card>
            <Card className="min-w-[120px]">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Vacant</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.vacant}</p>
            </Card>
          </div>
        </div>

        <Card className="border border-primary-100 bg-primary-50/60">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {canAssignOwner
                    ? 'Admins can delegate a property owner per unit.'
                    : 'You can manage tenants only on units delegated to you.'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {canAssignOwner
                    ? 'Assign owners on creation or from the unit drawer, then those owners can remove tenants from their rental units.'
                    : 'Your estate access is scoped to units where you are the delegated property owner.'}
                </p>
              </div>
            </div>

            {canAssignOwner && (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Unit
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search units, owners, or tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedEstate}
              onChange={(e) => setSelectedEstate(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Estates</option>
              {demoEstates.map((estate) => (
                <option key={estate.id} value={estate.id}>
                  {estate.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="occupied">Rental Occupied</option>
              <option value="vacant">Vacant</option>
              <option value="owner_occupied">Owner Occupied</option>
            </select>
          </div>
        </Card>

        <Card>
          <CardHeader title={`${visibleUnits.length} Units`} />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Estate / Block</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Property Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rental</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Levy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUnits.map((unit) => {
                  const delegatedOwner = ownerCandidates.find((candidate) => candidate.id === unit.ownerUserId);
                  const outstandingLevy = getUnitLevy(unit.id);

                  return (
                    <tr key={unit.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                            <Home className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Unit {unit.unitNumber}</p>
                            <p className="text-xs text-slate-500">{unit.blockName || 'No block assigned'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-900">{unit.estateName}</p>
                        {unit.blockName && <p className="text-xs text-slate-500">{unit.blockName}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-900">{unit.ownerName || '-'}</p>
                        {delegatedOwner && (
                          <p className="mt-1 text-xs text-primary-700">
                            Access: {delegatedOwner.firstName} {delegatedOwner.lastName}
                          </p>
                        )}
                        {unit.ownerPhone && (
                          <div className="mt-1 flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{unit.ownerPhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {unit.tenantName ? (
                          <div>
                            <p className="text-sm text-slate-900">{unit.tenantName}</p>
                            {unit.tenantPhone && (
                              <div className="mt-1 flex items-center gap-2">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-500">{unit.tenantPhone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">No tenant</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {unit.status === 'occupied' ? (
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {formatCurrency(unit.monthlyRent || 0)}/mo
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Deposit {formatCurrency(unit.securityDeposit || 0)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {unit.status === 'owner_occupied' ? 'Owner use' : 'Not rented'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={unit.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {formatCurrency(unit.monthlyLevy || 0)}/mo
                          </p>
                          {outstandingLevy > 0 && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-danger-600">
                              <AlertTriangle className="h-3 w-3" />
                              {formatCurrency(outstandingLevy)} owed
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => handleOpenUnit(unit)}
                          >
                            View
                          </Button>
                          {canManageUnitTenant(unit) && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<UserRoundMinus className="h-4 w-4" />}
                              onClick={() => handleRemoveTenant(unit)}
                            >
                              Remove Tenant
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {visibleUnits.length === 0 && (
            <div className="py-12 text-center">
              <Home className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-1 text-lg font-medium text-slate-900">No units found</h3>
              <p className="text-slate-500">
                {user?.role === 'landlord'
                  ? 'No units are currently delegated to this property owner.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Estate Unit"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              leftIcon={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUnit}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Create Unit
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddUnit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Estate *</label>
              <select
                required
                value={formData.estateId}
                onChange={(e) => setFormData({ ...formData, estateId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select estate</option>
                {demoEstates.map((estate) => (
                  <option key={estate.id} value={estate.id}>
                    {estate.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Unit Number *</label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. A-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Block Name</label>
              <input
                type="text"
                value={formData.blockName}
                onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Block A"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Occupancy Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value as EstateUnitStatus)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Rental Occupied</option>
                <option value="owner_occupied">Owner Occupied</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Monthly Levy (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.monthlyLevy}
                onChange={(e) => setFormData({ ...formData, monthlyLevy: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary-600" />
              <h4 className="text-sm font-semibold text-slate-900">Property Owner Access</h4>
            </div>

            {canAssignOwner ? (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Delegated Owner *</label>
                <select
                  required
                  value={formData.ownerUserId}
                  onChange={(e) => handleOwnerSelection(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose property owner</option>
                  {ownerCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.firstName} {candidate.lastName} ({candidate.role})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-slate-700">
                This unit will be assigned to you as the property owner.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  disabled={!canAssignOwner && user?.role === 'landlord'}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Owner name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Owner Phone</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  disabled={!canAssignOwner && user?.role === 'landlord'}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="+263 71 123 4567"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Owner Email</label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                disabled={!canAssignOwner && user?.role === 'landlord'}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="owner@example.com"
              />
            </div>
          </div>

          {formData.status === 'occupied' && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary-600" />
                <h4 className="text-sm font-semibold text-slate-900">Rental & Tenant Details</h4>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Tenant Name</label>
                  <input
                    type="text"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Tenant name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Tenant Phone</label>
                  <input
                    type="tel"
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+263 71 123 4567"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Tenant Email</label>
                <input
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="tenant@example.com"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Monthly Rent (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Security Deposit (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Lease Start</label>
                  <input
                    type="date"
                    value={formData.leaseStartDate}
                    onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Lease End</label>
                  <input
                    type="date"
                    value={formData.leaseEndDate}
                    onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={!!viewingUnit}
        onClose={() => setViewingUnit(null)}
        title={viewingUnit ? `Unit ${viewingUnit.unitNumber}` : 'Unit details'}
        size="md"
        footer={
          viewingUnit && canAssignOwner ? (
            <div className="flex justify-end">
              <Button
                variant="primary"
                leftIcon={<Save className="h-4 w-4" />}
                onClick={handleDelegateOwner}
              >
                Save Delegation
              </Button>
            </div>
          ) : undefined
        }
      >
        {viewingUnit && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <StatusBadge status={viewingUnit.status} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Estate</span>
                <span className="text-sm font-medium text-slate-900">{viewingUnit.estateName}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Monthly Levy</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(viewingUnit.monthlyLevy || 0)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Outstanding Levy</span>
                <span className={`text-sm font-medium ${getUnitLevy(viewingUnit.id) > 0 ? 'text-danger-600' : 'text-slate-900'}`}>
                  {formatCurrency(getUnitLevy(viewingUnit.id))}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary-600" />
                <h4 className="text-sm font-semibold text-slate-900">Property Owner Access</h4>
              </div>

              {canAssignOwner ? (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Delegated Owner</label>
                  <select
                    value={delegatedOwnerId}
                    onChange={(e) => setDelegatedOwnerId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose property owner</option>
                    {ownerCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.firstName} {candidate.lastName} ({candidate.role})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-slate-700">
                  This unit is delegated to you for owner-level access.
                </div>
              )}

              {viewingUnit.ownerName && <p className="text-sm font-medium text-slate-900">{viewingUnit.ownerName}</p>}
              {viewingUnit.ownerPhone && <p className="mt-1 text-sm text-slate-500">{viewingUnit.ownerPhone}</p>}
              {viewingUnit.ownerEmail && <p className="text-sm text-slate-500">{viewingUnit.ownerEmail}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary-600" />
                <h4 className="text-sm font-semibold text-slate-900">Rental Details</h4>
              </div>

              {viewingUnit.status === 'occupied' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Monthly Rent</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(viewingUnit.monthlyRent || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Security Deposit</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(viewingUnit.securityDeposit || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Lease Window</span>
                    <span className="text-right text-sm font-medium text-slate-900">
                      {viewingUnit.leaseStartDate || 'Not set'} to {viewingUnit.leaseEndDate || 'Not set'}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <h5 className="text-sm font-semibold text-slate-900">Tenant</h5>
                    <p className="mt-2 text-sm text-slate-900">{viewingUnit.tenantName || 'No tenant assigned'}</p>
                    {viewingUnit.tenantPhone && <p className="mt-1 text-sm text-slate-500">{viewingUnit.tenantPhone}</p>}
                    {viewingUnit.tenantEmail && <p className="text-sm text-slate-500">{viewingUnit.tenantEmail}</p>}
                  </div>

                  {canManageUnitTenant(viewingUnit) && (
                    <Button
                      variant="outline"
                      leftIcon={<UserRoundMinus className="h-4 w-4" />}
                      onClick={() => handleRemoveTenant(viewingUnit)}
                    >
                      Remove Tenant
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {viewingUnit.status === 'owner_occupied'
                    ? 'This unit is marked owner occupied, so there is no rental tenant attached.'
                    : 'This unit is currently vacant and ready for a new rental.'}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={!!unitPendingRemoval}
        onClose={() => setUnitPendingRemoval(null)}
        onConfirm={confirmRemoveTenant}
        title="Remove Tenant"
        description={
          unitPendingRemoval
            ? `This will remove ${unitPendingRemoval.tenantName} from Unit ${unitPendingRemoval.unitNumber}, clear rental details, and mark the unit as vacant.`
            : 'This will remove the current tenant and mark the unit as vacant.'
        }
        confirmLabel="Remove Tenant"
        variant="danger"
      />
    </DashboardLayout>
  );
}

export default function EstateUnitsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EstateUnitsContent />
    </Suspense>
  );
}

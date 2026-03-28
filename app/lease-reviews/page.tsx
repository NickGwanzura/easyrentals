'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Download,
  Eye,
  BarChart3,
  ClipboardCheck,
  X,
  Calendar,
  Home,
  User,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { LeaseReviewStatus, LeaseComplianceRating } from '@/types';
import { demoData, demoLeaseReviews } from '@/lib/mockData';
import { demoInspections } from '@/lib/mockData/inspections';
import AddLeaseReviewModal from './AddLeaseReviewModal';
import LeaseReviewReportModal from './LeaseReviewReportModal';

// ============================================================================
// Color maps
// ============================================================================

const statusColors: Record<LeaseReviewStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  overdue:   'bg-red-50 text-red-700 border-red-200',
  flagged:   'bg-purple-50 text-purple-700 border-purple-200',
};

const ratingColors: Record<LeaseComplianceRating, string> = {
  excellent: 'bg-green-50 text-green-700 border-green-200',
  good:      'bg-blue-50 text-blue-700 border-blue-200',
  fair:      'bg-yellow-50 text-yellow-700 border-yellow-200',
  poor:      'bg-orange-50 text-orange-700 border-orange-200',
  critical:  'bg-red-50 text-red-700 border-red-200',
};

const conditionDot: Record<string, string> = {
  excellent: 'bg-green-500',
  good:      'bg-blue-500',
  fair:      'bg-yellow-500',
  poor:      'bg-orange-500',
  critical:  'bg-red-500',
};

// ============================================================================
// Inspection helpers
// ============================================================================

function getPropertyInspections(propertyId: string, periodStart?: string, periodEnd?: string) {
  return demoInspections.filter(i => {
    if (i.propertyId !== propertyId) return false;
    if (i.status !== 'completed') return false;
    if (periodStart && i.completedDate && i.completedDate < periodStart) return false;
    if (periodEnd && i.completedDate && i.completedDate > periodEnd) return false;
    return true;
  }).sort((a, b) => (b.completedDate || b.scheduledDate).localeCompare(a.completedDate || a.scheduledDate));
}

function getLatestInspection(propertyId: string) {
  return demoInspections
    .filter(i => i.propertyId === propertyId && i.status === 'completed')
    .sort((a, b) => (b.completedDate || b.scheduledDate).localeCompare(a.completedDate || a.scheduledDate))[0];
}

// ============================================================================
// Main Page
// ============================================================================

export default function LeaseReviewsPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { canManageLeads } = usePermission();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaseReviewStatus | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<LeaseComplianceRating | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<typeof demoLeaseReviews[0] | null>(null);

  if (!user) return null;

  const filteredReviews = demoLeaseReviews.filter(review => {
    const tenant = demoData.tenants.find(t => t.id === review.tenantId);
    const property = demoData.properties.find(p => p.id === review.propertyId);

    const matchesSearch =
      tenant?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property?.title.toLowerCase().includes(searchQuery.toLowerCase()) || false;

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.complianceRating === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const stats = {
    total: demoLeaseReviews.length,
    pending: demoLeaseReviews.filter(r => r.status === 'pending').length,
    completed: demoLeaseReviews.filter(r => r.status === 'completed').length,
    flagged: demoLeaseReviews.filter(r => r.status === 'flagged').length,
    excellent: demoLeaseReviews.filter(r => r.complianceRating === 'excellent').length,
    recommendRenewal: demoLeaseReviews.filter(r => r.recommendRenewal).length,
    avgOnTimePayment: Math.round(
      demoLeaseReviews.reduce((sum, r) => sum + r.rentPaidOnTime, 0) / demoLeaseReviews.length
    ),
    // Inspection-aware stats
    inspectionsWithIssues: demoLeaseReviews.filter(r => {
      const insp = getLatestInspection(r.propertyId);
      return insp && (insp.overallCondition === 'poor' || insp.overallCondition === 'critical');
    }).length,
  };

  const getTenantName = (tenantId: string) => {
    const tenant = demoData.tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getPropertyName = (propertyId: string) => {
    const property = demoData.properties.find(p => p.id === propertyId);
    return property ? property.title : 'Unknown Property';
  };

  return (
    <DashboardLayout title="Lease Reviews">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lease Reviews</h1>
            <p className="text-slate-500 mt-1">Review tenant performance and inspection history</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              leftIcon={<BarChart3 className="w-4 h-4" />}
              onClick={() => setShowReportModal(true)}
            >
              View Report
            </Button>
            {canManageLeads && (
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddModal(true)}
              >
                New Review
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText}      label="Total Reviews"   value={stats.total}    color="bg-primary-100 text-primary-600" />
          <StatCard icon={Clock}         label="Pending"         value={stats.pending}  color="bg-amber-100 text-amber-600" />
          <StatCard icon={CheckCircle2}  label="Completed"       value={stats.completed} color="bg-success-100 text-success-600" />
          <StatCard icon={AlertCircle}   label="Flagged"         value={stats.flagged}  color="bg-danger-100 text-danger-600" />
        </div>

        {/* Performance / Inspection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Excellent Ratings</p>
                <p className="text-2xl font-bold text-green-700">{stats.excellent}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg On-Time Payment</p>
                <p className="text-2xl font-bold text-blue-700">{stats.avgOnTimePayment}%</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Recommend Renewal</p>
                <p className="text-2xl font-bold text-purple-700">{stats.recommendRenewal}</p>
              </div>
            </div>
          </Card>
          {/* NEW: Inspection Issues */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Inspection Issues</p>
                <p className="text-2xl font-bold text-orange-700">{stats.inspectionsWithIssues}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tenant or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeaseReviewStatus | 'all')}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="flagged">Flagged</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as LeaseComplianceRating | 'all')}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Reviews Table */}
        <Card>
          <CardHeader title="Lease Reviews" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Tenant / Property</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Period</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Payment</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Rating</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Last Inspection</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Renewal</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => {
                  const lastInspection = getLatestInspection(review.propertyId);
                  const periodInspections = getPropertyInspections(review.propertyId, review.reviewPeriodStart, review.reviewPeriodEnd);
                  return (
                    <tr
                      key={review.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedReview?.id === review.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedReview(selectedReview?.id === review.id ? null : review)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{getTenantName(review.tenantId)}</p>
                        <p className="text-sm text-slate-500">{getPropertyName(review.propertyId)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{formatDate(review.reviewPeriodStart)} to {formatDate(review.reviewPeriodEnd)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${review.rentPaidOnTime >= 90 ? 'bg-green-500' : review.rentPaidOnTime >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <span className="text-sm font-medium text-slate-900">{review.rentPaidOnTime}%</span>
                        </div>
                        {review.latePayments > 0 && (
                          <p className="text-xs text-slate-500 mt-1">{review.latePayments} late</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${ratingColors[review.complianceRating as LeaseComplianceRating]}`}>
                          {review.complianceRating.charAt(0).toUpperCase() + review.complianceRating.slice(1)}
                        </span>
                      </td>
                      {/* NEW: Last Inspection column */}
                      <td className="px-6 py-4 text-center">
                        {lastInspection ? (
                          <div>
                            <div className="inline-flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${conditionDot[lastInspection.overallCondition || 'good']}`} />
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ratingColors[(lastInspection.overallCondition || 'good') as LeaseComplianceRating]}`}>
                                {lastInspection.overallCondition ? lastInspection.overallCondition.charAt(0).toUpperCase() + lastInspection.overallCondition.slice(1) : 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDate(lastInspection.completedDate || lastInspection.scheduledDate)}
                              {periodInspections.length > 0 && (
                                <span className="ml-1 text-blue-500">({periodInspections.length} in period)</span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None on record</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[review.status as LeaseReviewStatus]}`}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {review.status === 'completed' ? (
                          <span className={`inline-flex items-center gap-1 text-sm ${review.recommendRenewal ? 'text-green-600' : 'text-red-600'}`}>
                            {review.recommendRenewal ? (
                              <><CheckCircle2 className="w-4 h-4" /> Yes</>
                            ) : (
                              <><AlertCircle className="w-4 h-4" /> No</>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className={`p-2 rounded-lg transition-colors ${selectedReview?.id === review.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedReview(selectedReview?.id === review.id ? null : review); }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Download Report"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Review Detail Panel */}
        {selectedReview && (
          <ReviewDetailPanel
            review={selectedReview}
            tenantName={getTenantName(selectedReview.tenantId)}
            propertyName={getPropertyName(selectedReview.propertyId)}
            onClose={() => setSelectedReview(null)}
          />
        )}
      </div>

      <AddLeaseReviewModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <LeaseReviewReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        stats={stats}
        reviews={filteredReviews}
      />
    </DashboardLayout>
  );
}

// ============================================================================
// Review Detail Panel (with inspection history)
// ============================================================================

function ReviewDetailPanel({ review, tenantName, propertyName, onClose }: {
  review: typeof demoLeaseReviews[0];
  tenantName: string;
  propertyName: string;
  onClose: () => void;
}) {
  const allInspections = getPropertyInspections(review.propertyId);
  const periodInspections = getPropertyInspections(review.propertyId, review.reviewPeriodStart, review.reviewPeriodEnd);
  const hasIssues = allInspections.some(i => i.overallCondition === 'poor' || i.overallCondition === 'critical');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-900">{tenantName}: Review Detail</h3>
          <p className="text-sm text-slate-500">{propertyName} · {formatDate(review.reviewPeriodStart)} to {formatDate(review.reviewPeriodEnd)}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Review Scores */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Review Scores</h4>

          <ScoreRow label="Compliance Rating" value={review.complianceRating} />
          <ScoreRow label="Property Condition" value={review.propertyCondition} note={review.conditionNotes} />
          <ScoreRow label="Tenant Behaviour" value={review.tenantBehavior} note={review.behaviorNotes} />

          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">On-time payments</span>
              <span className="font-medium text-slate-900">{review.rentPaidOnTime}% ({review.latePayments} late, {review.missedPayments} missed)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Maintenance requests</span>
              <span className="font-medium text-slate-900">{review.maintenanceRequests}</span>
            </div>
            {review.rentAdjustment !== undefined && review.rentAdjustment !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Proposed rent adjustment</span>
                <span className="font-medium text-slate-900">+{review.rentAdjustment}%</span>
              </div>
            )}
          </div>

          {review.leaseViolations && review.leaseViolations.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Lease Violations</p>
              <ul className="space-y-1">
                {review.leaseViolations.map((v, i) => (
                  <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.recommendRenewal !== undefined && review.status === 'completed' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${review.recommendRenewal ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {review.recommendRenewal ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {review.recommendRenewal ? 'Recommended for renewal' : 'Not recommended for renewal'}
              {review.renewalNotes && <span className="text-xs font-normal ml-1">: {review.renewalNotes}</span>}
            </div>
          )}
        </div>

        {/* Right: Inspection History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inspection History</h4>
            {hasIssues && (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                <AlertTriangle className="w-3 h-3" /> Issues found
              </span>
            )}
          </div>

          {allInspections.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No completed inspections on record for this property</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allInspections.slice(0, 5).map((insp) => {
                const inPeriod = periodInspections.some(p => p.id === insp.id);
                return (
                  <div
                    key={insp.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${inPeriod ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${conditionDot[insp.overallCondition || 'good']}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 capitalize">{insp.inspectionType.replace('_', ' ')} inspection</p>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${ratingColors[(insp.overallCondition || 'good') as LeaseComplianceRating]}`}>
                          {insp.overallCondition ? insp.overallCondition.charAt(0).toUpperCase() + insp.overallCondition.slice(1) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(insp.completedDate || insp.scheduledDate)}
                        {insp.inspectorName && ` · ${insp.inspectorName}`}
                      </p>
                      {insp.generalNotes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{insp.generalNotes}</p>
                      )}
                      {inPeriod && (
                        <span className="mt-1 inline-block text-xs text-blue-600 font-medium">Within review period</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {allInspections.length > 5 && (
                <p className="text-xs text-slate-400 text-center">+{allInspections.length - 5} more inspections</p>
              )}
            </div>
          )}

          {/* Mismatch warning */}
          {allInspections.length > 0 && (() => {
            const lastInsp = allInspections[0];
            const condition = lastInsp.overallCondition;
            const reviewCondition = review.propertyCondition;
            if (condition && condition !== reviewCondition) {
              return (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Review records property condition as <strong>{reviewCondition}</strong>, but last inspection rated it <strong>{condition}</strong>. Consider updating.
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${(ratingColors as any)[value] || ''}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      </div>
      {note && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{note}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

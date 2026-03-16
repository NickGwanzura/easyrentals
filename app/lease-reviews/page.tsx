'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';
import { LeaseReviewStatus, LeaseComplianceRating } from '@/types';
import { demoData, demoLeaseReviews } from '@/lib/mockData';
import AddLeaseReviewModal from './AddLeaseReviewModal';
import LeaseReviewReportModal from './LeaseReviewReportModal';

const statusColors: Record<LeaseReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  flagged: 'bg-purple-50 text-purple-700 border-purple-200',
};

const ratingColors: Record<LeaseComplianceRating, string> = {
  excellent: 'bg-green-50 text-green-700 border-green-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  fair: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  poor: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

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
            <p className="text-slate-500 mt-1">Review tenant performance and generate reports</p>
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
          <StatCard 
            icon={FileText}
            label="Total Reviews"
            value={stats.total}
            color="bg-primary-100 text-primary-600"
          />
          <StatCard 
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="bg-amber-100 text-amber-600"
          />
          <StatCard 
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed}
            color="bg-success-100 text-success-600"
          />
          <StatCard 
            icon={AlertCircle}
            label="Flagged"
            value={stats.flagged}
            color="bg-danger-100 text-danger-600"
          />
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Renewal</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{getTenantName(review.tenantId)}</p>
                        <p className="text-sm text-slate-500">{getPropertyName(review.propertyId)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{formatDate(review.reviewPeriodStart)} - {formatDate(review.reviewPeriodEnd)}</p>
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
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          onClick={() => setSelectedReview(review)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

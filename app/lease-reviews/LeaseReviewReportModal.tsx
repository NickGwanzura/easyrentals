'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/lib/utils';
import { 
  Download, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Star,
  FileText,
  BarChart3,
  PieChart,
  DollarSign
} from 'lucide-react';
import { demoData } from '@/lib/mockData';
import { generateLeaseReviewReportPDF, downloadPDF } from '@/lib/pdfExport';
import { useToast } from '@/components/ui/Toast';

interface LeaseReviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    pending: number;
    completed: number;
    flagged: number;
    excellent: number;
    recommendRenewal: number;
    avgOnTimePayment: number;
  };
  reviews: any[];
}

export default function LeaseReviewReportModal({ isOpen, onClose, stats, reviews }: LeaseReviewReportModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'recommendations'>('overview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { showToast } = useToast();

  // Calculate additional stats
  const totalViolations = reviews.reduce((sum, r) => sum + (r.leaseViolations?.length || 0), 0);
  const avgMaintenanceRequests = Math.round(
    reviews.reduce((sum, r) => sum + (r.maintenanceRequests || 0), 0) / (reviews.length || 1)
  );
  
  const ratingDistribution = {
    excellent: reviews.filter(r => r.complianceRating === 'excellent').length,
    good: reviews.filter(r => r.complianceRating === 'good').length,
    fair: reviews.filter(r => r.complianceRating === 'fair').length,
    poor: reviews.filter(r => r.complianceRating === 'poor').length,
    critical: reviews.filter(r => r.complianceRating === 'critical').length,
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = generateLeaseReviewReportPDF(reviews, stats, demoData);
      downloadPDF(pdf, 'lease-reviews-report');
      showToast('PDF report downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast('Failed to generate PDF report', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Tenant', 'Property', 'Period', 'Payment %', 'Rating', 'Status', 'Renewal'];
    const rows = reviews.map(review => {
      const tenant = demoData.tenants.find(t => t.id === review.tenantId);
      const property = demoData.properties.find(p => p.id === review.propertyId);
      return [
        tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown',
        property?.title || 'Unknown',
        `${formatDate(review.reviewPeriodStart)} - ${formatDate(review.reviewPeriodEnd)}`,
        `${review.rentPaidOnTime}%`,
        review.complianceRating,
        review.status,
        review.recommendRenewal ? 'Yes' : 'No',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lease-reviews-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Reviews</p>
              <p className="text-xl font-bold text-blue-700">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-xl font-bold text-green-700">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Payment On-Time</p>
              <p className="text-xl font-bold text-amber-700">{stats.avgOnTimePayment}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Recommend Renewal</p>
              <p className="text-xl font-bold text-purple-700">{stats.recommendRenewal}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader title="Review Status Breakdown" />
        <div className="space-y-3">
          {[
            { label: 'Completed', value: stats.completed, total: stats.total, color: 'bg-green-500' },
            { label: 'Pending', value: stats.pending, total: stats.total, color: 'bg-amber-500' },
            { label: 'Flagged', value: stats.flagged, total: stats.total, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium text-slate-900">{item.value} ({Math.round((item.value / item.total) * 100)}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(item.value / item.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Rating Distribution */}
      <Card>
        <CardHeader title="Compliance Rating Distribution" />
        <div className="space-y-3">
          {[
            { label: 'Excellent', value: ratingDistribution.excellent, color: 'bg-green-500', textColor: 'text-green-600' },
            { label: 'Good', value: ratingDistribution.good, color: 'bg-blue-500', textColor: 'text-blue-600' },
            { label: 'Fair', value: ratingDistribution.fair, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
            { label: 'Poor', value: ratingDistribution.poor, color: 'bg-orange-500', textColor: 'text-orange-600' },
            { label: 'Critical', value: ratingDistribution.critical, color: 'bg-red-500', textColor: 'text-red-600' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-20 text-sm text-slate-600">{item.label}</div>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                  style={{ width: `${(item.value / (stats.total || 1)) * 100}%` }}
                >
                  {item.value > 0 && <span className="text-xs text-white font-medium">{item.value}</span>}
                </div>
              </div>
              <div className={`w-10 text-sm font-medium ${item.textColor} text-right`}>
                {Math.round((item.value / (stats.total || 1)) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Performance */}
      <Card>
        <CardHeader title="Payment Performance Analysis" />
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-slate-900">{stats.avgOnTimePayment}%</p>
            <p className="text-sm text-slate-600">Average On-Time Payment</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold text-slate-900">{totalViolations}</p>
            <p className="text-sm text-slate-600">Total Lease Violations</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-slate-900">{avgMaintenanceRequests}</p>
            <p className="text-sm text-slate-600">Avg Maintenance Requests</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-slate-900">{stats.excellent}</p>
            <p className="text-sm text-slate-600">Excellent Ratings</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderRecommendations = () => {
    const renewalRate = stats.total > 0 ? Math.round((stats.recommendRenewal / stats.total) * 100) : 0;
    const nonRenewalRate = 100 - renewalRate;

    return (
      <div className="space-y-6">
        {/* Renewal Recommendation Summary */}
        <Card>
          <CardHeader title="Renewal Recommendations" />
          <div className="flex items-center justify-center py-6">
            <div className="relative w-40 h-40">
              {/* Pie chart representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="20"
                  strokeDasharray={`${renewalRate * 2.51} 251`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{renewalRate}%</span>
                <span className="text-sm text-slate-500">Renew</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{stats.recommendRenewal}</p>
              <p className="text-sm text-green-600">Recommend Renewal</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{stats.total - stats.recommendRenewal}</p>
              <p className="text-sm text-red-600">Do Not Recommend</p>
            </div>
          </div>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader title="Top Performing Tenants" />
          <div className="space-y-3">
            {reviews
              .filter(r => r.complianceRating === 'excellent' && r.rentPaidOnTime >= 95)
              .slice(0, 3)
              .map((review, index) => {
                const tenant = demoData.tenants.find(t => t.id === review.tenantId);
                const property = demoData.properties.find(p => p.id === review.propertyId);
                return (
                  <div key={review.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-500">{property?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{review.rentPaidOnTime}%</p>
                      <p className="text-xs text-slate-500">On-time</p>
                    </div>
                  </div>
                );
              })}
            {reviews.filter(r => r.complianceRating === 'excellent' && r.rentPaidOnTime >= 95).length === 0 && (
              <p className="text-center text-slate-500 py-4">No top performers yet</p>
            )}
          </div>
        </Card>

        {/* Flagged Tenants */}
        <Card>
          <CardHeader title="Tenants Requiring Attention" />
          <div className="space-y-3">
            {reviews
              .filter(r => r.status === 'flagged' || r.complianceRating === 'poor' || r.complianceRating === 'critical')
              .slice(0, 3)
              .map((review) => {
                const tenant = demoData.tenants.find(t => t.id === review.tenantId);
                const property = demoData.properties.find(p => p.id === review.propertyId);
                return (
                  <div key={review.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-500">{property?.title}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        review.complianceRating === 'critical' ? 'bg-red-100 text-red-700' :
                        review.complianceRating === 'poor' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {review.complianceRating.charAt(0).toUpperCase() + review.complianceRating.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            {reviews.filter(r => r.status === 'flagged' || r.complianceRating === 'poor' || r.complianceRating === 'critical').length === 0 && (
              <p className="text-center text-slate-500 py-4">No flagged tenants</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: CheckCircle2 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lease Review Report"
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportPDF} 
            isLoading={isGeneratingPDF}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </Modal>
  );
}

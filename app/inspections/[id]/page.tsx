'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/lib/auth/context';
import { useToast } from '@/components/ui/Toast';
import { 
  Inspection, 
  InspectionType, 
  InspectionStatus,
  ConditionRating,
  ChecklistItemStatus,
  InspectionCategory,
  InspectionIssue
} from '@/types/inspections';
import { 
  demoInspections, 
  getInspectionById,
  getIssuesByInspection,
  demoInspectionCategories,
  demoChecklistItems
} from '@/lib/mockData/inspections';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft,
  Calendar,
  Home,
  User,
  ClipboardCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Download,
  Share2,
  Camera,
  Plus,
  ChevronDown,
  ChevronUp,
  Wrench,
  FileText
} from 'lucide-react';

const inspectionTypeLabels: Record<InspectionType, string> = {
  routine: 'Routine',
  move_in: 'Move In',
  move_out: 'Move Out',
  final: 'Final',
  safety: 'Safety',
  emergency: 'Emergency'
};

const statusColors: Record<InspectionStatus, string> = {
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-slate-50 text-slate-600 border-slate-200',
  no_show: 'bg-red-50 text-red-700 border-red-200'
};

const conditionColors: Record<ConditionRating, string> = {
  excellent: 'bg-green-50 text-green-700 border-green-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  fair: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  poor: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};

const checklistStatusColors: Record<ChecklistItemStatus, string> = {
  good: 'bg-green-100 text-green-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-red-100 text-red-700',
  not_applicable: 'bg-slate-100 text-slate-500',
  not_inspected: 'bg-slate-100 text-slate-400'
};

export default function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { showToast } = useToast();
  const resolvedParams = use(params);
  
  const [inspection, setInspection] = useState<Inspection | undefined>(getInspectionById(resolvedParams.id));
  const [issues, setIssues] = useState<InspectionIssue[]>(getIssuesByInspection(resolvedParams.id));
  const [categories, setCategories] = useState<InspectionCategory[]>(demoInspectionCategories);
  const [checklistItems, setChecklistItems] = useState(demoChecklistItems);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['cat-1']);
  const [isEditing, setIsEditing] = useState(false);
  const [responses, setResponses] = useState<Record<string, ChecklistItemStatus>>({});

  if (!user) return null;
  if (!inspection) {
    return (
      <DashboardLayout title="Inspection Not Found">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900">Inspection Not Found</h2>
          <p className="text-slate-500 mt-2">The requested inspection could not be found.</p>
          <Link href="/inspections">
            <Button className="mt-4">Back to Inspections</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleResponseChange = (itemId: string, status: ChecklistItemStatus) => {
    setResponses(prev => ({ ...prev, [itemId]: status }));
  };

  const getItemsByCategory = (categoryId: string) => {
    return checklistItems.filter(item => item.categoryId === categoryId);
  };

  const getCategoryProgress = (categoryId: string) => {
    const items = getItemsByCategory(categoryId);
    const completed = items.filter(item => responses[item.id]).length;
    return { completed, total: items.length };
  };

  const getOverallProgress = () => {
    const total = checklistItems.length;
    const completed = Object.keys(responses).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const pendingIssues = issues.filter(i => i.status === 'pending').length;
  const progress = getOverallProgress();

  return (
    <DashboardLayout title="Inspection Details">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/inspections">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {inspectionTypeLabels[inspection.inspectionType]} Inspection
                </h1>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[inspection.status]}`}>
                  {inspection.status.replace('_', ' ')}
                </span>
                {inspection.overallCondition && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${conditionColors[inspection.overallCondition]}`}>
                    {inspection.overallCondition}
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-1">
                {inspection.estateUnit 
                  ? `${inspection.estateUnit.unitNumber} - ${inspection.estateUnit.estateName}`
                  : inspection.property?.title || 'No property'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Report
            </Button>
            <Button variant="outline" leftIcon={<Share2 className="w-4 h-4" />}>
              Share
            </Button>
            {inspection.status === 'scheduled' && (
              <Button leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Complete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            {inspection.status === 'in_progress' && (
              <Card>
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Inspection Progress</h3>
                    <span className="text-sm text-slate-500">{progress.percentage}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {progress.completed} of {progress.total} items checked
                  </p>
                </div>
              </Card>
            )}

            {/* Checklist */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Inspection Checklist</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {categories.map((category) => {
                  const items = getItemsByCategory(category.id);
                  const categoryProgress = getCategoryProgress(category.id);
                  const isExpanded = expandedCategories.includes(category.id);
                  
                  return (
                    <div key={category.id}>
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                          <span className="font-medium text-slate-900">{category.name}</span>
                          <span className="text-sm text-slate-500">
                            ({categoryProgress.completed}/{categoryProgress.total})
                          </span>
                        </div>
                        {categoryProgress.completed === categoryProgress.total && categoryProgress.total > 0 && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2">
                          {items.map((item) => (
                            <div 
                              key={item.id}
                              className={`p-3 rounded-lg border ${
                                responses[item.id] === 'good' ? 'border-green-200 bg-green-50' :
                                responses[item.id] === 'poor' ? 'border-red-200 bg-red-50' :
                                responses[item.id] === 'fair' ? 'border-yellow-200 bg-yellow-50' :
                                'border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900">{item.name}</span>
                                    {item.isCritical && (
                                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                                        Critical
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                  )}
                                </div>
                                <select
                                  value={responses[item.id] || ''}
                                  onChange={(e) => handleResponseChange(item.id, e.target.value as ChecklistItemStatus)}
                                  className="px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="">Select status</option>
                                  <option value="good">Good</option>
                                  <option value="fair">Fair</option>
                                  <option value="poor">Poor</option>
                                  <option value="not_applicable">N/A</option>
                                  <option value="not_inspected">Not Inspected</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Photos Section */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Photos</h3>
                  <Button variant="outline" size="sm" leftIcon={<Camera className="w-4 h-4" />}>
                    Add Photo
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-slate-500 text-sm">No photos uploaded yet</p>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {/* Photo placeholder would go here */}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details Card */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Inspection Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Scheduled</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(inspection.scheduledDate)}
                      {inspection.scheduledTime && ` at ${inspection.scheduledTime}`}
                    </p>
                  </div>
                </div>
                
                {inspection.completedDate && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-slate-500">Completed</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(inspection.completedDate)}
                      </p>
                    </div>
                  </div>
                )}

                {inspection.inspectorName && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Inspector</p>
                      <p className="font-medium text-slate-900">{inspection.inspectorName}</p>
                    </div>
                  </div>
                )}

                {inspection.tenant && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Tenant</p>
                      <p className="font-medium text-slate-900">
                        {inspection.tenant.firstName} {inspection.tenant.lastName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Issues Card */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Issues Found</h3>
                  <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {issues.length === 0 ? (
                  <p className="text-slate-500 text-sm">No issues reported</p>
                ) : (
                  issues.map((issue) => (
                    <div 
                      key={issue.id}
                      className={`p-3 rounded-lg border ${
                        issue.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                        issue.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                        'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{issue.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{issue.category}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          issue.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          issue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {issue.priority}
                        </span>
                      </div>
                      {issue.estimatedCost && (
                        <p className="text-sm text-slate-500 mt-2">
                          Est. cost: ${issue.estimatedCost}
                        </p>
                      )}
                    </div>
                  ))
                )}
                
                {pendingIssues > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Pending Issues</span>
                      <span className="font-medium text-amber-600">{pendingIssues}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Notes Card */}
            {inspection.generalNotes && (
              <Card>
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Notes</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600">{inspection.generalNotes}</p>
                </div>
              </Card>
            )}

            {/* Notifications */}
            <Card>
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Landlord Notified</span>
                  {inspection.landlordNotified ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tenant Notified</span>
                  {inspection.tenantNotified ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

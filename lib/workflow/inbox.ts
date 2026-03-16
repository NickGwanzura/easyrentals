import { demoData, demoLeaseReviews } from '@/lib/mockData';
import { demoEstateLevies, demoEstateUnits } from '@/lib/mockData/estate-management';
import type { User } from '@/types';

export interface WorkflowNotification {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: 'info' | 'warning' | 'danger' | 'success';
  unread?: boolean;
}

export interface WorkflowTask {
  id: string;
  title: string;
  ownerLabel: string;
  dueLabel: string;
  href: string;
  priority: 'normal' | 'high' | 'critical';
}

export interface WorkflowEvent {
  id: string;
  type: 'tenant_removed' | 'owner_delegated';
  entityId: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  actorUserId?: string;
  ownerUserId?: string;
}

export interface WorkflowInbox {
  notifications: WorkflowNotification[];
  tasks: WorkflowTask[];
  unreadCount: number;
}

export interface WorkflowUserState {
  dismissedNotificationIds: string[];
  completedTaskIds: string[];
}

export interface WorkflowInboxState extends WorkflowUserState {
  events: WorkflowEvent[];
}

function getPropertyIdsForUser(user: User) {
  switch (user.role) {
    case 'admin':
      return demoData.properties.map((property) => property.id);
    case 'landlord':
      return demoData.properties
        .filter((property) => property.landlordId === user.id)
        .map((property) => property.id);
    case 'agent': {
      const agent = demoData.agents.find((record) => record.userId === user.id);
      return agent?.assignedPropertyIds || [];
    }
    case 'tenant': {
      const tenant = demoData.tenants.find((record) => record.userId === user.id);
      return tenant?.currentPropertyId ? [tenant.currentPropertyId] : [];
    }
    default:
      return [];
  }
}

function buildEventNotifications(user: User, events: WorkflowEvent[]): WorkflowNotification[] {
  if (user.role === 'tenant') {
    return [];
  }

  return events.flatMap<WorkflowNotification>((event) => {
    if (event.type === 'tenant_removed') {
      if (user.role === 'admin' || event.ownerUserId === user.id) {
        return [{
          id: `workflow-notification-${event.id}`,
          title: event.title,
          description: event.description,
          href: event.href,
          tone: 'warning' as const,
          unread: true,
        }];
      }
    }

    if (event.type === 'owner_delegated') {
      if (user.role === 'admin' || event.ownerUserId === user.id) {
        return [{
          id: `workflow-notification-${event.id}`,
          title: event.title,
          description: event.description,
          href: event.href,
          tone: 'info' as const,
          unread: true,
        }];
      }
    }

    return [] as WorkflowNotification[];
  });
}

function buildEventTasks(user: User, events: WorkflowEvent[]): WorkflowTask[] {
  if (user.role === 'tenant') {
    return [];
  }

  return events.flatMap<WorkflowTask>((event) => {
    if (event.type === 'tenant_removed') {
      if (user.role === 'admin' || event.ownerUserId === user.id) {
        return [{
          id: `workflow-task-${event.id}`,
          title: `Start turnover workflow for ${event.title.replace('Tenant removed from ', '')}`,
          ownerLabel: user.role === 'admin' ? 'Admin operations' : 'Property owner',
          dueLabel: 'Today',
          href: '/estate-moves/move-out',
          priority: 'high' as const,
        }];
      }
    }

    if (event.type === 'owner_delegated') {
      if (event.ownerUserId === user.id) {
        return [{
          id: `workflow-task-${event.id}`,
          title: 'Review newly delegated estate unit',
          ownerLabel: 'Property owner',
          dueLabel: 'Today',
          href: event.href,
          priority: 'normal' as const,
        }];
      }

      if (user.role === 'admin') {
        return [{
          id: `workflow-task-${event.id}`,
          title: 'Confirm owner delegation handoff',
          ownerLabel: 'Admin operations',
          dueLabel: 'This week',
          href: event.href,
          priority: 'normal' as const,
        }];
      }
    }

    return [] as WorkflowTask[];
  });
}

function filterDismissed<T extends { id: string }>(items: T[], hiddenIds: string[]) {
  return items.filter((item) => !hiddenIds.includes(item.id));
}

export function getWorkflowInbox(user: User | null, state?: Partial<WorkflowInboxState>): WorkflowInbox {
  if (!user) {
    return { notifications: [], tasks: [], unreadCount: 0 };
  }

  const dismissedNotificationIds = state?.dismissedNotificationIds || [];
  const completedTaskIds = state?.completedTaskIds || [];
  const events = state?.events || [];
  const propertyIds = getPropertyIdsForUser(user);
  const overduePayments = demoData.payments.filter(
    (payment) => propertyIds.includes(payment.propertyId) && payment.status === 'overdue'
  );
  const pendingPayments = demoData.payments.filter(
    (payment) => propertyIds.includes(payment.propertyId) && payment.status === 'pending'
  );

  let notifications: WorkflowNotification[] = [];
  let tasks: WorkflowTask[] = [];

  if (user.role === 'admin') {
    const flaggedReviews = demoLeaseReviews.filter(
      (review) => review.status === 'flagged' || review.status === 'overdue'
    );
    const levyArrears = demoEstateLevies.filter((levy) => levy.balance > 0);

    notifications = [
      ...overduePayments.slice(0, 2).map((payment) => ({
        id: `admin-payment-${payment.id}`,
        title: 'Overdue payment',
        description: `A rent balance of $${payment.amount} needs follow-up.`,
        href: '/payments',
        tone: 'danger' as const,
        unread: true,
      })),
      ...flaggedReviews.slice(0, 1).map((review) => ({
        id: `admin-review-${review.id}`,
        title: 'Lease review flagged',
        description: 'A flagged review is waiting for action.',
        href: '/lease-reviews',
        tone: 'warning' as const,
        unread: true,
      })),
      ...levyArrears.slice(0, 1).map((levy) => ({
        id: `admin-levy-${levy.id}`,
        title: 'Levy arrears detected',
        description: `${levy.estateName} / Unit ${levy.unitNumber} has an unpaid balance.`,
        href: '/levies',
        tone: 'warning' as const,
        unread: false,
      })),
    ];

    tasks = [
      {
        id: 'admin-task-collections',
        title: 'Review overdue payments',
        ownerLabel: 'Admin operations',
        dueLabel: 'Today',
        href: '/payments',
        priority: overduePayments.length > 0 ? 'critical' : 'normal',
      },
      {
        id: 'admin-task-reviews',
        title: 'Resolve flagged lease reviews',
        ownerLabel: 'Portfolio review',
        dueLabel: 'This week',
        href: '/lease-reviews',
        priority: flaggedReviews.length > 0 ? 'high' : 'normal',
      },
      {
        id: 'admin-task-estates',
        title: 'Check estate levy arrears',
        ownerLabel: 'Estate finance',
        dueLabel: 'This week',
        href: '/levies',
        priority: levyArrears.length > 0 ? 'high' : 'normal',
      },
    ];
  } else if (user.role === 'landlord') {
    const delegatedUnits = demoEstateUnits.filter((unit) => unit.ownerUserId === user.id);
    const delegatedLevies = demoEstateLevies.filter(
      (levy) => delegatedUnits.some((unit) => unit.id === levy.unitId) && levy.balance > 0
    );

    notifications = [
      ...overduePayments.slice(0, 2).map((payment) => ({
        id: `landlord-payment-${payment.id}`,
        title: 'Tenant payment overdue',
        description: 'Collections follow-up is needed on one of your units.',
        href: '/payments',
        tone: 'danger' as const,
        unread: true,
      })),
      ...delegatedUnits
        .filter((unit) => unit.status === 'vacant')
        .slice(0, 1)
        .map((unit) => ({
          id: `landlord-unit-${unit.id}`,
          title: 'Delegated estate unit is vacant',
          description: `${unit.estateName} / Unit ${unit.unitNumber} is ready for the next step.`,
          href: '/estates/estate-units',
          tone: 'info' as const,
          unread: true,
        })),
      ...delegatedLevies.slice(0, 1).map((levy) => ({
        id: `landlord-levy-${levy.id}`,
        title: 'Delegated levy balance',
        description: `Unit ${levy.unitNumber} has a balance requiring attention.`,
        href: '/levies',
        tone: 'warning' as const,
        unread: false,
      })),
    ];

    tasks = [
      {
        id: 'landlord-task-payments',
        title: 'Review overdue rent',
        ownerLabel: 'Landlord',
        dueLabel: 'Today',
        href: '/payments',
        priority: overduePayments.length > 0 ? 'critical' : 'normal',
      },
      {
        id: 'landlord-task-units',
        title: 'Fill delegated vacant units',
        ownerLabel: 'Estate owner',
        dueLabel: 'This week',
        href: '/estates/estate-units',
        priority: delegatedUnits.some((unit) => unit.status === 'vacant') ? 'high' : 'normal',
      },
    ];
  } else if (user.role === 'agent') {
    const agent = demoData.agents.find((record) => record.userId === user.id);
    const activeLeads = demoData.leads.filter(
      (lead) => lead.agentId === user.id && ['new', 'contacted', 'application_submitted'].includes(lead.status)
    );

    notifications = [
      ...activeLeads.slice(0, 2).map((lead) => ({
        id: `agent-lead-${lead.id}`,
        title: 'Lead follow-up needed',
        description: `${lead.firstName} ${lead.lastName} is still active in your funnel.`,
        href: '/leads',
        tone: 'info' as const,
        unread: true,
      })),
      ...(agent?.assignedPropertyIds || [])
        .map((propertyId) => demoData.properties.find((property) => property.id === propertyId))
        .filter((property): property is NonNullable<typeof property> => !!property)
        .filter((property) => property.status === 'vacant')
        .slice(0, 1)
        .map((property) => ({
          id: `agent-property-${property.id}`,
          title: 'Vacant assigned property',
          description: `${property.title} needs fresh lead coverage.`,
          href: '/properties',
          tone: 'warning' as const,
          unread: false,
        })),
    ];

    tasks = [
      {
        id: 'agent-task-leads',
        title: 'Follow up on active leads',
        ownerLabel: 'Agent',
        dueLabel: 'Today',
        href: '/leads',
        priority: activeLeads.length > 0 ? 'high' : 'normal',
      },
      {
        id: 'agent-task-viewings',
        title: 'Review vacant assigned stock',
        ownerLabel: 'Agent',
        dueLabel: 'This week',
        href: '/properties',
        priority: 'normal',
      },
    ];
  } else {
    const tenantRecord = demoData.tenants.find((record) => record.userId === user.id);
    const tenantPayments = tenantRecord
      ? demoData.payments.filter((payment) => payment.tenantId === tenantRecord.id)
      : [];
    const tenantLease = tenantRecord
      ? demoData.leases.find((lease) => lease.tenantId === tenantRecord.id && lease.status === 'active')
      : null;

    notifications = [
      ...tenantPayments
        .filter((payment) => payment.status === 'overdue')
        .slice(0, 1)
        .map((payment) => ({
          id: `tenant-payment-${payment.id}`,
          title: 'Payment overdue',
          description: `Your balance of $${payment.amount} needs attention.`,
          href: '/payments',
          tone: 'danger' as const,
          unread: true,
        })),
      ...tenantPayments
        .filter((payment) => payment.status === 'pending')
        .slice(0, 1)
        .map((payment) => ({
          id: `tenant-upcoming-${payment.id}`,
          title: 'Upcoming rent due',
          description: 'Your next rent payment is coming up soon.',
          href: '/payments',
          tone: 'info' as const,
          unread: false,
        })),
      ...(tenantLease
        ? [{
            id: 'tenant-lease',
            title: 'Lease timeline',
            description: `Your current lease ends on ${tenantLease.endDate}.`,
            href: '/settings',
            tone: 'warning' as const,
            unread: false,
          }]
        : []),
    ];

    tasks = [
      {
        id: 'tenant-task-payment',
        title: 'Check your next payment',
        ownerLabel: 'Tenant',
        dueLabel: 'This month',
        href: '/payments',
        priority: pendingPayments.length > 0 ? 'high' : 'normal',
      },
      {
        id: 'tenant-task-profile',
        title: 'Review account and support settings',
        ownerLabel: 'Tenant',
        dueLabel: 'Anytime',
        href: '/settings',
        priority: 'normal',
      },
    ];
  }

  const eventNotifications = buildEventNotifications(user, events);
  const eventTasks = buildEventTasks(user, events);
  const visibleNotifications = filterDismissed(
    [...eventNotifications, ...notifications],
    dismissedNotificationIds
  );
  const visibleTasks = filterDismissed(
    [...eventTasks, ...tasks],
    completedTaskIds
  );

  return {
    notifications: visibleNotifications,
    tasks: visibleTasks,
    unreadCount: visibleNotifications.filter((item) => item.unread).length,
  };
}

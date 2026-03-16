'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  getWorkflowInbox,
  WorkflowEvent,
  WorkflowInbox,
  WorkflowInboxState,
  WorkflowUserState,
} from './inbox';

interface WorkflowStore {
  events: WorkflowEvent[];
  userState: Record<string, WorkflowUserState>;
}

interface WorkflowContextType {
  inbox: WorkflowInbox;
  addEvent: (event: Omit<WorkflowEvent, 'id' | 'createdAt'>) => void;
  dismissNotification: (notificationId: string) => void;
  completeTask: (taskId: string) => void;
}

const STORAGE_KEY = 'eazyrentals_workflow_store_v1';
const defaultUserState: WorkflowUserState = {
  dismissedNotificationIds: [],
  completedTaskIds: [],
};

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

function normalizeStore(value: unknown): WorkflowStore {
  if (!value || typeof value !== 'object') {
    return { events: [], userState: {} };
  }

  const candidate = value as Partial<WorkflowStore>;
  return {
    events: Array.isArray(candidate.events) ? candidate.events : [],
    userState: candidate.userState && typeof candidate.userState === 'object' ? candidate.userState : {},
  };
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<WorkflowStore>({ events: [], userState: {} });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setStore(normalizeStore(JSON.parse(raw)));
      }
    } catch (error) {
      console.error('Failed to load workflow store:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.error('Failed to save workflow store:', error);
    }
  }, [store]);

  const currentUserState = user ? store.userState[user.id] || defaultUserState : defaultUserState;

  const inbox = useMemo(() => {
    const state: WorkflowInboxState = {
      events: store.events,
      dismissedNotificationIds: currentUserState.dismissedNotificationIds,
      completedTaskIds: currentUserState.completedTaskIds,
    };

    return getWorkflowInbox(user, state);
  }, [currentUserState.completedTaskIds, currentUserState.dismissedNotificationIds, store.events, user]);

  const addEvent = (event: Omit<WorkflowEvent, 'id' | 'createdAt'>) => {
    setStore((current) => ({
      ...current,
      events: [
        {
          ...event,
          id: `workflow-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        },
        ...current.events,
      ].slice(0, 50),
    }));
  };

  const dismissNotification = (notificationId: string) => {
    if (!user) {
      return;
    }

    setStore((current) => ({
      ...current,
      userState: {
        ...current.userState,
        [user.id]: {
          ...(current.userState[user.id] || defaultUserState),
          dismissedNotificationIds: [
            ...(current.userState[user.id]?.dismissedNotificationIds || []),
            notificationId,
          ],
        },
      },
    }));
  };

  const completeTask = (taskId: string) => {
    if (!user) {
      return;
    }

    setStore((current) => ({
      ...current,
      userState: {
        ...current.userState,
        [user.id]: {
          ...(current.userState[user.id] || defaultUserState),
          completedTaskIds: [
            ...(current.userState[user.id]?.completedTaskIds || []),
            taskId,
          ],
        },
      },
    }));
  };

  return (
    <WorkflowContext.Provider
      value={{
        inbox,
        addEvent,
        dismissNotification,
        completeTask,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

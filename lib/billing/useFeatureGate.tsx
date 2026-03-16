/**
 * Feature Gate Hook - Control access to features based on subscription
 */

import { useState, useEffect, useCallback } from 'react';
import { useBranding } from '@/lib/branding/context';
import { canUseFeature, checkLimit, getCompanySubscription, type CompanySubscription } from './pricing-service';

interface FeatureGateState {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: CompanySubscription | null;
  limitInfo?: {
    withinLimit: boolean;
    limit: number;
    remaining: number;
    current: number;
  };
}

/**
 * Hook to check if current company has access to a feature
 */
export function useFeatureGate(featureSlug: string): FeatureGateState {
  const { company } = useBranding();
  const [state, setState] = useState<FeatureGateState>({
    hasAccess: false,
    isLoading: true,
    error: null,
    subscription: null,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (!company?.id) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const [hasFeatureAccess, subscription] = await Promise.all([
          canUseFeature(company.id, featureSlug),
          getCompanySubscription(company.id),
        ]);

        setState({
          hasAccess: hasFeatureAccess,
          isLoading: false,
          error: null,
          subscription,
        });
      } catch (err) {
        setState({
          hasAccess: false,
          isLoading: false,
          error: 'Failed to check feature access',
          subscription: null,
        });
      }
    };

    checkAccess();
  }, [company?.id, featureSlug]);

  return state;
}

/**
 * Hook to check usage limits
 */
export function useLimitCheck(
  limitType: 'properties' | 'tenants' | 'users' | 'storage' | 'api_calls',
  currentCount: number
): FeatureGateState & { canAddMore: boolean } {
  const { company } = useBranding();
  const [state, setState] = useState<FeatureGateState & { canAddMore: boolean }>({
    hasAccess: true,
    canAddMore: false,
    isLoading: true,
    error: null,
    subscription: null,
    limitInfo: undefined,
  });

  useEffect(() => {
    const checkLimitStatus = async () => {
      if (!company?.id) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const subscription = await getCompanySubscription(company.id);
        
        if (!subscription) {
          setState({
            hasAccess: false,
            canAddMore: false,
            isLoading: false,
            error: 'No subscription found',
            subscription: null,
          });
          return;
        }

        const limitCheck = checkLimit(subscription, limitType, currentCount);

        setState({
          hasAccess: subscription.status === 'active' || subscription.status === 'trialing',
          canAddMore: limitCheck.withinLimit,
          isLoading: false,
          error: null,
          subscription,
          limitInfo: {
            ...limitCheck,
            current: currentCount,
          },
        });
      } catch (err) {
        setState({
          hasAccess: false,
          canAddMore: false,
          isLoading: false,
          error: 'Failed to check limits',
          subscription: null,
        });
      }
    };

    checkLimitStatus();
  }, [company?.id, limitType, currentCount]);

  return state;
}

/**
 * Hook to get subscription details
 */
export function useSubscription() {
  const { company } = useBranding();
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!company?.id) return;
    
    setIsLoading(true);
    const sub = await getCompanySubscription(company.id);
    setSubscription(sub);
    setIsLoading(false);
  }, [company?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    subscription,
    isLoading,
    refresh,
    isActive: subscription?.status === 'active' || subscription?.status === 'trialing',
    isTrial: subscription?.status === 'trialing',
    trialEndsAt: subscription?.trialEndsAt,
  };
}

/**
 * HOC to wrap components that require specific features
 */
export function withFeature<P extends object>(
  Component: React.ComponentType<P>,
  featureSlug: string,
  FallbackComponent?: React.ComponentType
) {
  return function FeatureWrappedComponent(props: P) {
    const { hasAccess, isLoading } = useFeatureGate(featureSlug);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!hasAccess) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return (
        <div className="p-8 text-center">
          <p className="text-slate-500">This feature is not available on your current plan.</p>
          <button className="mt-4 text-primary-600 hover:underline">
            Upgrade your plan
          </button>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

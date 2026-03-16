/**
 * Pricing & Subscription Service
 * 
 * PRICING MODEL:
 * - Minimum: $22 per property per month
 * - Starter: 5 properties × $22 = $110/month
 * - Growth: 20 properties × $22 = $440/month
 * - Pro: 20 properties × $22 = $440/month (includes all features)
 * - Enterprise: Custom pricing
 */

import { supabase } from '@/lib/supabase/client';

export const PRICE_PER_PROPERTY = 22.00; // $22/month minimum per property

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxProperties: number;
  maxTenants: number;
  maxUsers: number;
  maxStorageGb: number;
  maxApiCallsPerMonth: number;
  features: string[];
  isActive: boolean;
  isPublic: boolean;
}

export interface CompanySubscription {
  id: string;
  companyId: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
  billingInterval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  plan?: SubscriptionPlan;
}

/**
 * Get all public pricing plans
 */
export async function getPublicPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .eq('is_public', true)
    .order('sort_order', { ascending: true });
  
  if (error) return [];
  
  return data?.map(plan => ({
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    monthlyPrice: plan.monthly_price,
    annualPrice: plan.annual_price,
    currency: plan.currency,
    maxProperties: plan.max_properties,
    maxTenants: plan.max_tenants,
    maxUsers: plan.max_users,
    maxStorageGb: plan.max_storage_gb,
    maxApiCallsPerMonth: plan.max_api_calls_per_month,
    features: plan.features || [],
    isActive: plan.is_active,
    isPublic: plan.is_public,
  })) || [];
}

/**
 * Get company's subscription
 */
export async function getCompanySubscription(companyId: string): Promise<CompanySubscription | null> {
  const { data, error } = await supabase
    .from('company_subscriptions')
    .select(`*, plan:plan_id (*)`)
    .eq('company_id', companyId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    companyId: data.company_id,
    planId: data.plan_id,
    status: data.status,
    billingInterval: data.billing_interval,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    trialEndsAt: data.trial_ends_at,
    canceledAt: data.canceled_at,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    plan: data.plan ? {
      id: data.plan.id,
      name: data.plan.name,
      slug: data.plan.slug,
      description: data.plan.description,
      monthlyPrice: data.plan.monthly_price,
      annualPrice: data.plan.annual_price,
      currency: data.plan.currency,
      maxProperties: data.plan.max_properties,
      maxTenants: data.plan.max_tenants,
      maxUsers: data.plan.max_users,
      maxStorageGb: data.plan.max_storage_gb,
      maxApiCallsPerMonth: data.plan.max_api_calls_per_month,
      features: data.plan.features || [],
      isActive: data.plan.is_active,
      isPublic: data.plan.is_public,
    } : undefined,
  };
}

/**
 * Check if company can use a feature
 */
export async function canUseFeature(companyId: string, featureSlug: string): Promise<boolean> {
  const subscription = await getCompanySubscription(companyId);
  if (!subscription) return false;
  if (subscription.status !== 'active' && subscription.status !== 'trialing') return false;
  
  const { data: feature } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('slug', featureSlug)
    .single();
  
  if (!feature || !feature.is_active) return false;
  return feature.allowed_plan_ids.includes(subscription.planId);
}

/**
 * Check if within limits
 */
export function checkLimit(
  subscription: CompanySubscription,
  limitType: 'properties' | 'tenants' | 'users' | 'storage' | 'api_calls',
  currentCount: number
): { withinLimit: boolean; limit: number; remaining: number } {
  if (!subscription.plan) {
    return { withinLimit: false, limit: 0, remaining: 0 };
  }
  
  let limit = 0;
  switch (limitType) {
    case 'properties': limit = subscription.plan.maxProperties; break;
    case 'tenants': limit = subscription.plan.maxTenants; break;
    case 'users': limit = subscription.plan.maxUsers; break;
    case 'storage': limit = subscription.plan.maxStorageGb; break;
    case 'api_calls': limit = subscription.plan.maxApiCallsPerMonth; break;
  }
  
  const remaining = limit - currentCount;
  return { withinLimit: currentCount < limit, limit, remaining: Math.max(0, remaining) };
}

/**
 * Format price
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/**
 * Calculate annual savings
 */
export function calculateSavings(monthlyPrice: number, annualPrice: number): { amount: number; percentage: number } {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - annualPrice;
  return { amount: savings, percentage: Math.round((savings / monthlyTotal) * 100) };
}

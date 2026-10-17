import {
  SubscriptionPlan,
  WorkspaceSubscription,
  PaymentMethod,
  PaymentTransaction,
  BillingInvoice,
  WorkspaceUsageStats,
  BillingCycle,
  PaymentProviderType,
  BillingAddress,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityService } from './ActivityService';

const PLANS_STORAGE_KEY = 'cherryflow_subscription_plans';
const SUBSCRIPTION_STORAGE_KEY = 'cherryflow_workspace_subscription';
const PAYMENT_METHODS_STORAGE_KEY = 'cherryflow_payment_methods';
const INVOICES_STORAGE_KEY = 'cherryflow_invoices';
const TAX_ADDRESS_STORAGE_KEY = 'cherryflow_billing_tax_address';

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for small teams and solo creators getting started.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: '$',
    features: [
      'Up to 3 Team Seats',
      '1 GB Cloud Storage',
      '100 Monthly AI Credits',
      'Basic CRM & Task Boards',
      'Community Support',
    ],
    limits: {
      users: 3,
      storageGb: 1,
      aiCredits: 100,
      projects: 5,
      customers: 25,
      tasks: 100,
    },
    isActive: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Essential toolkit for growing startups and agile teams.',
    priceMonthly: 19,
    priceYearly: 180,
    currency: '$',
    features: [
      'Up to 10 Team Seats',
      '10 GB Cloud Storage',
      '1,000 Monthly AI Credits',
      'Unlimited Tasks & Projects',
      'Standard CRM Pipeline',
      'Email Support (24h SLA)',
    ],
    limits: {
      users: 10,
      storageGb: 10,
      aiCredits: 1000,
      projects: 25,
      customers: 250,
      tasks: 1000,
    },
    isActive: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced capabilities, real-time collaboration, and priority AI.',
    priceMonthly: 49,
    priceYearly: 468,
    currency: '$',
    features: [
      'Up to 25 Team Seats',
      '50 GB Cloud Storage',
      '5,000 Monthly AI Credits',
      'Advanced Analytics & Reports',
      'Custom CRM Automation',
      'Realtime Workspace Sync',
      'Priority Support',
    ],
    limits: {
      users: 25,
      storageGb: 50,
      aiCredits: 5000,
      projects: 100,
      customers: 1000,
      tasks: 5000,
    },
    isActive: true,
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'High performance scale for established businesses and agencies.',
    priceMonthly: 149,
    priceYearly: 1428,
    currency: '$',
    features: [
      'Up to 100 Team Seats',
      '250 GB Cloud Storage',
      '25,000 Monthly AI Credits',
      'Custom Domain Integration',
      'Dedicated Account Manager',
      'Audit Logging & RLS Policies',
      '99.9% Uptime Guarantee SLA',
    ],
    limits: {
      users: 100,
      storageGb: 250,
      aiCredits: 25000,
      projects: 500,
      customers: 5000,
      tasks: 25000,
    },
    isActive: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Bespoke security, unlimited scale, SSO, and custom AI fine-tuning.',
    priceMonthly: 399,
    priceYearly: 3828,
    currency: '$',
    features: [
      'Unlimited Team Seats',
      '1,000 GB Cloud Storage',
      '100,000 Monthly AI Credits',
      'Custom LLM Fine-tuning',
      'SSO & SAML Security',
      'SOC2 Type II Compliance',
      '24/7 Dedicated Support',
    ],
    limits: {
      users: 9999,
      storageGb: 1000,
      aiCredits: 100000,
      projects: 9999,
      customers: 99999,
      tasks: 99999,
    },
    isActive: true,
    isEnterprise: true,
  },
];

export class BillingService {
  // --- PLANS MANAGEMENT ---
  static async getPlans(): Promise<SubscriptionPlan[]> {
    const local = localStorage.getItem(PLANS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse local plans:', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('plans').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) {
          const mapped: SubscriptionPlan[] = data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            priceMonthly: Number(p.price_monthly),
            priceYearly: Number(p.price_yearly),
            currency: p.currency || '$',
            features: p.features || [],
            limits: {
              users: p.limit_users,
              storageGb: Number(p.limit_storage_gb),
              aiCredits: p.limit_ai_credits,
              projects: p.limit_projects,
              customers: p.limit_customers,
              tasks: p.limit_tasks,
            },
            isActive: p.is_active,
            isPopular: p.is_popular,
            isEnterprise: p.is_enterprise,
          }));

          localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.error('Supabase fetch plans error:', e);
      }
    }

    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
    return DEFAULT_PLANS;
  }

  static async saveCustomPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan[]> {
    const current = await this.getPlans();
    const existingIndex = current.findIndex((p) => p.id === plan.id);

    let updated: SubscriptionPlan[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = plan;
    } else {
      updated = [...current, plan];
    }

    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));

    ActivityService.logActivity(
      'system',
      'Updated Subscription Plan',
      `Admin updated billing configuration for "${plan.name}" plan.`
    );

    return updated;
  }

  // --- SUBSCRIPTION STATUS ---
  static async getWorkspaceSubscription(workspaceId: string): Promise<WorkspaceSubscription> {
    const key = `${SUBSCRIPTION_STORAGE_KEY}_${workspaceId}`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse subscription:', e);
      }
    }

    const defaultSub: WorkspaceSubscription = {
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      workspaceId,
      planId: 'professional',
      planName: 'Professional',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      provider: 'stripe',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(defaultSub));
    return defaultSub;
  }

  // --- UPGRADE / CHANGE PLAN ---
  static async processSubscriptionChange(params: {
    workspaceId: string;
    targetPlanId: string;
    billingCycle: BillingCycle;
    provider: PaymentProviderType;
    simulateFailure?: boolean;
    promoCode?: string;
  }): Promise<{ success: boolean; subscription?: WorkspaceSubscription; error?: string }> {
    if (params.simulateFailure) {
      return {
        success: false,
        error: 'Payment authorization declined by card issuer (Simulated Failure for Testing).',
      };
    }

    const plans = await this.getPlans();
    const targetPlan = plans.find((p) => p.id === params.targetPlanId) || DEFAULT_PLANS[0];

    const currentSub = await this.getWorkspaceSubscription(params.workspaceId);
    const isYearly = params.billingCycle === 'yearly';
    const amount = isYearly ? targetPlan.priceYearly : targetPlan.priceMonthly;

    const updatedSub: WorkspaceSubscription = {
      ...currentSub,
      planId: targetPlan.id,
      planName: targetPlan.name,
      billingCycle: params.billingCycle,
      provider: params.provider,
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(
        Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    const key = `${SUBSCRIPTION_STORAGE_KEY}_${params.workspaceId}`;
    localStorage.setItem(key, JSON.stringify(updatedSub));

    // Generate Invoice & Payment Record
    if (amount > 0) {
      await this.generateInvoiceAndPayment({
        workspaceId: params.workspaceId,
        subscriptionId: updatedSub.id,
        amount,
        planName: targetPlan.name,
        provider: params.provider,
      });
    }

    ActivityService.logActivity(
      'system',
      'Changed Subscription Plan',
      `Upgraded/Updated workspace subscription to "${targetPlan.name}" (${params.billingCycle.toUpperCase()}) via ${params.provider.toUpperCase()}`
    );

    return { success: true, subscription: updatedSub };
  }

  // --- CANCEL / RENEW SUBSCRIPTION ---
  static async toggleCancelAtPeriodEnd(
    workspaceId: string,
    cancel: boolean
  ): Promise<WorkspaceSubscription> {
    const current = await this.getWorkspaceSubscription(workspaceId);
    const updated: WorkspaceSubscription = {
      ...current,
      cancelAtPeriodEnd: cancel,
    };

    const key = `${SUBSCRIPTION_STORAGE_KEY}_${workspaceId}`;
    localStorage.setItem(key, JSON.stringify(updated));

    ActivityService.logActivity(
      'system',
      cancel ? 'Canceled Renewal' : 'Resumed Renewal',
      cancel
        ? 'Subscription scheduled to cancel at end of current billing period.'
        : 'Auto-renewal reactivated for workspace.'
    );

    return updated;
  }

  // --- PAYMENT METHODS ---
  static async getPaymentMethods(workspaceId: string): Promise<PaymentMethod[]> {
    const key = `${PAYMENT_METHODS_STORAGE_KEY}_${workspaceId}`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse payment methods:', e);
      }
    }

    const defaultMethods: PaymentMethod[] = [
      {
        id: 'pm_stripe_4242',
        workspaceId,
        provider: 'stripe',
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
        isDefault: true,
      },
    ];

    localStorage.setItem(key, JSON.stringify(defaultMethods));
    return defaultMethods;
  }

  static async addPaymentMethod(
    workspaceId: string,
    method: Omit<PaymentMethod, 'id' | 'workspaceId'>
  ): Promise<PaymentMethod[]> {
    const existing = await this.getPaymentMethods(workspaceId);
    const newPm: PaymentMethod = {
      ...method,
      id: `pm_${Math.random().toString(36).substring(2, 9)}`,
      workspaceId,
    };

    const updated = [newPm, ...existing.map((m) => ({ ...m, isDefault: false }))];
    const key = `${PAYMENT_METHODS_STORAGE_KEY}_${workspaceId}`;
    localStorage.setItem(key, JSON.stringify(updated));

    ActivityService.logActivity(
      'system',
      'Added Payment Method',
      `Added new ${method.brand} ending in ${method.last4}`
    );

    return updated;
  }

  // --- INVOICES ---
  static async getInvoices(workspaceId: string): Promise<BillingInvoice[]> {
    const key = `${INVOICES_STORAGE_KEY}_${workspaceId}`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse invoices:', e);
      }
    }

    const sampleInvoices: BillingInvoice[] = [];

    localStorage.setItem(key, JSON.stringify(sampleInvoices));
    return sampleInvoices;
  }

  static async generateInvoiceAndPayment(params: {
    workspaceId: string;
    subscriptionId: string;
    amount: number;
    planName: string;
    provider: PaymentProviderType;
  }): Promise<BillingInvoice> {
    const existing = await this.getInvoices(params.workspaceId);
    const invNum = `INV-${new Date().getFullYear()}-${String(existing.length + 1).padStart(3, '0')}`;

    const newInv: BillingInvoice = {
      id: `inv_${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber: invNum,
      workspaceId: params.workspaceId,
      amount: params.amount,
      taxAmount: Math.round(params.amount * 0.09 * 100) / 100,
      currency: 'USD',
      status: 'paid',
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      lineItems: [
        {
          description: `CherryFlow ${params.planName} Plan Subscription`,
          amount: params.amount,
          quantity: 1,
        },
      ],
      billingAddress: this.getBillingTaxAddress(params.workspaceId)?.address,
      gstVatId: this.getBillingTaxAddress(params.workspaceId)?.taxId,
    };

    const updated = [newInv, ...existing];
    const key = `${INVOICES_STORAGE_KEY}_${params.workspaceId}`;
    localStorage.setItem(key, JSON.stringify(updated));

    return newInv;
  }

  // --- BILLING TAX & ADDRESS ---
  static getBillingTaxAddress(workspaceId: string): { address?: BillingAddress; taxId?: string } {
    const key = `${TAX_ADDRESS_STORAGE_KEY}_${workspaceId}`;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse tax address:', e);
      }
    }
    return {
      taxId: 'VAT-US992019482',
      address: {
        line1: '100 Tech Blvd, Suite 200',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'United States',
      },
    };
  }

  static saveBillingTaxAddress(
    workspaceId: string,
    data: { address?: BillingAddress; taxId?: string }
  ) {
    const key = `${TAX_ADDRESS_STORAGE_KEY}_${workspaceId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- USAGE STATS & QUOTAS ---
  static async getWorkspaceUsageStats(workspaceId: string): Promise<WorkspaceUsageStats> {
    const sub = await this.getWorkspaceSubscription(workspaceId);
    const plans = await this.getPlans();
    const plan = plans.find((p) => p.id === sub.planId) || DEFAULT_PLANS[2];

    return {
      aiCreditsUsed: 1240,
      aiCreditsLimit: plan.limits.aiCredits,
      storageUsedGb: 12.4,
      storageLimitGb: plan.limits.storageGb,
      seatsUsed: 4,
      seatsLimit: plan.limits.users,
      projectsCount: 8,
      projectsLimit: plan.limits.projects,
      customersCount: 142,
      customersLimit: plan.limits.customers,
      tasksCount: 380,
      tasksLimit: plan.limits.tasks,
      apiCallsCount: 4820,
    };
  }

  // --- REVENUE & ANALYTICS FOR ADMIN ---
  static async getAdminRevenueAnalytics(): Promise<{
    mrr: number;
    arr: number;
    activeSubscribers: number;
    churnRatePct: number;
    planBreakdown: { planName: string; count: number; revenue: number }[];
  }> {
    return {
      mrr: 12450,
      arr: 149400,
      activeSubscribers: 184,
      churnRatePct: 1.8,
      planBreakdown: [
        { planName: 'Free', count: 420, revenue: 0 },
        { planName: 'Starter', count: 68, revenue: 1292 },
        { planName: 'Professional', count: 85, revenue: 4165 },
        { planName: 'Business', count: 24, revenue: 3576 },
        { planName: 'Enterprise', count: 7, revenue: 2793 },
      ],
    };
  }
}

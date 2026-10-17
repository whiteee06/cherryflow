import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Building2,
  Shield,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingPricingProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for solo founders & micro projects getting started.',
      priceMonthly: 0,
      priceYearly: 0,
      popular: false,
      features: [
        '1 Workspace Seat',
        'Up to 50 Customers',
        'Up to 100 Active Tasks',
        '1,000 Gemini AI Credits / mo',
        '1GB Document Storage',
        'Community Support',
      ],
      cta: 'Start Free Forever',
      badge: null,
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal for small growing teams and fast-paced startups.',
      priceMonthly: 19,
      priceYearly: 15,
      popular: false,
      features: [
        'Up to 5 Workspace Seats',
        'Up to 500 Customers',
        'Unlimited Tasks & Kanban',
        '10,000 Gemini AI Credits / mo',
        '10GB Document Storage',
        'Basic Workflow Automations',
        'Standard Email Support',
      ],
      cta: 'Start 14-Day Free Trial',
      badge: null,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Our most popular plan for scaling operations teams.',
      priceMonthly: 49,
      priceYearly: 39,
      popular: true,
      features: [
        'Up to 15 Workspace Seats',
        'Unlimited CRM Customers',
        'Unlimited Tasks & Sprints',
        '50,000 Gemini AI Credits / mo',
        '100GB Document Storage',
        'Advanced Trigger Automations',
        'Full Stripe Billing Integration',
        'Priority 24/7 Support',
      ],
      cta: 'Start Pro Trial',
      badge: 'Most Popular',
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For multi-department organizations requiring power & control.',
      priceMonthly: 99,
      priceYearly: 79,
      popular: false,
      features: [
        'Up to 50 Workspace Seats',
        'Unlimited CRM & Deals',
        'Unlimited Sprints & Notes',
        '250,000 Gemini AI Credits / mo',
        '500GB Document Storage',
        'Custom Workflow Integrations',
        'Role-Based Access Controls',
        'Dedicated Success Manager',
      ],
      cta: 'Upgrade to Business',
      badge: 'Power Team',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom SLA, security audits, dedicated cluster, SOC 2.',
      priceMonthly: 299,
      priceYearly: 239,
      popular: false,
      features: [
        'Unlimited Workspace Seats',
        'Unlimited Everything',
        'Custom Fine-Tuned Gemini AI',
        'Multi-Region Data Storage',
        'Custom SAML SSO & SCIM',
        'Dedicated Account Executive',
        '99.99% Uptime SLA',
      ],
      cta: 'Contact Sales',
      badge: 'Custom',
    },
  ];

  const comparisonRows = [
    { name: 'Workspace Members', free: '1', starter: '5', pro: '15', biz: '50', ent: 'Unlimited' },
    { name: 'CRM Contacts', free: '50', starter: '500', pro: 'Unlimited', biz: 'Unlimited', ent: 'Unlimited' },
    { name: 'Task Sprints', free: '100', starter: 'Unlimited', pro: 'Unlimited', biz: 'Unlimited', ent: 'Unlimited' },
    { name: 'Gemini AI Credits', free: '1,000', starter: '10,000', pro: '50,000', biz: '250,000', ent: 'Custom' },
    { name: 'Document Storage', free: '1 GB', starter: '10 GB', pro: '100 GB', biz: '500 GB', ent: 'Custom' },
    { name: 'Automations Engine', free: 'Basic', starter: 'Standard', pro: 'Advanced', biz: 'Custom Triggers', ent: 'Dedicated' },
    { name: 'Stripe Billing API', free: false, starter: true, pro: true, biz: true, ent: true },
    { name: 'Role-Based Access (RBAC)', free: false, starter: false, pro: true, biz: true, ent: true },
    { name: 'SAML SSO & SCIM', free: false, starter: false, pro: false, biz: false, ent: true },
    { name: 'Support SLA', free: 'Community', starter: 'Email', pro: '24/7 Priority', biz: 'Dedicated Rep', ent: '99.99% SLA' },
  ];

  return (
    <div className="py-24 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Predictable Costs. <span className="text-rose-600 dark:text-rose-500">Unmatched ROI.</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Choose the plan that fits your growth stage. Upgrade or downgrade anytime with zero hidden fees.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
              Billed Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              id="billing-cycle-toggle"
              className="w-14 h-8 rounded-full bg-rose-600 p-1 transition-colors cursor-pointer flex items-center"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                Billed Yearly
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                  plan.popular
                    ? 'bg-gradient-to-b from-rose-500/10 via-white to-white dark:from-rose-950/40 dark:via-zinc-900 dark:to-zinc-900 border-2 border-rose-500 shadow-xl scale-105 z-10'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">${price}</span>
                      <span className="text-xs text-zinc-500 font-medium">/ user / mo</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                        Billed annually (${price * 12}/yr)
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onLaunchApp}
                  id={`plan-cta-${plan.id}`}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Full Feature Comparison Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[160px]">Capability</th>
                  <th className="py-3 px-4">Free</th>
                  <th className="py-3 px-4">Starter</th>
                  <th className="py-3 px-4 text-rose-600 dark:text-rose-400 font-bold">Pro</th>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-800 dark:text-zinc-200">{row.name}</td>

                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                      ) : (
                        row.free
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                      ) : (
                        row.starter
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="w-4 h-4 text-rose-500" /> : <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                      ) : (
                        row.pro
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {typeof row.biz === 'boolean' ? (
                        row.biz ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                      ) : (
                        row.biz
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {typeof row.ent === 'boolean' ? (
                        row.ent ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                      ) : (
                        row.ent
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

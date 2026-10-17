import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, Globe, CheckCircle2 } from 'lucide-react';

interface LandingLegalProps {
  initialTab?: 'privacy' | 'terms';
}

export const LandingLegal: React.FC<LandingLegalProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="py-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Tab Toggle Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('privacy')}
              id="legal-privacy-tab-btn"
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              id="legal-terms-tab-btn"
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Terms of Service
            </button>
          </div>
          <span className="text-xs text-zinc-400 block font-mono">Effective Date: January 1, 2026</span>
        </div>

        {/* Content Box */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 shadow-sm space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {activeTab === 'privacy' ? (
            <div className="space-y-6 animate-in fade-in">
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">CherryFlow Privacy Policy</h1>

              <p>
                CherryFlow Inc. ("CherryFlow", "we", "us", or "our") is committed to protecting the privacy and security of your workspace data. This Privacy Policy outlines how we collect, use, disclose, and safeguard information when you use the CherryFlow web application and operational services.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">1. Data We Collect</h2>
              <p>
                We collect information you provide directly, such as account setup credentials (name, email address, company profile), workspace entries (CRM customer profiles, deal amounts, tasks, notes), and billing details managed via our payment processor Stripe.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">2. Gemini AI Zero-Retention Policy</h2>
              <p>
                When using the CherryFlow AI Copilot, your queries and workspace context are transmitted over TLS 1.3 encrypted connections to isolated Gemini endpoints. We do NOT use your proprietary CRM records or private workspace notes to train public or foundational AI models.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">3. Data Security & Storage</h2>
              <p>
                All customer records are encrypted at rest using AES-256 standards and backed up redundantly across SOC 2 Type II certified data centers in Cloud Run / Firestore infrastructure.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">4. Your GDPR & CCPA Rights</h2>
              <p>
                You have the right to inspect, export, or delete your entire workspace data at any time via the Settings menu or by contacting support@cherryflow.io.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">CherryFlow Terms of Service</h1>

              <p>
                By accessing or using the CherryFlow platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">1. Workspace Subscriptions & Billing</h2>
              <p>
                Subscription plans are billed in advance on a monthly or annual basis via Stripe. You may upgrade, downgrade, or cancel your subscription at any time. Unused seat or credit allocations expire at the conclusion of each billing cycle.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">2. Acceptable Use Policy</h2>
              <p>
                You agree not to misuse the platform, reverse-engineer proprietary algorithms, conduct unauthorized automated scraping, or upload malicious payloads that endanger workspace availability.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">3. Service Level Agreement (SLA)</h2>
              <p>
                CherryFlow strives to maintain 99.99% operational uptime across all paid workspace tiers. Enterprise customers receive custom SLA guarantees with financial credit remedies for unplanned downtime.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white pt-2">4. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, CherryFlow Inc. shall not be liable for indirect, incidental, or consequential damages resulting from platform usage or temporary service interruptions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

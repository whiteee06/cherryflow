# Prompt #10: SaaS Billing & Subscription System Testing Guide

## 🚀 Overview
This guide provides complete instructions for validating Prompt #10 (SaaS Billing & Subscription Management) in CherryFlow, covering multi-tier plans, payment provider abstraction (Stripe & Razorpay), promo code discounts, payment failure simulation, PDF invoice generation, GST/VAT tax address configuration, resource usage meters, and admin revenue analytics.

---

## 🛠️ Testing Scenarios

### 1. Subscription Plans & Pricing Matrix
1. Open CherryFlow and select **Billing & Plans** from the left navigation sidebar.
2. Observe the current active plan banner (e.g., **Professional Plan - ACTIVE**).
3. In the **Subscription Plans & Pricing Tiers** section, click the **Monthly / Yearly** toggle.
4. Verify that annual pricing applies a **20% discount badge** across all plan cards.
5. Review feature matrices for all 5 tiers:
   - **Free** ($0/mo): 3 Seats, 1 GB Storage, 100 AI Credits
   - **Starter** ($19/mo): 10 Seats, 10 GB Storage, 1,000 AI Credits
   - **Professional** ($49/mo): 25 Seats, 50 GB Storage, 5,000 AI Credits (*Most Popular*)
   - **Business** ($149/mo): 100 Seats, 250 GB Storage, 25,000 AI Credits
   - **Enterprise** ($399/mo): Unlimited Seats, 1,000 GB Storage, 100,000 AI Credits

### 2. Upgrade & Checkout Flow
1. Click **Select Plan** or **Upgrade Subscription** on any plan (e.g. *Business* or *Enterprise*).
2. In the **Upgrade Modal**:
   - Switch between **Monthly** and **Annual** billing cycles.
   - Choose payment provider: **Stripe Credit Card** or **Razorpay / UPI**.
   - Enter promo code `CHERRY20` or `LAUNCH50` and click **Apply**. Verify discount applies to final total.
3. Click **Confirm & Pay**.
4. Confirm that the current active plan badge, renewal date, and resource quota meters update immediately upon successful authorization.

### 3. Payment Failure Simulation
1. Open the **Upgrade Modal** for any plan.
2. Toggle the **Simulate Payment Failure** switch to `ON`.
3. Click **Confirm & Pay**.
4. Verify that the system intercepts the declined transaction and displays a clear error banner (*"Payment authorization declined by card issuer"*).
5. Uncheck the failure switch and retry to ensure recovery.

### 4. Workspace Quota & Resource Limit Monitors
1. Review the **Workspace Resource Quotas & Usage** panel on the Billing Dashboard.
2. Inspect the animated progress bars for:
   - **AI Monthly Credits**: Displays used vs limit (e.g. 1,240 / 5,000)
   - **Cloud Storage**: Displays used vs total capacity (e.g. 12.4 GB / 50 GB)
   - **Team Seats**: Displays active members vs allowed seat quota (e.g. 4 / 25 seats)
3. Upgrade to a higher tier and verify that storage, AI credit, and seat limits increase dynamically.

### 5. Invoices & Printable Receipts
1. Scroll down to the **Invoice History & Receipts** table.
2. View past statements with invoice numbers (e.g., `INV-2026-001`), payment status badges (`PAID`), and tax calculations.
3. Click **View PDF** on any invoice row.
4. In the **Invoice Modal**:
   - Verify company details (CherryFlow Inc., EIN, Tax ID).
   - Verify line items, subtotal, 9% GST/VAT tax breakdown, and total paid.
   - Click **Print Invoice** to launch browser print preview.
   - Click **Download Document** to download a text/PDF invoice record.

### 6. GST/VAT Tax ID & Billing Address
1. Locate the **Tax ID & Billing Address** card.
2. Enter a custom Tax/VAT ID (e.g., `VAT-US992019482`) and street address details.
3. Click **Save Tax Address**.
4. Open an invoice modal and verify that the saved GST/VAT ID and billing address appear on the official document.

### 7. SaaS Admin Revenue Analytics & Plan Manager
1. Click the **Revenue & Plan Admin** button in the top header.
2. In the **SaaS Admin Analytics Modal**:
   - Monitor Monthly Recurring Revenue (**MRR**), Annual Recurring Revenue (**ARR**), Subscriber count, and Churn Rate.
   - Review subscription plan breakdowns.
   - Click **Edit Plan** on any plan to adjust price, seat limits, storage, or AI credit limits.
   - Click **Create Custom Plan** to define bespoke enterprise pricing.

### 8. Supabase Database Migration & RLS Security
1. Run `/supabase/migrations/08_billing_subscription_schema.sql` in your Supabase SQL Editor.
2. Confirm creation of tables: `plans`, `subscriptions`, `payments`, `payment_methods`, `invoices`, `usage_logs`, `billing_events`.
3. Verify RLS policies restricting workspace invoice and subscription access exclusively to authorized workspace owners and admins.

---

## 💻 Technical Checklist
- [x] Billing TypeScript Types & Quotas (`src/types.ts`)
- [x] Supabase Migration Script with RLS (`/supabase/migrations/08_billing_subscription_schema.sql`)
- [x] Billing & Subscription Service (`src/services/BillingService.ts`)
- [x] Upgrade & Checkout Modal (`src/components/billing/UpgradeModal.tsx`)
- [x] Printable PDF Invoice Modal (`src/components/billing/InvoiceModal.tsx`)
- [x] SaaS Admin & Revenue Manager Modal (`src/components/billing/AdminPlanManagerModal.tsx`)
- [x] Complete Billing Dashboard Hub (`src/components/billing/BillingDashboardView.tsx`)
- [x] Sidebar & Main Navigation Integration (`src/components/Sidebar.tsx` & `src/App.tsx`)

-- ==============================================================================
-- CHERRYFLOW OS - PRODUCTION SEED DATA
-- ==============================================================================
-- Initial reference data, plans, sample customers, tasks, notes, and workspaces.

-- 1. Insert Initial Subscription Plans
INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, features, is_active, created_at)
VALUES 
  (
    'plan_starter',
    'Starter',
    'Ideal for freelancers and solo founders starting out.',
    19,
    190,
    '["Up to 50 active contacts", "Standard AI Copilot", "5GB Storage", "1 Workspace Member", "Email Support"]'::jsonb,
    true,
    NOW()
  ),
  (
    'plan_pro',
    'Professional',
    'Perfect for growing agencies, consulting firms, and teams.',
    49,
    490,
    '["Unlimited contacts", "Advanced AI Copilot & Outreach", "50GB Storage", "Up to 5 Team Members", "Custom Workflows", "Priority Support"]'::jsonb,
    true,
    NOW()
  ),
  (
    'plan_enterprise',
    'Enterprise Custom',
    'Custom SLA, unlimited scale, dedicated database, and 24/7 account management.',
    199,
    1990,
    '["Unlimited Workspaces & Team Members", "Custom AI Model Fine-tuning", "1TB Dedicated Storage", "24/7 Dedicated Account Director", "SSO & Audit Logging", "99.99% Uptime SLA"]'::jsonb,
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Workspaces
INSERT INTO public.workspaces (id, name, slug, owner_id, plan_id, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Acme Innovations Workspace',
    'acme-innovations',
    '00000000-0000-0000-0000-000000000000',
    'plan_pro',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sample Customers
INSERT INTO public.customers (id, workspace_id, name, email, phone, company, status, deal_value, tags, last_contacted_at, notes, created_at)
VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Sarah Jenkins',
    'sarah@nexusdigital.io',
    '+1 (555) 234-5678',
    'Nexus Digital Group',
    'Proposal Sent',
    18500,
    ARRAY['enterprise', 'high-value', 'q3-deal'],
    NOW() - INTERVAL '2 days',
    'Interested in full CRM migration and automated marketing workflows.',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'David Miller',
    'david@apextech.com',
    '+1 (555) 876-5432',
    'Apex Technology Partners',
    'Negotiation',
    34000,
    ARRAY['saas', 'vip', 'closing-soon'],
    NOW() - INTERVAL '1 day',
    'Reviewing SLA and security compliance specs before signing.',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Elena Rostova',
    'elena@strataagency.co',
    '+1 (555) 432-1098',
    'Strata Creative Agency',
    'Closed Won',
    12000,
    ARRAY['agency', 'recurrent'],
    NOW() - INTERVAL '5 days',
    'Onboarded onto Pro Plan with 4 team seats.',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Sample Tasks
INSERT INTO public.tasks (id, workspace_id, title, description, priority, status, due_date, tags, created_at)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Finalize Q3 Enterprise Contract with David Miller',
    'Review custom SLA clauses and output PDF version for signing.',
    'High',
    'In Progress',
    (CURRENT_DATE + INTERVAL '2 days')::text,
    ARRAY['contract', 'sales'],
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Setup Vercel Edge & Supabase Production Webhooks',
    'Configure webhook security signatures and automated email triggers.',
    'Medium',
    'Todo',
    (CURRENT_DATE + INTERVAL '4 days')::text,
    ARRAY['devops', 'backend'],
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Notes
INSERT INTO public.notes (id, workspace_id, title, content, tags, is_pinned, created_at)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Q3 Strategic Growth Roadmap',
    '# Growth Strategy
1. Expand AI copilot prompt customization for agency clients.
2. Launch automated billing retry sequence for past-due invoices.
3. Optimize Supabase index queries for sub-50ms response times.',
    ARRAY['strategy', 'roadmap'],
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

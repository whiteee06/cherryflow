import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceService } from '../../services/WorkspaceService';
import {
  Cherry,
  Database,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  ArrowLeft,
  Key,
  Globe,
  Terminal,
  BookOpen,
  Code,
  Lock,
  Building2,
  ShieldCheck,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export const SupabaseSetupModal: React.FC = () => {
  const { user, session, setScreen, isSupabaseConfigured } = useAuth();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'public' | 'basic' | 'workspace' | 'platform-admin'>('public');

  // Backend response states
  const [guideData, setGuideData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const activeWorkspaceId = user?.defaultWorkspaceId || WorkspaceService.getActiveWorkspaceId() || 'ws_default_101';

  // Automatically select default tab based on role on mount
  useEffect(() => {
    if (!user) {
      setActiveTab('public');
    } else if (user.role === 'super_admin') {
      setActiveTab('platform-admin');
    } else {
      setActiveTab('basic');
    }
  }, [user]);

  // Fetch guide content from backend API with RBAC headers
  useEffect(() => {
    async function fetchGuideData() {
      setIsLoading(true);
      setApiError(null);

      let url = '/api/integration-guide/public';
      if (activeTab === 'basic') url = '/api/integration-guide/basic';
      if (activeTab === 'workspace') url = `/api/integration-guide/workspace/${activeWorkspaceId}`;
      if (activeTab === 'platform-admin') url = '/api/integration-guide/platform-admin';

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (session?.accessToken) {
          headers['Authorization'] = `Bearer ${session.accessToken}`;
        }
        if (user) {
          headers['x-user-email'] = user.email;
          headers['x-user-role'] = user.role;
        }

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok) {
          setApiError(data.error || `HTTP ${res.status}: Access Denied`);
          setGuideData(null);
        } else {
          setGuideData(data);
          setApiError(null);
        }
      } catch (err: any) {
        setApiError('Failed to fetch integration guide from backend server.');
        setGuideData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGuideData();
  }, [activeTab, user, session, activeWorkspaceId]);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSnippet = `# .env file or Environment Variables in AI Studio Secrets
VITE_SUPABASE_URL="${import.meta.env.VITE_SUPABASE_URL || 'https://vedblbrrjxytdmkylzwf.supabase.co'}"
VITE_SUPABASE_ANON_KEY="${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}"`;

  const sqlMigrationSchema = `-- Enable Row Level Security (RLS) on all tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  role TEXT DEFAULT 'owner',
  currency TEXT DEFAULT '$',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, business_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Cherry User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'businessName', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-lg">
              <Cherry className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CherryFlow Integration &amp; API Guide</h1>
              <p className="text-xs text-slate-400">Role-Based Access Control &amp; Backend Enforcement Specs</p>
            </div>
          </div>

          <button
            onClick={() => setScreen(user ? 'app' : 'landing')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{user ? 'Return to Application' : 'Return to Landing'}</span>
          </button>
        </div>

        {/* Current Active Session & Role Status Banner */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                !user
                  ? 'bg-slate-800 text-slate-400'
                  : user.role === 'super_admin'
                  ? 'bg-rose-600 shadow-lg shadow-rose-600/30'
                  : 'bg-emerald-600 shadow-lg shadow-emerald-600/30'
              }`}
            >
              {!user ? <Globe className="w-5 h-5" /> : user.role === 'super_admin' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Session Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                    !user
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : user.role === 'super_admin'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {!user
                    ? 'Logged-Out Visitor'
                    : user.role === 'super_admin'
                    ? 'Super Admin (Root)'
                    : `Business Owner (${user.role.toUpperCase()})`}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">
                {user ? `${user.name} (${user.email})` : 'Public Guest Visitor — No active authentication token'}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono">
            <span>Target Database: </span>
            <span className="text-emerald-400 font-bold">{isSupabaseConfigured ? 'Supabase Cloud' : 'Sandbox Mode'}</span>
          </div>
        </div>

        {/* Role-Based Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'public', label: '1. Public Docs', icon: Globe, reqRole: 'Everyone' },
            { id: 'basic', label: '2. Business Owner Client', icon: Key, reqRole: 'Authenticated Owners' },
            { id: 'workspace', label: '3. Workspace Secrets', icon: Building2, reqRole: 'Workspace Members' },
            { id: 'platform-admin', label: '4. Platform Admin Root', icon: Lock, reqRole: 'Super Admins Only' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-500/10 border border-rose-500/40 text-rose-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/80 text-slate-400 font-mono border border-slate-800">
                  {tab.reqRole}
                </span>
              </button>
            );
          })}
        </div>

        {/* Backend API Authorization Error Alert */}
        {apiError && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Backend Access Control Enforcement Active</span>
            </div>
            <p className="text-xs text-rose-300/90 font-mono leading-relaxed">{apiError}</p>
            <p className="text-[11px] text-slate-400">
              Backend routes strictly check authentication sessions, workspace membership, and super admin tokens before serving sensitive integration keys or configuration payload.
            </p>
          </div>
        )}

        {/* TAB 1: PUBLIC DOCS */}
        {activeTab === 'public' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Public Open API &amp; SDK Overview</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Logged-out visitors and public developers can access general architecture guides, open endpoint definitions, and standard SDK installation instructions without requiring private API tokens.
              </p>

              {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs font-mono flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                  <span>Loading public documentation from server...</span>
                </div>
              ) : (
                guideData?.sections && (
                  <div className="space-y-3">
                    {guideData.sections.map((s: any) => (
                      <div key={s.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold text-white">{s.title}</h4>
                        {s.content && <p className="text-xs text-slate-400 leading-relaxed">{s.content}</p>}
                        {s.codeSnippet && (
                          <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
                            {s.codeSnippet}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BASIC BUSINESS OWNER GUIDE */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Step 1: Connecting Supabase Credentials */}
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <Key className="w-4 h-4" />
                <span>Step 1: Public Client Credentials Setup</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Available to all authenticated business owners. Configure public client environment variables to connect your client application to your Supabase instance:
              </p>

              <div className="relative">
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                  {envSnippet}
                </pre>
                <button
                  onClick={() => copyToClipboard(envSnippet, 'env')}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSection === 'env' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Supabase Database Migration SQL */}
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <Code className="w-4 h-4" />
                <span>Step 2: Database Schema &amp; Row Level Security (RLS)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Run this SQL in your Supabase SQL Editor to establish user profiles and enforce strict Row Level Security (RLS) data isolation:
              </p>

              <div className="relative">
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-64">
                  {sqlMigrationSchema}
                </pre>
                <button
                  onClick={() => copyToClipboard(sqlMigrationSchema, 'sql')}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSection === 'sql' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKSPACE SPECIFIC SETTINGS */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Workspace Webhook &amp; Integration Secrets</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Specific integration secrets and webhook signing tokens for your workspace (<strong className="text-rose-400">{activeWorkspaceId}</strong>). Only authorized members of this workspace can view these settings.
              </p>

              {guideData?.workspaceSettings ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300">Workspace Webhook Signing Secret</span>
                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-amber-400">
                      {guideData.workspaceSettings.webhookSigningSecret}
                    </pre>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300">Active Webhook Endpoints</span>
                    <div className="space-y-2">
                      {guideData.workspaceSettings.activeWebhookEndpoints.map((ep: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 flex items-center justify-between gap-2">
                          <span className="truncate">{ep.url}</span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] uppercase font-bold shrink-0">
                            {ep.events.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                !apiError && (
                  <p className="text-xs text-slate-500 italic">No workspace settings loaded yet.</p>
                )
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM ADMIN ROOT */}
        {activeTab === 'platform-admin' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Platform Administrator Root Integration Settings</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Root system controls, Service-Role Keys, AI API keys, and database connection pools. Restricted exclusively to authorized Platform Administrators (<strong className="text-rose-400">super_admin</strong>).
              </p>

              {guideData?.platformSecrets ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Supabase Service-Role Key (Server-Side)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase font-mono">
                        {guideData.platformSecrets.serviceRoleKeyConfigured ? 'Configured' : 'Missing'}
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-rose-400">
                      {guideData.platformSecrets.serviceRoleKeyMasked}
                    </pre>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-200">Database Connection Pool</span>
                    <p className="text-slate-400 font-mono">{guideData.platformSecrets.databaseConnectionPool}</p>
                  </div>
                </div>
              ) : (
                !apiError && (
                  <p className="text-xs text-slate-500 italic">No platform secrets loaded.</p>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

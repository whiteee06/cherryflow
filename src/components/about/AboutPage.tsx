import React from 'react';
import { BRAND_CONFIG } from '../../config/brandConfig';
import { CherryFlowLogo } from '../common/CherryFlowLogo';
import {
  ShieldCheck,
  Target,
  Sparkles,
  Award,
  Layers,
  Globe2,
  Lock,
  Heart,
  Code2,
  CheckCircle2,
  User,
  Building2,
  FileText,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface AboutPageProps {
  onBackToDashboard?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToDashboard }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header Hero Banner */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full pointer-events-none" />

          <CherryFlowLogo size="2xl" showSubtitle={false} animated={true} className="justify-center mb-4" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>AI-Powered Business Operating System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            About {BRAND_CONFIG.productName}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            {BRAND_CONFIG.about.summary}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
              <Building2 className="w-3.5 h-3.5 text-rose-400" />
              {BRAND_CONFIG.companyName}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              {BRAND_CONFIG.founder.country}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-rose-400 font-bold">
              {BRAND_CONFIG.version}
            </span>
          </div>
        </div>

        {/* Founder & Company Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Founder Profile Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-950/40">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                  {BRAND_CONFIG.founder.designation}
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {BRAND_CONFIG.founder.name}
                </h3>
                <p className="text-xs text-slate-400">Founder & Chief Executive Officer</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
              Passionate engineering founder leading the vision of CherryFlow to transform business productivity with full-stack automation, intelligent copilot workflows, and accessible enterprise technology.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-rose-400">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Made with pride in India</span>
            </div>
          </div>

          {/* Company Details Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                <Building2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Corporate Identity
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {BRAND_CONFIG.companyName}
                </h3>
                <p className="text-xs text-slate-400">Registered Tech Enterprise &bull; India</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Official Product:</span>
                <span className="font-bold text-white">{BRAND_CONFIG.productName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tagline:</span>
                <span className="font-semibold text-rose-400">{BRAND_CONFIG.tagline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Support Desk:</span>
                <span className="font-mono text-slate-200">{BRAND_CONFIG.support.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mission */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Our Mission</span>
            </h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              "{BRAND_CONFIG.about.mission}"
            </p>
          </div>

          {/* Vision */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Our Vision</span>
            </h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              "{BRAND_CONFIG.about.vision}"
            </p>
          </div>

        </div>

        {/* Technology Stack Grid */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">Technology Stack</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BRAND_CONFIG.about.techStack.map((tech) => (
              <div
                key={tech}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & License Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Security Notice */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Security Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {BRAND_CONFIG.about.securityNotice}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">Supabase DB</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">JWT Signed</span>
              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">256-Bit TLS</span>
            </div>
          </div>

          {/* License */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <FileText className="w-5 h-5" />
              <span>License & Copyright Notice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {BRAND_CONFIG.about.licenseNotice}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono">
              {BRAND_CONFIG.copyright}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

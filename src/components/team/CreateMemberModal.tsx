import React, { useState } from 'react';
import { WorkspaceRole, WorkspaceMember } from '../../types';
import { TeamService, generateTemporaryPassword } from '../../services/TeamService';
import { X, UserPlus, Mail, Shield, Copy, Check, User, Phone, Briefcase, Building2, AlertCircle, KeyRound, Lock, ArrowRight, RefreshCw, Send } from 'lucide-react';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  currentUser: {
    name: string;
    email: string;
  };
  onMemberCreated: (member: WorkspaceMember, tempPassword: string) => void;
}

export const CreateMemberModal: React.FC<CreateMemberModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  currentUser,
  onMemberCreated,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('Team Member');
  const [role, setRole] = useState<WorkspaceRole>('employee');
  const [tempPassword, setTempPassword] = useState(() => generateTemporaryPassword());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createdMember, setCreatedMember] = useState<WorkspaceMember | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleRegeneratePassword = () => {
    setTempPassword(generateTemporaryPassword());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await TeamService.createMemberDirectly({
        workspaceId,
        workspaceName,
        name: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        role,
        createdByName: currentUser.name,
        createdByEmail: currentUser.email,
        tempPassword,
      });

      setCreatedMember(result.member);
      onMemberCreated(result.member, result.tempPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to create team member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const credentialsSummary = createdMember
    ? `Welcome to ${workspaceName}!\n\nYour Team Account Has Been Created:\nName: ${createdMember.name}\nEmail: ${createdMember.email}\nRole: ${createdMember.role.toUpperCase()}\nTemporary Password: ${tempPassword}\n\nPlease sign in at the login page using your email and temporary password. You will be prompted to set a permanent password upon your first login.`
    : '';

  const handleCopySummary = () => {
    navigator.clipboard.writeText(credentialsSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setMobileNumber('');
    setDepartment('Engineering');
    setJobTitle('Team Member');
    setRole('employee');
    setTempPassword(generateTemporaryPassword());
    setCreatedMember(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <UserPlus size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create Team Member Account</h3>
            <p className="text-xs text-zinc-500">Register account directly with automatic temporary password for <span className="font-semibold text-rose-500">{workspaceName}</span></p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {createdMember ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <Check size={18} /> Team Account Created Successfully!
              </p>
              <p>
                Account stored securely in Supabase. On first login, <strong>{createdMember.email}</strong> will be forced to set a permanent password and will automatically join this workspace.
              </p>
            </div>

            {/* Account Credentials Card */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-base">
                    {createdMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{createdMember.name}</h4>
                    <p className="text-xs text-zinc-500">{createdMember.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs uppercase tracking-wider border border-rose-500/20">
                  {createdMember.role}
                </span>
              </div>

              {/* Temporary Password Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-amber-500" />
                  Generated Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-mono font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                    {tempPassword}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-md shadow-rose-600/20"
                  >
                    {copiedPassword ? <Check size={14} /> : <Copy size={14} />}
                    {copiedPassword ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                Share this temporary password with <strong>{createdMember.name}</strong>. Upon signing in, they will be prompted to set a new password and immediately directed into this workspace.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSummary ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copiedSummary ? 'Credentials Summary Copied!' : 'Copy Login Instructions'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>Add Another</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Number & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Department
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Executive">Executive</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Title & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Developer"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Assign Workspace Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="admin">Admin (Manage Team & Operations)</option>
                    <option value="manager">Manager (Assign Tasks & Projects)</option>
                    <option value="employee">Employee / Member (Standard Access)</option>
                    <option value="viewer">Viewer (Read-only Access)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Automatic Temporary Password Field */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-amber-500" />
                  Auto-Generated Temporary Password
                </label>
                <button
                  type="button"
                  onClick={handleRegeneratePassword}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-sm text-rose-600 dark:text-rose-400 tracking-wider">
                {tempPassword}
              </div>
              <p className="text-[11px] text-zinc-500">
                User will log in using this temporary password and will be prompted to set a new password on first login.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Team Member'}
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

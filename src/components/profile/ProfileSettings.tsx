import React, { useState } from 'react';
import { UserProfile, ThemeMode } from '../../types';
import {
  User,
  Building2,
  Mail,
  Lock,
  DollarSign,
  Sun,
  Moon,
  RefreshCw,
  Download,
  CheckCircle2,
  Save,
  ShieldAlert
} from 'lucide-react';

interface ProfileSettingsProps {
  user: UserProfile;
  onSaveUser: (updatedUser: UserProfile) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onResetDemoData: () => void;
  onExportBackup: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onSaveUser,
  theme,
  setTheme,
  onResetDemoData,
  onExportBackup,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [role, setRole] = useState(user.role);
  const [currency, setCurrency] = useState(user.currency || '$');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...user,
      name: name.trim(),
      email: email.trim(),
      businessName: businessName.trim(),
      role: role.trim(),
      currency,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage({ text: '', type: '' });

    if (!newPassword || newPassword.length < 6) {
      setPassMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassMessage({ text: 'Password successfully updated!', type: 'success' });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Account & Business Settings</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your business identity, password, theme preferences, and data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Avatar Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-3">
            {name ? name.charAt(0).toUpperCase() : 'C'}
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">{name}</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{role}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{businessName}</p>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full text-xs text-zinc-500">
            <p>
              Member since:{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Right Column: Profile Form & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <User size={16} className="text-rose-600 dark:text-rose-400" /> Business Identity
            </h3>

            {saveSuccess && (
              <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} /> Profile settings saved successfully!
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Default Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  <option value="$">$ USD / CAD / AUD</option>
                  <option value="€">€ EUR</option>
                  <option value="£">£ GBP</option>
                  <option value="₹">₹ INR</option>
                  <option value="¥">¥ JPY / CNY</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Lock size={16} className="text-rose-600 dark:text-rose-400" /> Security & Password
            </h3>

            {passMessage.text && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  passMessage.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300'
                }`}
              >
                {passMessage.type === 'error' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Data Controls */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Appearance & Data Management
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Theme Mode</p>
                <p className="text-[11px] text-zinc-500">Toggle dark mode or light mode appearance</p>
              </div>

              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                <span>{theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={onExportBackup}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <Download size={15} /> Export JSON Data Backup
              </button>

              <button
                onClick={onResetDemoData}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-100 cursor-pointer"
              >
                <RefreshCw size={15} /> Reset to Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

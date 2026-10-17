import React from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Terminal,
  CheckCircle2,
  X,
  FileCode,
  UserCheck,
  Bug,
} from 'lucide-react';

interface AdminTestingGuideModalProps {
  onClose: () => void;
}

export const AdminTestingGuideModal: React.FC<AdminTestingGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 max-w-3xl w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                Super Admin Verification &amp; Security Testing Guide
              </h3>
              <p className="text-xs text-zinc-400">
                Step-by-step instructions to create super admins, enforce RBAC, test audit logging, &amp; support workflows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
          {/* Step 1 */}
          <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                1
              </span>
              <span>How to Create the First Super Admin User</span>
            </h4>
            <p className="text-zinc-500 leading-relaxed">
              In production, Super Admin accounts are provisioned via database seed scripts or CLI environment commands rather than self-service signup forms.
            </p>
            <div className="p-3 bg-zinc-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
              <code>{`// Seed script or SQL command to grant super_admin privilege:\nUPDATE users SET role = 'super_admin' WHERE email = 'admin@cherryflow.io';`}</code>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                2
              </span>
              <span>How to Secure Admin Routes using Middleware (RBAC)</span>
            </h4>
            <p className="text-zinc-500 leading-relaxed">
              The Super Admin Panel is isolated from customer workspace routes. The route guard evaluates <code className="text-rose-500 font-mono">user.role === 'super_admin'</code> before rendering.
            </p>
            <div className="p-3 bg-zinc-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
              <code>{`// Express API Middleware example (server-side security):\nexport function requireSuperAdmin(req, res, next) {\n  if (req.user?.role !== 'super_admin') {\n    return res.status(403).json({ error: 'Forbidden: Super Admin privileges required.' });\n  }\n  next();\n}`}</code>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                3
              </span>
              <span>How to Verify Audit Logging</span>
            </h4>
            <p className="text-zinc-500 leading-relaxed">
              Every sensitive administrative operation (impersonating a user, toggling feature flags, overriding subscription tiers, or suspending workspaces) automatically generates an immutable record in the <code className="text-rose-500 font-mono">Audit Logs</code> tab with the admin ID, action description, and source IP address.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                4
              </span>
              <span>How to Test Support Tickets</span>
            </h4>
            <p className="text-zinc-500 leading-relaxed">
              Navigate to the <code className="text-rose-500 font-mono">Support Tickets</code> tab. Select any ticket (e.g. TICK-9012) to reply to the customer, update the status to Resolved or Closed, or leave internal staff notes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

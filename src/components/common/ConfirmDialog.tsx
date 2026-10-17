import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white',
        };
      case 'danger':
      default:
        return {
          iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          buttonBg: 'bg-rose-600 hover:bg-rose-500 text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${styles.iconBg}`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-colors flex items-center gap-1.5 ${styles.buttonBg}`}
          >
            {isLoading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

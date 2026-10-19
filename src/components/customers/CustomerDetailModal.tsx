import React from 'react';
import { Customer, Task } from '../../types';
import { CustomerLTVCalculator } from './CustomerLTVCalculator';
import {
  X,
  Building2,
  CheckSquare,
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  tasks: Task[];
  onClose: () => void;
  currencySymbol?: string;
  onAddTaskForCustomer?: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  tasks,
  onClose,
  currencySymbol = '$',
  onAddTaskForCustomer,
}) => {
  if (!customer) return null;

  const linkedTasks = tasks.filter((t) => t.customerId === customer.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-y-auto p-6 text-zinc-900 dark:text-zinc-100 relative">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${customer.avatarColor || 'bg-rose-600'} text-white font-bold flex items-center justify-center text-lg shadow-md`}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {customer.name}
              </h3>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} /> {customer.company}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Account Info Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Account Status</p>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 capitalize mt-1">
              {customer.status}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Deal Value</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-white mt-1">
              {currencySymbol}{customer.dealValue.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Email Contact</p>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate mt-1">
              {customer.email}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Last Contact</p>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate mt-1">
              {new Date(customer.lastContactDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* LTV (Lifetime Value) Calculator & Sparkline Chart */}
        <CustomerLTVCalculator customer={customer} currencySymbol={currencySymbol} />

        {/* Account Notes */}
        {customer.notes && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 mb-6">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Account Context & Notes</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {customer.notes}
            </p>
          </div>
        )}

        {/* Linked Tasks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <CheckSquare size={15} className="text-rose-500" /> Linked Tasks ({linkedTasks.length})
            </h4>
            {onAddTaskForCustomer && (
              <button
                onClick={() => onAddTaskForCustomer(customer)}
                className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
              >
                + Add Task for {customer.name}
              </button>
            )}
          </div>

          {linkedTasks.length === 0 ? (
            <p className="text-xs text-zinc-500 italic p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              No tasks currently linked to this customer account.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white">{t.title}</span>
                    <span className="ml-2 text-[10px] uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {t.priority}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">Due: {t.dueDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

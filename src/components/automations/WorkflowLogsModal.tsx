import React, { useState, useEffect } from 'react';
import { WorkflowRun, WorkflowLog } from '../../types';
import { AutomationService } from '../../services/AutomationService';
import { X, Activity, CheckCircle2, AlertTriangle, Clock, Terminal } from 'lucide-react';

interface WorkflowLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  run: WorkflowRun | null;
}

export const WorkflowLogsModal: React.FC<WorkflowLogsModalProps> = ({ isOpen, onClose, run }) => {
  if (!isOpen || !run) return null;

  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    AutomationService.getLogsForRun(run.id).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, [run.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Workflow Execution Audit Log
            </h3>
            <p className="text-xs text-zinc-500">
              Run ID: <span className="font-mono text-rose-500">{run.id}</span>
            </p>
          </div>
        </div>

        {/* Overview Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 block">Workflow</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate block">
              {run.workflowName || run.workflowId}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 block">Status</span>
            <span
              className={`font-bold capitalize flex items-center gap-1 ${
                run.status === 'completed'
                  ? 'text-emerald-500'
                  : run.status === 'failed'
                  ? 'text-rose-500'
                  : 'text-amber-500'
              }`}
            >
              {run.status === 'completed' ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
              {run.status}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 block">Trigger Event</span>
            <span className="font-mono font-bold text-rose-500">{run.triggerEvent}</span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 block">Executed At</span>
            <span className="text-zinc-600 dark:text-zinc-400 font-mono">
              {new Date(run.startedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Payload Summary */}
        <div className="p-3 rounded-2xl bg-zinc-900 text-zinc-200 font-mono text-[11px] space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
            Payload Context:
          </span>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(run.triggerData, null, 2)}
          </pre>
        </div>

        {/* Step Logs */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Terminal size={14} className="text-rose-500" />
            Step-by-Step Execution Sequence
          </h4>

          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading execution steps...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              No step execution logs recorded for this run.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    log.logLevel === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : log.logLevel === 'warn'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span>LEVEL: {log.logLevel.toUpperCase()}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p>{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold text-zinc-800 dark:text-white cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

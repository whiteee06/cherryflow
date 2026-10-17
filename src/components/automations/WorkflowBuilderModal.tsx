import React, { useState } from 'react';
import {
  AutomationWorkflow,
  TriggerType,
  WorkflowStep,
  ConditionField,
  ConditionOperator,
  ActionType,
  StepKind,
} from '../../types';
import { AutomationService } from '../../services/AutomationService';
import {
  X,
  Zap,
  Plus,
  Trash2,
  Save,
  Sliders,
  Filter,
  Play,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  GitBranch,
} from 'lucide-react';

interface WorkflowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowToEdit?: AutomationWorkflow | null;
  workspaceId?: string;
  onSaved: () => void;
}

export const WorkflowBuilderModal: React.FC<WorkflowBuilderModalProps> = ({
  isOpen,
  onClose,
  workflowToEdit,
  workspaceId = 'ws_default_1',
  onSaved,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(workflowToEdit?.name || 'New Custom Workflow');
  const [description, setDescription] = useState(workflowToEdit?.description || '');
  const [isActive, setIsActive] = useState(workflowToEdit?.isActive ?? true);
  const [triggerType, setTriggerType] = useState<TriggerType>(
    workflowToEdit?.triggerType || 'customer_created'
  );

  const [steps, setSteps] = useState<WorkflowStep[]>(
    workflowToEdit?.steps || [
      {
        id: 'st_1',
        workflowId: workflowToEdit?.id || 'wf_new',
        stepOrder: 1,
        stepType: 'action',
        actionConfig: {
          actionType: 'send_notification',
          notificationMessage: 'Automated notification triggered.',
        },
      },
    ]
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleAddStep = (kind: StepKind) => {
    const newStep: WorkflowStep = {
      id: `st_${Date.now()}_${steps.length + 1}`,
      workflowId: workflowToEdit?.id || 'wf_new',
      stepOrder: steps.length + 1,
      stepType: kind,
      conditionConfig:
        kind === 'condition'
          ? { field: 'status', operator: 'equals', value: 'proposal' }
          : undefined,
      actionConfig:
        kind === 'action'
          ? {
              actionType: 'send_notification',
              notificationMessage: 'Automated workflow notification alert.',
            }
          : undefined,
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.map((s, idx) => ({ ...s, stepOrder: idx + 1 })));
  };

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const wfToSave: AutomationWorkflow = {
      id: workflowToEdit?.id || `wf_${Date.now()}`,
      workspaceId,
      name,
      description,
      isActive,
      triggerType,
      steps,
      runCount: workflowToEdit?.runCount || 0,
      createdAt: workflowToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await AutomationService.saveWorkflow(wfToSave);
    setIsSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Visual Workflow Automation Builder
            </h3>
            <p className="text-xs text-zinc-500">
              Configure event triggers, conditional logic filters, and sequential actions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveWorkflow} className="space-y-6">
          {/* Metadata Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Workflow Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Onboard New Customer Lead"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Active Status
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                }`}
              >
                {isActive ? '● Active Enabled' : '○ Paused'}
              </button>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this workflow automates..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* STEP 1: TRIGGER SELECTOR */}
          <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Event Trigger
              </h4>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                When this event happens in workspace:
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-bold"
              >
                <option value="customer_created">Customer Created (CRM Lead)</option>
                <option value="customer_updated">Customer Status / Pipeline Updated</option>
                <option value="task_created">Task Created</option>
                <option value="task_completed">Task Completed</option>
                <option value="task_overdue">Task Overdue</option>
                <option value="new_team_member">New Team Member Joined</option>
                <option value="invoice_paid">Subscription Invoice Paid</option>
                <option value="subscription_changed">Subscription Plan Changed</option>
                <option value="ai_request_finished">AI Copilot Request Completed</option>
                <option value="webhook_received">External Webhook Payload Received</option>
              </select>
            </div>
          </div>

          {/* CONNECTOR ARROW */}
          <div className="flex justify-center my-1">
            <ArrowDown size={18} className="text-zinc-400" />
          </div>

          {/* SEQUENTIAL STEPS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Workflow Actions & Conditions Logic
              </h4>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddStep('condition')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Filter size={12} /> + Condition Filter
                </button>
                <button
                  type="button"
                  onClick={() => handleAddStep('action')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Plus size={12} /> + Step Action
                </button>
              </div>
            </div>

            {steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 relative group space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 uppercase">
                      Step {index + 2}: {step.stepType}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="text-zinc-400 hover:text-rose-500 cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* CONDITION CONFIG */}
                  {step.stepType === 'condition' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500">Field</label>
                        <select
                          value={step.conditionConfig?.field || 'status'}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[index].conditionConfig = {
                              field: e.target.value as ConditionField,
                              operator: updated[index].conditionConfig?.operator || 'equals',
                              value: updated[index].conditionConfig?.value || '',
                            };
                            setSteps(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="status">Status</option>
                          <option value="priority">Priority</option>
                          <option value="customer_tag">Customer Tag</option>
                          <option value="user_role">User Role</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500">Operator</label>
                        <select
                          value={step.conditionConfig?.operator || 'equals'}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[index].conditionConfig = {
                              field: updated[index].conditionConfig?.field || 'status',
                              operator: e.target.value as ConditionOperator,
                              value: updated[index].conditionConfig?.value || '',
                            };
                            setSteps(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="is_not_empty">Is Not Empty</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500">Value</label>
                        <input
                          type="text"
                          value={step.conditionConfig?.value || ''}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[index].conditionConfig = {
                              field: updated[index].conditionConfig?.field || 'status',
                              operator: updated[index].conditionConfig?.operator || 'equals',
                              value: e.target.value,
                            };
                            setSteps(updated);
                          }}
                          placeholder="e.g. proposal"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* ACTION CONFIG */}
                  {step.stepType === 'action' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-1">
                          Action Type
                        </label>
                        <select
                          value={step.actionConfig?.actionType || 'send_notification'}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[index].actionConfig = {
                              ...updated[index].actionConfig,
                              actionType: e.target.value as ActionType,
                            };
                            setSteps(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-semibold"
                        >
                          <option value="send_notification">Send In-App Notification</option>
                          <option value="create_task">Create Follow-up Task</option>
                          <option value="create_note">Create Workspace Note</option>
                          <option value="generate_ai_summary">Generate AI Copilot Summary</option>
                        </select>
                      </div>

                      {step.actionConfig?.actionType === 'send_notification' && (
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 mb-1">
                            Notification Message Text
                          </label>
                          <input
                            type="text"
                            value={step.actionConfig?.notificationMessage || ''}
                            onChange={(e) => {
                              const updated = [...steps];
                              updated[index].actionConfig = {
                                ...updated[index].actionConfig!,
                                notificationMessage: e.target.value,
                              };
                              setSteps(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                          />
                        </div>
                      )}

                      {step.actionConfig?.actionType === 'create_task' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Task Title</label>
                            <input
                              type="text"
                              value={step.actionConfig?.taskTitle || ''}
                              onChange={(e) => {
                                const updated = [...steps];
                                updated[index].actionConfig = {
                                  ...updated[index].actionConfig!,
                                  taskTitle: e.target.value,
                                };
                                setSteps(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Task Priority</label>
                            <select
                              value={step.actionConfig?.taskPriority || 'medium'}
                              onChange={(e) => {
                                const updated = [...steps];
                                updated[index].actionConfig = {
                                  ...updated[index].actionConfig!,
                                  taskPriority: e.target.value as any,
                                };
                                setSteps(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="flex justify-center">
                    <ArrowDown size={14} className="text-zinc-300 dark:text-zinc-700" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Save size={14} />
              {isSaving ? 'Saving Workflow...' : 'Save & Enable Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  AutomationWorkflow,
  AutomationTemplate,
  WorkflowRun,
  WebhookEndpoint,
  TriggerType,
} from '../../types';
import {
  AutomationService,
  AUTOMATION_TEMPLATES,
} from '../../services/AutomationService';
import { WorkflowBuilderModal } from './WorkflowBuilderModal';
import { WorkflowLogsModal } from './WorkflowLogsModal';
import { NotificationService } from '../../services/NotificationService';
import {
  Zap,
  Play,
  Plus,
  Sliders,
  Activity,
  Webhook,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  UserPlus,
  FileText,
  Copy,
} from 'lucide-react';

interface AutomationsDashboardViewProps {
  onNotificationsUpdated?: () => void;
  workspaceId?: string;
}

export const AutomationsDashboardView: React.FC<AutomationsDashboardViewProps> = ({
  onNotificationsUpdated,
  workspaceId = 'ws_default_1',
}) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'webhooks' | 'runs'>('workflows');

  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AutomationWorkflow | null>(null);

  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  const [testingTrigger, setTestingTrigger] = useState<TriggerType | null>(null);
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);

  // New Webhook state
  const [newWhName, setNewWhName] = useState('');
  const [newWhUrl, setNewWhUrl] = useState('');

  const loadData = async () => {
    const wfList = await AutomationService.getWorkflows(workspaceId);
    setWorkflows(wfList);

    const runList = await AutomationService.getRuns(workspaceId);
    setRuns(runList);

    const whList = await AutomationService.getWebhooks(workspaceId);
    setWebhooks(whList);
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleToggleWorkflow = async (id: string) => {
    const updated = await AutomationService.toggleWorkflowActive(id, workspaceId);
    setWorkflows(updated);
  };

  const handleDeleteWorkflow = async (id: string) => {
    const updated = await AutomationService.deleteWorkflow(id, workspaceId);
    setWorkflows(updated);
  };

  const handleUseTemplate = async (template: AutomationTemplate) => {
    await AutomationService.createFromTemplate(template, workspaceId);
    await loadData();
    setActiveTab('workflows');
  };

  const handleTestTrigger = async (triggerType: TriggerType) => {
    setTestingTrigger(triggerType);
    setTestResultMsg(null);

    const dummyPayload = {
      customerName: 'Acumen Global Corp',
      dealValue: 120000,
      taskTitle: 'Conduct Priority Security Review',
      priority: 'high',
      status: 'proposal',
    };

    const res = await AutomationService.triggerWorkflows(triggerType, dummyPayload, workspaceId);

    if (onNotificationsUpdated) onNotificationsUpdated();
    await loadData();

    setTestingTrigger(null);
    setTestResultMsg(
      `Execution complete: Triggered ${res.triggeredCount} active workflow(s) successfully!`
    );
    setTimeout(() => setTestResultMsg(null), 4000);
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName || !newWhUrl) return;
    const updated = await AutomationService.createWebhook(workspaceId, {
      name: newWhName,
      endpointUrl: newWhUrl,
      events: ['customer_created', 'task_completed'],
    });
    setWebhooks(updated);
    setNewWhName('');
    setNewWhUrl('');
  };

  const handleDeleteWebhook = async (id: string) => {
    const updated = await AutomationService.deleteWebhook(id, workspaceId);
    setWebhooks(updated);
  };

  const totalRunsCount = workflows.reduce((acc, w) => acc + (w.runCount || 0), 0);
  const activeWfCount = workflows.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md">
              <Zap size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Workflow Automation Engine</h2>
          </div>
          <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
            Automate routine CRM lead routing, overdue task escalations, AI summary generation, and webhook event notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingWorkflow(null);
              setBuilderOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400">Active Workflows</p>
            <h4 className="text-xl font-black text-zinc-900 dark:text-white">
              {activeWfCount} / {workflows.length}
            </h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400">Total Executions</p>
            <h4 className="text-xl font-black text-zinc-900 dark:text-white">{totalRunsCount}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Webhook size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400">Webhooks Configured</p>
            <h4 className="text-xl font-black text-zinc-900 dark:text-white">{webhooks.length}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400">Automation Health</p>
            <h4 className="text-xl font-black text-emerald-500">100% Operational</h4>
          </div>
        </div>
      </div>

      {/* QUICK TRIGGER SIMULATION PLAYGROUND */}
      <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Instant Workflow Event Test Playground
            </h3>
          </div>
          {testResultMsg && (
            <span className="text-xs font-bold text-emerald-400 animate-pulse">
              {testResultMsg}
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400">
          Click any event below to dispatch a simulated trigger event and test active workflows in real time:
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { label: 'Customer Lead Created', type: 'customer_created' },
            { label: 'Customer Proposal Updated', type: 'customer_updated' },
            { label: 'Task Overdue Alert', type: 'task_overdue' },
            { label: 'Invoice Payment Received', type: 'invoice_paid' },
            { label: 'AI Request Completed', type: 'ai_request_finished' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleTestTrigger(item.type as TriggerType)}
              disabled={testingTrigger !== null}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-600 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-700"
            >
              <Play size={12} className="text-amber-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'workflows', label: 'Active Workflows', icon: Zap },
          { id: 'templates', label: 'Pre-built Templates', icon: Layers },
          { id: 'webhooks', label: 'Webhooks & Endpoints', icon: Webhook },
          { id: 'runs', label: 'Execution Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WORKFLOWS LIST */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        wf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                      }`}
                    />
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      {wf.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-mono font-bold">
                      Trigger: {wf.triggerType}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">{wf.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono pt-1">
                    <span>Steps: {wf.steps.length}</span>
                    <span>Total Runs: {wf.runCount || 0}</span>
                    <span>Updated: {new Date(wf.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleWorkflow(wf.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      wf.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {wf.isActive ? 'Active' : 'Paused'}
                  </button>

                  <button
                    onClick={() => handleTestTrigger(wf.triggerType)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    title="Test Run Trigger"
                  >
                    <Play size={14} />
                  </button>

                  <button
                    onClick={() => {
                      setEditingWorkflow(wf);
                      setBuilderOpen(true);
                    }}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    title="Edit Workflow"
                  >
                    <Sliders size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteWorkflow(wf.id)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-400 cursor-pointer"
                    title="Delete Workflow"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUTOMATION_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                    <Zap size={18} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold capitalize text-zinc-600 dark:text-zinc-400">
                    {tmpl.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{tmpl.name}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">
                  {tmpl.steps.length} preset step(s)
                </span>

                <button
                  onClick={() => handleUseTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>Use Template</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateWebhook}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4"
          >
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Webhook size={16} className="text-rose-500" /> Register External Webhook Endpoint
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Endpoint Name
                </label>
                <input
                  type="text"
                  required
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="e.g. Zapier / Make.com Lead Webhook"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  HTTPS Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={newWhUrl}
                  onChange={(e) => setNewWhUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/v1/work..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all"
              >
                + Register Webhook
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Active Workspace Webhooks
            </h4>
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-white">{wh.name}</h5>
                  <p className="text-xs font-mono text-zinc-400">{wh.endpointUrl}</p>
                  <p className="text-[10px] text-zinc-500">
                    Secret Key: <span className="font-mono text-rose-500">{wh.secretKey}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteWebhook(wh.id)}
                  className="p-2 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'runs' && (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              onClick={() => {
                setSelectedRun(run);
                setLogsModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    run.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  <Activity size={18} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {run.workflowName || run.workflowId}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Trigger: <span className="text-rose-500">{run.triggerEvent}</span> | Run ID: {run.id}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold capitalize text-emerald-500 block">
                  {run.status}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {new Date(run.startedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <WorkflowBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        workflowToEdit={editingWorkflow}
        workspaceId={workspaceId}
        onSaved={loadData}
      />

      <WorkflowLogsModal
        isOpen={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        run={selectedRun}
      />
    </div>
  );
};

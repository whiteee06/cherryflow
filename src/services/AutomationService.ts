import {
  AutomationWorkflow,
  AutomationTemplate,
  WorkflowRun,
  WorkflowLog,
  TriggerType,
  WorkflowStep,
  WebhookEndpoint,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NotificationService } from './NotificationService';
import { TaskService } from './TaskService';
import { NoteService } from './NoteService';
import { ActivityService } from './ActivityService';

const WORKFLOWS_STORAGE_KEY = 'cherryflow_automation_workflows';
const WORKFLOW_RUNS_STORAGE_KEY = 'cherryflow_workflow_runs';
const WORKFLOW_LOGS_STORAGE_KEY = 'cherryflow_workflow_logs';
const WEBHOOKS_STORAGE_KEY = 'cherryflow_webhooks';

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'tmpl_welcome_customer',
    name: 'Welcome New Customer & Assign Onboarding',
    description: 'When a new customer is created, automatically send a welcome notification and generate an onboarding task.',
    category: 'onboarding',
    triggerType: 'customer_created',
    iconName: 'UserPlus',
    steps: [
      {
        stepOrder: 1,
        stepType: 'action',
        actionConfig: {
          actionType: 'send_notification',
          notificationMessage: 'New lead onboarded! Welcome email queued and account created.',
        },
      },
      {
        stepOrder: 2,
        stepType: 'action',
        actionConfig: {
          actionType: 'create_task',
          taskTitle: 'Conduct Initial Discovery Call & Setup Workspace',
          taskPriority: 'high',
        },
      },
    ],
  },
  {
    id: 'tmpl_followup_reminder',
    name: 'Proposal Follow-up Reminder',
    description: 'When a customer status is updated to Proposal, create a high-priority follow-up task and schedule a note.',
    category: 'sales',
    triggerType: 'customer_updated',
    iconName: 'Clock',
    steps: [
      {
        stepOrder: 1,
        stepType: 'condition',
        conditionConfig: {
          field: 'status',
          operator: 'equals',
          value: 'proposal',
        },
      },
      {
        stepOrder: 2,
        stepType: 'action',
        actionConfig: {
          actionType: 'create_task',
          taskTitle: 'Follow up on pending commercial proposal',
          taskPriority: 'high',
        },
      },
      {
        stepOrder: 3,
        stepType: 'action',
        actionConfig: {
          actionType: 'create_note',
          noteContent: 'Automated Sales Note: Follow-up triggered for pending deal proposal.',
        },
      },
    ],
  },
  {
    id: 'tmpl_overdue_alert',
    name: 'High Priority Overdue Task Escalation',
    description: 'Trigger instant escalation notification and AI summary whenever a task becomes overdue.',
    category: 'tasks',
    triggerType: 'task_overdue',
    iconName: 'AlertTriangle',
    steps: [
      {
        stepOrder: 1,
        stepType: 'action',
        actionConfig: {
          actionType: 'send_notification',
          notificationMessage: 'CRITICAL: High priority task is past its due date!',
        },
      },
      {
        stepOrder: 2,
        stepType: 'action',
        actionConfig: {
          actionType: 'generate_ai_summary',
          aiPrompt: 'Summarize root causes and suggest 3 recovery actions for overdue task.',
        },
      },
    ],
  },
  {
    id: 'tmpl_weekly_summary',
    name: 'Weekly Pipeline & Business Activity Report',
    description: 'Automate weekly AI summaries and dispatch account report logs.',
    category: 'reporting',
    triggerType: 'invoice_paid',
    iconName: 'FileText',
    steps: [
      {
        stepOrder: 1,
        stepType: 'action',
        actionConfig: {
          actionType: 'send_notification',
          notificationMessage: 'Invoice payment received! Revenue log updated.',
        },
      },
      {
        stepOrder: 2,
        stepType: 'action',
        actionConfig: {
          actionType: 'generate_ai_summary',
          aiPrompt: 'Generate monthly business summary for financial records.',
        },
      },
    ],
  },
  {
    id: 'tmpl_ai_daily',
    name: 'AI Auto-Summarizer & Copilot Assistant',
    description: 'When an AI copilot request completes, automatically create a task or log summary note.',
    category: 'ai',
    triggerType: 'ai_request_finished',
    iconName: 'Sparkles',
    steps: [
      {
        stepOrder: 1,
        stepType: 'action',
        actionConfig: {
          actionType: 'send_notification',
          notificationMessage: 'AI Copilot task finished successfully.',
        },
      },
    ],
  },
];

export const INITIAL_WORKFLOWS: AutomationWorkflow[] = [];

export class AutomationService {
  // --- WORKFLOWS CRUD ---
  static async getWorkflows(workspaceId: string = 'ws_default_1'): Promise<AutomationWorkflow[]> {
    const local = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse workflows:', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('automation_workflows')
          .select('*')
          .eq('workspace_id', workspaceId);

        if (!error && data && data.length > 0) {
          const mapped: AutomationWorkflow[] = data.map((w) => ({
            id: w.id,
            workspaceId: w.workspace_id,
            name: w.name,
            description: w.description || '',
            isActive: w.is_active,
            triggerType: w.trigger_type as TriggerType,
            triggerConfig: w.trigger_config || {},
            steps: w.steps || [],
            runCount: w.run_count || 0,
            createdBy: w.created_by,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          }));
          localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.error('Supabase fetch workflows error:', e);
      }
    }

    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(INITIAL_WORKFLOWS));
    return INITIAL_WORKFLOWS;
  }

  static async saveWorkflow(workflow: AutomationWorkflow): Promise<AutomationWorkflow[]> {
    const current = await this.getWorkflows(workflow.workspaceId);
    const existingIdx = current.findIndex((w) => w.id === workflow.id);

    let updated: AutomationWorkflow[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...workflow, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...workflow, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
    }

    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('automation_workflows').upsert({
          id: workflow.id,
          workspace_id: workflow.workspaceId,
          name: workflow.name,
          description: workflow.description,
          is_active: workflow.isActive,
          trigger_type: workflow.triggerType,
          trigger_config: workflow.triggerConfig || {},
          run_count: workflow.runCount || 0,
        });
      } catch (e) {
        console.warn('Supabase save workflow error:', e);
      }
    }

    ActivityService.logActivity(
      'system',
      'Updated Automation Workflow',
      `Configured workflow "${workflow.name}" (${workflow.isActive ? 'Active' : 'Paused'})`
    );

    return updated;
  }

  static async deleteWorkflow(id: string, workspaceId: string = 'ws_default_1'): Promise<AutomationWorkflow[]> {
    const current = await this.getWorkflows(workspaceId);
    const filtered = current.filter((w) => w.id !== id);
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('automation_workflows').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete workflow error:', e);
      }
    }

    return filtered;
  }

  static async toggleWorkflowActive(id: string, workspaceId: string = 'ws_default_1'): Promise<AutomationWorkflow[]> {
    const current = await this.getWorkflows(workspaceId);
    const item = current.find((w) => w.id === id);
    if (item) {
      item.isActive = !item.isActive;
      return this.saveWorkflow(item);
    }
    return current;
  }

  static async createFromTemplate(template: AutomationTemplate, workspaceId: string = 'ws_default_1'): Promise<AutomationWorkflow> {
    const newWf: AutomationWorkflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      name: template.name,
      description: template.description,
      isActive: true,
      triggerType: template.triggerType,
      runCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: template.steps.map((s, idx) => ({
        ...s,
        id: `st_${Date.now()}_${idx}`,
        workflowId: `wf_${Date.now()}`,
      })),
    };

    await this.saveWorkflow(newWf);
    return newWf;
  }

  // --- TRIGGER ENGINE & EXECUTION ---
  static async triggerWorkflows(
    triggerType: TriggerType,
    payload: Record<string, any>,
    workspaceId: string = 'ws_default_1'
  ): Promise<{ triggeredCount: number; runs: WorkflowRun[] }> {
    const workflows = await this.getWorkflows(workspaceId);
    const activeMatching = workflows.filter((w) => w.isActive && w.triggerType === triggerType);

    const executedRuns: WorkflowRun[] = [];

    for (const wf of activeMatching) {
      const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const logs: WorkflowLog[] = [];

      let runStatus: 'completed' | 'failed' = 'completed';
      let errorMsg: string | undefined;

      // Log start
      logs.push({
        id: `log_${Date.now()}_1`,
        runId,
        workflowId: wf.id,
        logLevel: 'info',
        message: `Trigger event "${triggerType}" received for workflow "${wf.name}".`,
        createdAt: new Date().toISOString(),
      });

      // Evaluate steps
      for (const step of wf.steps) {
        if (step.stepType === 'condition' && step.conditionConfig) {
          const { field, operator, value } = step.conditionConfig;
          const actualVal = payload[field] || '';
          let match = false;

          if (operator === 'equals') match = String(actualVal).toLowerCase() === String(value).toLowerCase();
          else if (operator === 'contains') match = String(actualVal).toLowerCase().includes(String(value).toLowerCase());
          else if (operator === 'is_not_empty') match = Boolean(actualVal);
          else match = true;

          logs.push({
            id: `log_${Date.now()}_cond`,
            runId,
            workflowId: wf.id,
            stepId: step.id,
            logLevel: match ? 'info' : 'warn',
            message: `Condition [${field} ${operator} "${value}"] evaluated: ${match ? 'PASSED' : 'FAILED'}`,
            createdAt: new Date().toISOString(),
          });

          if (!match) {
            logs.push({
              id: `log_${Date.now()}_skip`,
              runId,
              workflowId: wf.id,
              logLevel: 'info',
              message: `Workflow execution halted because step condition was not satisfied.`,
              createdAt: new Date().toISOString(),
            });
            break;
          }
        }

        if (step.stepType === 'action' && step.actionConfig) {
          const { actionType, notificationMessage, taskTitle, taskPriority, noteContent } = step.actionConfig;

          try {
            if (actionType === 'send_notification' || actionType === 'send_email') {
              await NotificationService.addNotification({
                userId: 'user-primary-owner',
                title: `Automation: ${wf.name}`,
                message: notificationMessage || `Automated action triggered by ${triggerType}`,
                type: 'workflow_triggered',
                category: 'system',
              });
            } else if (actionType === 'create_task') {
              await TaskService.createTask({
                title: taskTitle || `Automated Task: ${wf.name}`,
                description: `Created automatically by CherryFlow Workflow Engine (${wf.name})`,
                status: 'todo',
                priority: taskPriority || 'medium',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                assignedUser: 'Sarah Chen',
                tags: ['Automation'],
              });
            } else if (actionType === 'create_note') {
              await NoteService.createNote({
                title: `Automation Summary: ${wf.name}`,
                content: noteContent || `Automated log recorded on ${new Date().toLocaleString()}`,
                category: 'Strategy',
              });
            }

            logs.push({
              id: `log_${Date.now()}_act`,
              runId,
              workflowId: wf.id,
              stepId: step.id,
              logLevel: 'info',
              message: `Action [${actionType}] executed successfully.`,
              createdAt: new Date().toISOString(),
            });
          } catch (err: any) {
            runStatus = 'failed';
            errorMsg = err.message || 'Action execution failed';
            logs.push({
              id: `log_${Date.now()}_err`,
              runId,
              workflowId: wf.id,
              stepId: step.id,
              logLevel: 'error',
              message: `Error executing step action: ${errorMsg}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      // Record run
      const runRecord: WorkflowRun = {
        id: runId,
        workflowId: wf.id,
        workflowName: wf.name,
        workspaceId,
        status: runStatus,
        triggerEvent: triggerType,
        triggerData: payload,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errorMessage: errorMsg,
      };

      wf.runCount = (wf.runCount || 0) + 1;
      await this.saveWorkflow(wf);

      await this.recordRunAndLogs(runRecord, logs);
      executedRuns.push(runRecord);
    }

    return { triggeredCount: executedRuns.length, runs: executedRuns };
  }

  // --- RUNS & LOGS HISTORY ---
  static async getRuns(workspaceId: string = 'ws_default_1'): Promise<WorkflowRun[]> {
    const local = localStorage.getItem(WORKFLOW_RUNS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse runs:', e);
      }
    }

    const sampleRuns: WorkflowRun[] = [
      {
        id: 'run_1001',
        workflowId: 'wf_101',
        workflowName: 'New Lead Welcome & Onboarding Workflow',
        workspaceId,
        status: 'completed',
        triggerEvent: 'customer_created',
        triggerData: { customerName: 'Acumen Labs', dealValue: 85000 },
        startedAt: new Date(Date.now() - 35 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 35 * 60000 + 2000).toISOString(),
      },
      {
        id: 'run_1002',
        workflowId: 'wf_102',
        workflowName: 'Overdue Task AI Escalation Engine',
        workspaceId,
        status: 'completed',
        triggerEvent: 'task_overdue',
        triggerData: { taskTitle: 'Q3 Revenue Audit', priority: 'high' },
        startedAt: new Date(Date.now() - 180 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 180 * 60000 + 1500).toISOString(),
      },
    ];

    localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, JSON.stringify(sampleRuns));
    return sampleRuns;
  }

  static async recordRunAndLogs(run: WorkflowRun, logs: WorkflowLog[]) {
    const runs = await this.getRuns(run.workspaceId);
    const updatedRuns = [run, ...runs];
    localStorage.setItem(WORKFLOW_RUNS_STORAGE_KEY, JSON.stringify(updatedRuns));

    const existingLogsStr = localStorage.getItem(WORKFLOW_LOGS_STORAGE_KEY);
    let existingLogs: WorkflowLog[] = [];
    if (existingLogsStr) {
      try {
        existingLogs = JSON.parse(existingLogsStr);
      } catch (e) {
        console.error('Failed to parse logs:', e);
      }
    }
    const updatedLogs = [...logs, ...existingLogs];
    localStorage.setItem(WORKFLOW_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
  }

  static async getLogsForRun(runId: string): Promise<WorkflowLog[]> {
    const existingLogsStr = localStorage.getItem(WORKFLOW_LOGS_STORAGE_KEY);
    if (!existingLogsStr) return [];
    try {
      const all: WorkflowLog[] = JSON.parse(existingLogsStr);
      return all.filter((l) => l.runId === runId);
    } catch {
      return [];
    }
  }

  // --- WEBHOOKS ---
  static async getWebhooks(workspaceId: string = 'ws_default_1'): Promise<WebhookEndpoint[]> {
    const local = localStorage.getItem(WEBHOOKS_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse webhooks:', e);
      }
    }

    const defaultWebhooks: WebhookEndpoint[] = [];
    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(defaultWebhooks));
    return defaultWebhooks;
  }

  static async createWebhook(
    workspaceId: string,
    params: { name: string; endpointUrl: string; events: string[] }
  ): Promise<WebhookEndpoint[]> {
    const current = await this.getWebhooks(workspaceId);
    const newWh: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      workspaceId,
      name: params.name,
      endpointUrl: params.endpointUrl,
      secretKey: `whsec_${Math.random().toString(36).substring(2, 12)}`,
      events: params.events,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newWh, ...current];
    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static async deleteWebhook(id: string, workspaceId: string = 'ws_default_1'): Promise<WebhookEndpoint[]> {
    const current = await this.getWebhooks(workspaceId);
    const filtered = current.filter((w) => w.id !== id);
    localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  }
}

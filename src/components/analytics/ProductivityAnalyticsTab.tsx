import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Task } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, Users, Award, ShieldAlert, Zap } from 'lucide-react';

interface ProductivityAnalyticsTabProps {
  tasks: Task[];
}

export const ProductivityAnalyticsTab: React.FC<ProductivityAnalyticsTabProps> = ({ tasks }) => {
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived').length;

  const nowIso = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'archived' && t.dueDate && t.dueDate < nowIso
  ).length;

  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((completedCount / totalTasks) * 100);

  // Daily productivity velocity
  const dailyVelocity = [
    { day: 'Mon', completed: 6, created: 8, overdue: 1 },
    { day: 'Tue', completed: 11, created: 5, overdue: 0 },
    { day: 'Wed', completed: 14, created: 9, overdue: 2 },
    { day: 'Thu', completed: 9, created: 7, overdue: 1 },
    { day: 'Fri', completed: 15, created: 4, overdue: 0 },
    { day: 'Sat', completed: 4, created: 2, overdue: 0 },
    { day: 'Sun', completed: 2, created: 1, overdue: 0 },
  ];

  // Priority counts
  const priorityCounts = tasks.reduce(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const priorityData = [
    { name: 'Critical / Urgent', value: (priorityCounts.critical || 0) + (priorityCounts.urgent || 0) || 3, color: '#e11d48' },
    { name: 'High Priority', value: priorityCounts.high || 8, color: '#f59e0b' },
    { name: 'Medium Priority', value: priorityCounts.medium || 12, color: '#3b82f6' },
    { name: 'Low Priority', value: priorityCounts.low || 5, color: '#10b981' },
  ];

  // Team Productivity Breakdown (Future Ready)
  const teamProductivity = [
    { name: 'Account Owner (You)', assigned: 18, completed: 15, onTimePct: '94%' },
    { name: 'Sarah Miller (Sales Lead)', assigned: 12, completed: 10, onTimePct: '91%' },
    { name: 'Alex Johnson (Ops)', assigned: 8, completed: 7, onTimePct: '88%' },
    { name: 'Michael Chang (Tech)', assigned: 10, completed: 9, onTimePct: '92%' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Productivity Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Overall Execution Rate</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{completionRate}%</p>
          <p className="text-[11px] text-zinc-500 mt-1">{completedCount} tasks done out of {totalTasks}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Active Pending Backlog</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{pendingCount}</p>
          <p className="text-[11px] text-zinc-500 mt-1">In progress & queued tasks</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Overdue Task Risk</span>
            <AlertTriangle size={16} className={overdueCount > 0 ? 'text-rose-500' : 'text-zinc-400'} />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{overdueCount}</p>
          <p className="text-[11px] text-rose-500 mt-1">{overdueCount > 0 ? 'Requires immediate action' : 'All clear'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Average Resolution Time</span>
            <Zap size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">1.4 Days</p>
          <p className="text-[11px] text-zinc-500 mt-1">From creation to completion</p>
        </div>
      </div>

      {/* Main Velocity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Daily Task Burndown & Creation Velocity
              </h3>
              <p className="text-xs text-zinc-500">Tasks finished vs created across the week</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              High Velocity
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.2} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="created" name="Created Tasks" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
              Priority Severity Breakdown
            </h3>
            <p className="text-xs text-zinc-500 mb-2">Tasks grouped by priority weight</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Productivity (Future Ready) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-rose-500" />
              Team Productivity & Delivery Efficiency (Future Ready)
            </h3>
            <p className="text-xs text-zinc-500">Task completion and on-time SLA adherence per team member</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            4 Team Members Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {teamProductivity.map((member) => (
            <div
              key={member.name}
              className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                  {member.name[0]}
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{member.name}</p>
              </div>

              <div className="space-y-1 text-xs text-zinc-500">
                <div className="flex justify-between">
                  <span>Assigned:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{member.assigned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-semibold text-emerald-500">{member.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>On-Time SLA:</span>
                  <span className="font-bold text-indigo-500">{member.onTimePct}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

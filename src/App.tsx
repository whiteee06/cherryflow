/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CherryFlowLogo } from './components/common/CherryFlowLogo';
import {
  UserProfile,
  Customer,
  CustomerTimelineEvent,
  Task,
  TaskStatus,
  Note,
  ActivityLog,
  ViewTab,
  ThemeMode,
} from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadCustomers,
  saveCustomers,
  loadTasks,
  saveTasks,
  loadNotes,
  saveNotes,
  loadActivities,
  saveActivities,
  addActivityLog,
  getBusinessMetrics,
  resetToDemoData,
} from './lib/storage';

import { CustomerService } from './services/CustomerService';
import { TaskService } from './services/TaskService';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';

// Auth Provider & Pages
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './features/auth/AuthPage';

// Dashboard components
import { OverviewCards } from './components/dashboard/OverviewCards';
import { OnboardingCard } from './components/dashboard/OnboardingCard';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { QuickActions } from './components/dashboard/QuickActions';
import { ScheduleWidget } from './components/dashboard/ScheduleWidget';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { TeamCollaborationView } from './components/team/TeamCollaborationView';
import { BillingDashboardView } from './components/billing/BillingDashboardView';
import { AutomationsDashboardView } from './components/automations/AutomationsDashboardView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { NotificationPreferencesModal } from './components/notifications/NotificationPreferencesModal';
import { NotificationService } from './services/NotificationService';
import { AppNotification } from './types';
import { GlobalSearchModal } from './components/dashboard/GlobalSearchModal';
import { NotificationItem } from './components/dashboard/NotificationDropdown';

// CRM components
import { CustomerList } from './components/customers/CustomerList';
import { CustomerModal } from './components/customers/CustomerModal';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal';

// Task components
import { TaskManager } from './components/tasks/TaskManager';
import { TaskModal } from './components/tasks/TaskModal';

// Note components
import { NotesManager } from './components/notes/NotesManager';
import { NoteModal } from './components/notes/NoteModal';

// AI Copilot & Settings
import { AICopilotDrawer } from './components/ai/AICopilotDrawer';
import { AIBusinessAssistant } from './components/copilot/AIBusinessAssistant';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { LandingPageView } from './components/landing/LandingPageView';
import { AboutPage } from './components/about/AboutPage';
import { FeedbackView } from './components/feedback/FeedbackView';
import { Footer } from './components/common/Footer';
import { SuperAdminLayout } from './components/admin/SuperAdminLayout';
import { UnauthorizedAccess } from './components/admin/UnauthorizedAccess';
import { SuperAdminService } from './services/superAdminService';

import { Cherry, LogOut, HelpCircle, Sparkles, User as UserIcon, ShieldCheck } from 'lucide-react';

function OperatingSystemContent() {
  const {
    user: authUser,
    logout,
    screen,
    setScreen,
    isAuthenticated,
    switchUserRole,
  } = useAuth();

  // Active theme
  const [theme, setTheme] = useState<ThemeMode>(() => authUser?.theme || 'dark');

  // Active User profile
  const [user, setUser] = useState<UserProfile>(() => {
    if (SuperAdminService.isSuperAdminLoggedIn()) {
      return {
        id: 'sa_01_cherry_06',
        name: 'Developer (cherry_06)',
        email: 'cherry_06@cherryflow.io',
        businessName: 'CherryFlow Developer Root Control',
        role: 'super_admin',
        currency: '$',
        theme: 'dark',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
    }
    return (
      authUser || {
        id: 'usr_owner',
        name: 'Alex Rivera',
        email: 'alex@cherryflow.io',
        businessName: 'Apex Growth Agency',
        role: 'owner',
        currency: '$',
        theme: 'dark',
        createdAt: new Date().toISOString(),
      }
    );
  });

  // Sync user with Super Admin session if logged in as developer
  useEffect(() => {
    if (SuperAdminService.isSuperAdminLoggedIn()) {
      setUser((prev) => {
        if (prev?.role === 'super_admin') return prev;
        return {
          id: 'sa_01_cherry_06',
          name: 'Developer (cherry_06)',
          email: 'cherry_06@cherryflow.io',
          businessName: 'CherryFlow Developer Root Control',
          role: 'super_admin',
          currency: '$',
          theme: prev?.theme || 'dark',
          createdAt: '2026-01-01T00:00:00.000Z',
        };
      });
      setCurrentTab('admin');
    }
  }, [screen]);

  // Tab & Search state
  const [currentTab, setCurrentTab] = useState<ViewTab>(() =>
    SuperAdminService.isSuperAdminLoggedIn() ? 'admin' : 'dashboard'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);

  // Notifications State
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isNotifPrefsOpen, setIsNotifPrefsOpen] = useState(false);

  const reloadNotifications = async () => {
    const notifs = await NotificationService.getNotifications();
    setAppNotifications(notifs);
  };

  useEffect(() => {
    reloadNotifications();
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'High Priority Task Due',
      message: 'Prepare Q3 Growth Strategy Proposal is due today.',
      time: '10m ago',
      type: 'task',
      read: false,
    },
    {
      id: 'n2',
      title: 'New Lead Registered',
      message: 'Acme Corp was added to customer pipeline.',
      time: '1h ago',
      type: 'customer',
      read: false,
    },
    {
      id: 'n3',
      title: 'Cherry AI Audit Ready',
      message: 'Monthly MRR health report generated successfully.',
      time: '2h ago',
      type: 'ai',
      read: true,
    },
  ]);

  // Core Collections state
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [activities, setActivities] = useState<ActivityLog[]>(loadActivities);

  // Modal Visibility States
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Customer Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<Customer | null>(null);

  // Task Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Note Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Keep user sync & load async data
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
    const loadInitialTasks = async () => {
      try {
        const fetched = await TaskService.getTasks({ includeArchived: true });
        setTasks(fetched);
      } catch (err) {
        console.warn('Could not fetch tasks:', err);
      }
    };
    loadInitialTasks();
  }, [authUser]);

  // Sync Theme to HTML Root Element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // If on landing, login, register, forgot/reset password or setup guide screens -> render AuthPage
  if (screen !== 'app' || !isAuthenticated) {
    return <AuthPage />;
  }

  // --- NOTIFICATION ACTIONS ---
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // --- CUSTOMER ACTIONS ---
  const handleSaveCustomer = async (custData: Partial<Customer>) => {
    try {
      let updatedCust: Customer;
      if (editingCustomer && editingCustomer.id) {
        updatedCust = await CustomerService.updateCustomer(editingCustomer.id, custData);
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? updatedCust : c)));
      } else {
        updatedCust = await CustomerService.createCustomer(custData as any);
        setCustomers((prev) => [updatedCust, ...prev]);
      }
      setActivities(loadActivities());
    } catch (err) {
      console.error('Error saving customer:', err);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await CustomerService.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setActivities(loadActivities());
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const handleArchiveCustomer = async (id: string) => {
    try {
      const updated = await CustomerService.archiveCustomer(id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error('Error archiving customer:', err);
    }
  };

  const handleRestoreCustomer = async (id: string) => {
    try {
      const updated = await CustomerService.restoreCustomer(id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error('Error restoring customer:', err);
    }
  };

  const handleToggleFavoriteCustomer = async (id: string) => {
    try {
      const updated = await CustomerService.toggleFavorite(id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleBulkDeleteCustomers = async (ids: string[]) => {
    try {
      await CustomerService.bulkDeleteCustomers(ids);
      setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
      setActivities(loadActivities());
    } catch (err) {
      console.error('Error bulk deleting customers:', err);
    }
  };

  const handleBulkArchiveCustomers = async (ids: string[]) => {
    try {
      await CustomerService.bulkArchiveCustomers(ids);
      setCustomers((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c))
      );
    } catch (err) {
      console.error('Error bulk archiving customers:', err);
    }
  };

  const handleImportCustomers = async (importedList: Partial<Customer>[]) => {
    try {
      await CustomerService.importCustomers(importedList);
      const queryResult = await CustomerService.getCustomers({ page: 1, pageSize: 100 });
      setCustomers(queryResult.customers);
      setActivities(loadActivities());
    } catch (err) {
      console.error('Error importing customers:', err);
    }
  };

  const handleAddCustomerNote = (customerId: string, noteText: string) => {
    const nowIso = new Date().toISOString();
    const newEvent: CustomerTimelineEvent = {
      id: `tl_${Date.now()}`,
      customerId,
      eventType: 'note',
      title: 'Interaction Logged',
      description: noteText,
      createdAt: nowIso,
      author: user.name || 'Owner',
    };

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [newEvent, ...(c.timeline || [])];
          return { ...c, timeline: updatedTimeline, lastContactDate: nowIso.split('T')[0] };
        }
        return c;
      })
    );
  };

  // --- TASK ACTIONS ---
  const handleSaveTask = (taskData: Partial<Task>) => {
    let updated: Task[];
    if (taskData.id) {
      updated = tasks.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t));
      addActivityLog('task', 'Updated Business Task', `Modified "${taskData.title}".`);
    } else {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        customerId: taskData.customerId,
        customerName: taskData.customerName,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || ['Task'],
        createdAt: new Date().toISOString(),
      };
      updated = [newTask, ...tasks];
      addActivityLog('task', 'Created Task', `Added task "${newTask.title}".`);
    }

    setTasks(updated);
    saveTasks(updated);
    setActivities(loadActivities());
  };

  const handleDeleteTask = (id: string) => {
    const t = tasks.find((tk) => tk.id === id);
    const updated = tasks.filter((tk) => tk.id !== id);
    setTasks(updated);
    saveTasks(updated);
    if (t) {
      addActivityLog('task', 'Deleted Task', `Removed task "${t.title}".`);
      setActivities(loadActivities());
    }
  };

  const handleToggleTaskStatus = (id: string) => {
    const updated: Task[] = tasks.map((t) => {
      if (t.id === id) {
        const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubs = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubs };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  // --- NOTE ACTIONS ---
  const handleSaveNote = (noteData: Partial<Note>) => {
    let updated: Note[];
    if (noteData.id) {
      updated = notes.map((n) => (n.id === noteData.id ? ({ ...n, ...noteData } as Note) : n));
      addActivityLog('note', 'Updated Strategy Note', `Edited note "${noteData.title}".`);
    } else {
      const newNote: Note = {
        id: `note_${Date.now()}`,
        title: noteData.title || 'Untitled Strategy Note',
        content: noteData.content || '',
        category: noteData.category || 'Strategy',
        pinned: noteData.pinned || false,
        tags: noteData.tags || ['Note'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiSummary: noteData.aiSummary,
      };
      updated = [newNote, ...notes];
      addActivityLog('note', 'Created Strategy Note', `Logged note "${newNote.title}".`);
    }

    setNotes(updated);
    saveNotes(updated);
    setActivities(loadActivities());
  };

  const handleDeleteNote = (id: string) => {
    const n = notes.find((nt) => nt.id === id);
    const updated = notes.filter((nt) => nt.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (n) {
      addActivityLog('note', 'Deleted Note', `Removed note "${n.title}".`);
      setActivities(loadActivities());
    }
  };

  const handleToggleNotePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
    setNotes(updated);
    saveNotes(updated);
  };

  const handleSummarizeNote = (noteToSummarize: Note) => {
    setEditingNote(noteToSummarize);
    setIsNoteModalOpen(true);
  };

  // --- DATA MANAGEMENT ---
  const handleResetDemoData = () => {
    resetToDemoData();
    setUser(loadUserProfile());
    setCustomers(loadCustomers());
    setTasks(loadTasks());
    setNotes(loadNotes());
    setActivities(loadActivities());
  };

  const handleExportBackup = () => {
    const backupData = {
      user,
      customers,
      tasks,
      notes,
      activities,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cherryflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const overviewMetrics = getBusinessMetrics(customers, tasks, notes);
  const pendingTaskCount = tasks.filter((t) => t.status !== 'completed').length;

  if (currentTab === 'landing') {
    return (
      <LandingPageView
        onLaunchApp={() => setCurrentTab('dashboard')}
        theme={theme}
        onToggleTheme={() => {
          const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
          setTheme(nextTheme);
          const updatedUser: UserProfile = { ...user, theme: nextTheme };
          setUser(updatedUser);
          saveUserProfile(updatedUser);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans transition-colors selection:bg-rose-500 selection:text-white pb-16 lg:pb-0">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        customerCount={customers.length}
        pendingTaskCount={pendingTaskCount}
        noteCount={notes.length}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        onSignOut={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar with Auth Session Info */}
        <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <CherryFlowLogo size="sm" showSubtitle={false} />

            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>User Session: <strong className="text-white">{user.email}</strong></span>
              <span>•</span>
              <span className="capitalize text-rose-300 font-medium">[{user.role}]</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher for RBAC testing */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Role:</span>
              <select
                value={user.role}
                onChange={(e) => switchUserRole(e.target.value as any)}
                className="bg-transparent text-xs text-rose-400 font-medium focus:outline-none cursor-pointer"
              >
                <option value="owner" className="bg-slate-900 text-slate-200">Owner (Full)</option>
                <option value="admin" className="bg-slate-900 text-slate-200">Admin</option>
                <option value="member" className="bg-slate-900 text-slate-200">Member</option>
              </select>
            </div>

            <button
              onClick={() => setScreen('setup_guide')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Integration Guide</span>
            </button>

            <button
              onClick={logout}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navbar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          theme={theme}
          setTheme={(newTheme) => {
            setTheme(newTheme);
            const updatedUser = { ...user, theme: newTheme };
            setUser(updatedUser);
            saveUserProfile(updatedUser);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onOpenAICopilot={() => setIsAICopilotOpen(true)}
          onOpenAddCustomer={() => {
            setEditingCustomer(null);
            setIsCustomerModalOpen(true);
          }}
          onOpenAddTask={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onOpenAddNote={() => {
            setEditingNote(null);
            setIsNoteModalOpen(true);
          }}
          onSignOut={logout}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onClearNotification={handleClearNotification}
          onOpenNotificationDrawer={() => setIsNotifDrawerOpen(true)}
          unreadNotificationCount={appNotifications.filter((n) => !n.read).length}
        />

        {/* View Router Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Developer Root Control Bar */}
          {SuperAdminService.isSuperAdminLoggedIn() && !impersonatedUser && (
            <div className="p-3 px-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-zinc-900 to-rose-950/80 border border-rose-500/30 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/30 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DEVELOPER ROOT ACTIVE
                </span>
                <span className="text-xs text-zinc-300 font-medium">
                  Super Admin: <strong className="text-white font-mono">{SuperAdminService.getSession()?.username || 'cherry_06'}</strong> • Full unconstrained developer control across all workspaces &amp; settings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                  }`}
                >
                  Super Admin Console
                </button>
                <button
                  onClick={() => {
                    SuperAdminService.logout();
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Impersonation Warning Banner */}
          {impersonatedUser && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in shadow-md">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase animate-pulse">
                  Impersonating
                </span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    Currently Impersonating Account: {impersonatedUser.name} ({impersonatedUser.email})
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Workspace: {impersonatedUser.businessName || 'Customer Workspace'} • All admin actions are audit-logged.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setImpersonatedUser(null);
                  setCurrentTab('admin');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
              >
                Exit Impersonation &amp; Return to Super Admin
              </button>
            </div>
          )}
          {/* DASHBOARD TAB */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Welcome Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-rose-950 text-white border border-rose-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                      CherryFlow
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Today's Business Summary
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Welcome back, {user.name} 👋
                  </h1>
                  <p className="text-xs text-zinc-300 mt-1">
                    Active workspace: <span className="font-semibold text-white">{user.businessName}</span> ({user.role.toUpperCase()} Role).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAICopilotOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Copilot Audit</span>
                  </button>
                </div>
              </div>

              {/* Workspace Onboarding Checklist */}
              <OnboardingCard
                hasCustomers={customers.length > 0}
                hasTasks={tasks.length > 0}
                hasNotes={notes.length > 0}
                hasTeam={false}
                hasSettings={true}
                onNavigateTab={setCurrentTab}
              />

              {/* Business Overview Cards */}
              <OverviewCards
                overview={overviewMetrics}
                currencySymbol={user.currency || '$'}
                onNavigateTab={setCurrentTab}
              />

              {/* Main Grid: Revenue Charts & Schedule Widget */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartsSection
                    revenueHistory={overviewMetrics.revenueHistory}
                    customers={customers}
                    currencySymbol={user.currency || '$'}
                  />
                </div>
                <div>
                  <ScheduleWidget
                    tasks={tasks}
                    onToggleTaskStatus={handleToggleTaskStatus}
                    onNavigateTasks={() => setCurrentTab('tasks')}
                  />
                </div>
              </div>

              {/* Quick Actions Panel */}
              <QuickActions
                onOpenAddCustomer={() => {
                  setEditingCustomer(null);
                  setIsCustomerModalOpen(true);
                }}
                onOpenAddTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                onOpenAddNote={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                onOpenAICopilot={() => setIsAICopilotOpen(true)}
              />

              {/* Recent Activity Stream */}
              <RecentActivity activities={activities} />
            </div>
          )}

          {/* CUSTOMERS CRM TAB */}
          {currentTab === 'customers' && (
            <div className="animate-in fade-in">
              <CustomerList
                customers={customers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenAddModal={() => {
                  setEditingCustomer(null);
                  setIsCustomerModalOpen(true);
                }}
                onEditCustomer={(cust) => {
                  setEditingCustomer(cust);
                  setIsCustomerModalOpen(true);
                }}
                onDeleteCustomer={handleDeleteCustomer}
                onArchiveCustomer={handleArchiveCustomer}
                onRestoreCustomer={handleRestoreCustomer}
                onToggleFavorite={handleToggleFavoriteCustomer}
                onBulkDeleteCustomers={handleBulkDeleteCustomers}
                onBulkArchiveCustomers={handleBulkArchiveCustomers}
                onImportCustomers={handleImportCustomers}
                onAddCustomerNote={handleAddCustomerNote}
                currencySymbol={user.currency || '$'}
              />
            </div>
          )}

          {/* TASKS TAB */}
          {currentTab === 'tasks' && (
            <div className="animate-in fade-in">
              <TaskManager
                tasks={tasks}
                customers={customers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefreshTasks={async () => {
                  const refreshed = await TaskService.getTasks({ includeArchived: true });
                  setTasks(refreshed);
                  setActivities(loadActivities());
                }}
              />
            </div>
          )}

          {/* NOTES TAB */}
          {currentTab === 'notes' && (
            <div className="animate-in fade-in">
              <NotesManager
                notes={notes}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenAddModal={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                onEditNote={(nt) => {
                  setEditingNote(nt);
                  setIsNoteModalOpen(true);
                }}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleToggleNotePin}
                onSummarizeNote={handleSummarizeNote}
              />
            </div>
          )}

          {/* ANALYTICS TAB */}
          {currentTab === 'analytics' && (
            <AnalyticsView
              overview={overviewMetrics}
              customers={customers}
              tasks={tasks}
              notes={notes}
              currencySymbol={user.currency || '$'}
            />
          )}

          {/* TEAM COLLABORATION TAB */}
          {currentTab === 'team' && (
            <TeamCollaborationView currentUser={user} />
          )}

          {/* SAAS BILLING & SUBSCRIPTIONS TAB */}
          {currentTab === 'billing' && (
            <BillingDashboardView currentUser={user} />
          )}

          {/* WORKFLOW AUTOMATION & NOTIFICATIONS TAB */}
          {currentTab === 'automations' && (
            <div className="animate-in fade-in">
              <AutomationsDashboardView
                onNotificationsUpdated={reloadNotifications}
                workspaceId="ws_default_1"
              />
            </div>
          )}

          {/* AI COPILOT FULL TAB */}
          {currentTab === 'copilot' && (
            <div className="animate-in fade-in">
              <AIBusinessAssistant
                customers={customers}
                notes={notes}
                onRefreshTasksAndNotes={async () => {
                  const refreshedTasks = await TaskService.getTasks({ includeArchived: true });
                  setTasks(refreshedTasks);
                  const refreshedNotes = loadNotes();
                  setNotes(refreshedNotes);
                  setActivities(loadActivities());
                }}
              />
            </div>
          )}

          {/* PROFILE TAB */}
          {currentTab === 'profile' && (
            <div className="animate-in fade-in space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user.name}</h2>
                  <p className="text-xs text-zinc-500">{user.email} • <span className="text-rose-500 font-semibold">{user.businessName}</span></p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {user.role} Role
                  </span>
                </div>
              </div>

              <ProfileSettings
                user={user}
                onSaveUser={(updatedUser) => {
                  setUser(updatedUser);
                  saveUserProfile(updatedUser);
                }}
                theme={theme}
                setTheme={(newTheme) => {
                  setTheme(newTheme);
                  const updatedUser = { ...user, theme: newTheme };
                  setUser(updatedUser);
                  saveUserProfile(updatedUser);
                }}
                onResetDemoData={handleResetDemoData}
                onExportBackup={handleExportBackup}
              />
            </div>
          )}

          {/* SETTINGS TAB */}
          {currentTab === 'settings' && (
            <div className="animate-in fade-in">
              <ProfileSettings
                user={user}
                onSaveUser={(updatedUser) => {
                  setUser(updatedUser);
                  saveUserProfile(updatedUser);
                }}
                theme={theme}
                setTheme={(newTheme) => {
                  setTheme(newTheme);
                  const updatedUser = { ...user, theme: newTheme };
                  setUser(updatedUser);
                  saveUserProfile(updatedUser);
                }}
                onResetDemoData={handleResetDemoData}
                onExportBackup={handleExportBackup}
              />
            </div>
          )}

          {/* FEEDBACK & SUPPORT TAB */}
          {(currentTab === 'feedback' || currentTab === 'support') && (
            <div className="animate-in fade-in">
              <FeedbackView currentUser={user} onBackToDashboard={() => setCurrentTab('dashboard')} />
            </div>
          )}

          {/* ABOUT CHERRYFLOW TAB */}
          {(currentTab === 'about' || currentTab === 'help') && (
            <div className="animate-in fade-in">
              <AboutPage onBackToDashboard={() => setCurrentTab('dashboard')} />
            </div>
          )}

          {/* SUPER ADMIN PANEL TAB */}
          {currentTab === 'admin' && (
            SuperAdminService.isSuperAdminLoggedIn() || user.role === 'super_admin' ? (
              <SuperAdminLayout
                currentUserRole="super_admin"
                onSwitchRoleToSuperAdmin={() => setScreen('super_admin_login')}
                onStartImpersonation={(targetUser) => {
                  setImpersonatedUser({
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email,
                    businessName: targetUser.businessName || targetUser.workspaceName || 'Customer Workspace',
                    role: targetUser.role || 'owner',
                    currency: '$',
                    theme: 'dark',
                    createdAt: targetUser.createdAt || new Date().toISOString(),
                  });
                  setCurrentTab('dashboard');
                }}
              />
            ) : (
              <UnauthorizedAccess
                onGoToSuperAdminLogin={() => setScreen('super_admin_login')}
                onReturnToWorkspace={() => setCurrentTab('dashboard')}
              />
            )
          )}
        </main>

        {/* Global CherryFlow Footer */}
        <Footer onNavigateTab={(tab) => setCurrentTab(tab)} />
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingTaskCount={pendingTaskCount}
      />

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        customers={customers}
        tasks={tasks}
        notes={notes}
        onNavigateTab={setCurrentTab}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
        existingCustomers={customers}
        currencySymbol={user.currency || '$'}
      />

      <CustomerDetailModal
        customer={selectedDetailCustomer}
        tasks={tasks}
        onClose={() => setSelectedDetailCustomer(null)}
        currencySymbol={user.currency || '$'}
        onAddTaskForCustomer={(c) => {
          setSelectedDetailCustomer(null);
          setEditingTask({ customerId: c.id, customerName: c.company } as any);
          setIsTaskModalOpen(true);
        }}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        customers={customers}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
      />

      <AICopilotDrawer
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        customers={customers}
        tasks={tasks}
        notes={notes}
        overview={overviewMetrics}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={appNotifications}
        onNotificationsUpdated={reloadNotifications}
        onOpenPreferences={() => {
          setIsNotifDrawerOpen(false);
          setIsNotifPrefsOpen(true);
        }}
        onNavigateTab={(tab) => setCurrentTab(tab as ViewTab)}
      />

      <NotificationPreferencesModal
        isOpen={isNotifPrefsOpen}
        onClose={() => setIsNotifPrefsOpen(false)}
        userId={user.id}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OperatingSystemContent />
    </AuthProvider>
  );
}

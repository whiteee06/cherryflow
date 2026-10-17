# CherryFlow Dashboard Testing Guide (Prompt #4 Verification)

This guide provides step-by-step instructions for testing and validating all features of the CherryFlow Premium SaaS Dashboard.

---

## 1. Sidebar Navigation
- **Location:** Left panel on desktop (`lg:flex`), slide-out drawer on mobile.
- **Brand Header:** Click on "CherryFlow Business OS" logo to jump back to the Dashboard tab.
- **Nav Links:**
  1. **Dashboard:** Primary hub with overview metrics, charts, focus widget, quick actions, and activity stream.
  2. **Customers CRM:** Displays active accounts, deal values, status badges, and detail modals.
  3. **Task Manager:** Kanban & list view with priorities, subtasks, and quick completion.
  4. **Notes & Strategy:** Strategy notes, pinned items, and AI summaries.
  5. **Analytics:** Performance telemetry, MRR trajectory, weekly productivity bar charts.
  6. **AI Assistant:** AI Business Copilot with audit tools and email drafting.
  7. **Profile:** Direct access to user profile settings and role details.
  8. **Settings:** Account preferences, currency settings, theme toggle, and backup export/reset tools.
  9. **Sign Out:** Triggers session logout and redirects to Auth screen.

---

## 2. Top Navigation Bar
- **Global Search (`⌘K` / `Ctrl+K`):** Click the search bar or press keyboard shortcut to open the unified search modal across customers, tasks, and notes.
- **AI Copilot Button:** Pulsing button that opens the AI Assistant drawer.
- **Quick Add Dropdown:**
  - `+ Add Customer`: Opens customer creation modal.
  - `+ Create Task`: Opens task creation modal.
  - `+ New Strategy Note`: Opens note creation modal.
- **Business Alerts (Notifications Bell):** Opens dropdown showing live alerts with unread badge counter, "Mark all read", and dismiss actions.
- **Theme Switcher:** Toggles seamlessly between Dark and Light mode.
- **User Profile Dropdown:** Displays user avatar, name, email, active business name, link to Profile, Settings, and Sign Out.

---

## 3. Main Dashboard Content
- **Welcome Banner:** Shows personalized greeting, active workspace name, user role, and direct "Run AI Copilot Audit" trigger button.
- **Overview Metric Cards (4 Cards):**
  - Monthly Revenue ($) with percentage growth badge.
  - Active Customers count with pipeline growth indicator.
  - Task Completion Rate (%) with remaining tasks count.
  - Strategy Notes count.
- **Revenue & Pipeline Charts:**
  - Area Chart comparing Monthly Revenue vs Operating Expenses.
  - Donut Chart showing Customer Pipeline distribution (VIP, Active, Prospects, Leads).
- **Today's Focus & Schedule Widget:**
  - Displays urgent and high-priority pending tasks.
  - Radio buttons to complete tasks directly from the dashboard.
  - "View Full Task Board" navigation link.
- **Quick Business Actions:** Interactive cards for instant record creation and AI launch.
- **Recent Activity Stream:** Real-time log of customer additions, task completions, note edits, and AI triggers with relative timestamps ("Just now", "10m ago").

---

## 4. Mobile Responsiveness
- **Mobile Drawer:** Tap the menu hamburger icon in top bar to open sidebar drawer.
- **Mobile Bottom Navigation:** Fixed bottom navigation bar with badges for quick switching between Home, CRM, Tasks, Notes, and AI Copilot.

---

## 5. Testing Checklist

| Feature | Action | Expected Outcome |
| :--- | :--- | :--- |
| **Theme Toggle** | Click Sun/Moon icon | Switches UI color palette cleanly |
| **Global Search** | Press `⌘K` or click search | Search modal opens with live results |
| **Quick Add** | Select "+ Create Task" | Task modal appears |
| **Schedule Widget** | Toggle task checkbox | Task updates to completed in state |
| **Notifications** | Click bell icon & mark read | Unread badge clears |
| **Mobile Nav** | Shrink browser width | Mobile bottom navigation appears |
| **Logout** | Click "Sign Out" | Clears session & returns to Login screen |

# CherryFlow V1 - Task & Project Management Module Testing Guide

This document outlines step-by-step procedures to test the complete Task & Project Management system in CherryFlow.

---

## 1. Task CRUD Testing
1. **Create Task:**
   - Click the **"Create Task"** button in the top header or click the **"+"** icon in any Kanban column.
   - Fill in Title, Description, Priority (`Critical`, `High`, `Medium`, `Low`), Workflow Status, Assignee, Start Date, Due Date, Labels, and Recurring Schedule.
   - Click **"AI Auto-Breakdown"** to automatically generate actionable subtasks.
   - Click **"Save Task"** and confirm the task card appears immediately.

2. **Edit Task:**
   - Click the **"..."** context menu on a task card or click **"Edit Task"** inside the Task Details Drawer.
   - Modify fields (e.g. change priority from Medium to Critical or update due date).
   - Save changes and verify instant visual update.

3. **Delete & Duplicate Task:**
   - Open context menu on a card -> Select **"Duplicate Task"**. Verify a copy with `(Copy)` suffix is created.
   - Select **"Delete Task"**, accept confirmation dialog, and verify removal.

4. **Archive & Restore Task:**
   - Click **"Archive Task"** in the drawer or card menu.
   - Switch to the **"Archived"** view tab in the top navigation bar.
   - Click **"Restore"** on the archived task and verify it returns to active status.

---

## 2. Kanban Drag & Drop Testing
1. Hover over any task card in the **Kanban Board** view.
2. Click and hold to drag the task card across columns (`To Do` -> `In Progress` -> `Review` -> `Completed`).
3. Notice the animated drop zone highlights in subtle red border/glow as you drag over a target column.
4. Drop the task into a new column and verify the status badge and database record update immediately.

---

## 3. Calendar View Testing
1. Click the **"Calendar"** tab on the Task Manager control bar.
2. Observe month controls (**Previous**, **Next**, **Today**) and task markers placed on their assigned due dates.
3. Click any date cell in the calendar grid to create a new task auto-scheduled for that specific due date.
4. Click any task pill on a date cell to open its **Task Detail Drawer**.

---

## 4. Realtime Updates Testing
1. Open CherryFlow in two separate browser tabs or side-by-side windows.
2. In Tab A, create a new task or drag a task from `To Do` to `Completed`.
3. In Tab B, observe Supabase Realtime automatically sync and re-render the updated task state without manual page refresh.

---

## 5. File Attachments & Comments
1. Click on a task card to open the **Task Detail Drawer**.
2. Navigate to the **"Comments"** tab:
   - Type a comment and click **"Post Comment"**.
   - Verify timestamped entry appears in the discussion stream.
3. Navigate to the **"Attachments"** tab:
   - Click or drag a document/image file onto the attachment dropzone.
   - Confirm upload progress indicator and downloadable link generation.

---

## 6. Notifications & Mobile Responsiveness
1. **Notification Banners:**
   - Create a task with yesterday's due date to trigger the **Overdue Tasks** alert banner.
   - Create a task due in 2 days to trigger the **Due Soon** notification banner.
2. **Mobile Responsiveness:**
   - Resize browser width to mobile viewport (<640px).
   - Verify sticky header, horizontal scroll on Kanban columns, mobile drawer slide-over, and touch-friendly controls.

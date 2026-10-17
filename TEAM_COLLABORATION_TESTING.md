# Prompt #9: Team Collaboration & Workspace Management Testing Guide

## 🚀 Overview
This guide provides step-by-step instructions for validating Prompt #9 (Team Collaboration) in CherryFlow, covering multi-user workspaces, role-based access controls, pending invitations, in-app notifications, and real-time collaboration presence.

---

## 🛠️ Testing Scenarios

### 1. Workspace Management & Switching
1. Navigate to the **Team Workspace** tab from the main left sidebar.
2. In the top banner, click the **Workspace Switcher** dropdown.
3. Select a different workspace (e.g. *Growth & Product Lab*) and verify that members and settings update instantly.
4. Click **Create New Workspace** in the dropdown or settings tab.
5. Enter a workspace name (e.g. *Apex Digital Guild*) and optional description, then click **Create Workspace**.
6. Verify that you become the **Workspace Owner** for the newly created workspace.

### 2. Member Invitation System & Join Links
1. Click the **Invite Member** button in the top banner.
2. Enter a recipient email address (e.g., `colleague@company.com`).
3. Select a workspace role (*Admin*, *Member*, or *Viewer*).
4. Click **Send Invitation**.
5. Observe the success confirmation dialog and click **Copy Join Link**.
6. Switch to the **Pending Invitations** tab and confirm the invitation appears with the status `Pending`.
7. Click **Copy Join Link** to copy the token link to your clipboard.
8. Click the cancel/delete button to retract an invitation and verify it is removed from the table.

### 3. Role & Permission Management
1. In the **Team Members** tab, view the member grid.
2. For an existing member (e.g. Marcus Vance or Sarah Chen), click the actions menu (`...`).
3. Select a new role (e.g., promote from *Member* to *Admin* or downgrade to *Viewer*).
4. Verify the role badge updates immediately and permission rules apply.
5. Confirm that members cannot modify the Owner role or remove themselves without proper privileges.

### 4. Realtime Presence & Active Users
1. Inspect the **Realtime Team Presence** bar below the top header banner.
2. Observe active member avatars with online (emerald green), idle (amber), or offline status badges.
3. Hover over member avatars to view their current active workspace tab.

### 5. In-App Notifications Drawer
1. Click the **Notification Bell** icon in the top header.
2. Observe the red unread counter badge.
3. In the notification drawer, test filtering tabs: **All**, **Unread**, and **Mentions**.
4. Click the checkmark icon on an unread notification to mark it as read, or click **Mark All Read**.
5. Verify unread counters update across the UI.

### 6. Item Comments & @Mentions
1. Open a Task or Customer detail modal.
2. Scroll to the **Team Comment Discussion** section.
3. Type a comment containing an `@mention` (e.g., `Please review with @sarah.chen`).
4. Click the **Mention Colleague** button to auto-insert a member handle.
5. Submit the comment and verify it renders with highlighted mention tags and timestamps.

### 7. Supabase Database & Security Migration
1. Apply the `/supabase/migrations/07_team_collaboration_schema.sql` migration script to your Supabase project.
2. Verify tables: `workspaces`, `workspace_members`, `workspace_invitations`, `item_comments`, `in_app_notifications`, and `user_presences`.
3. Test Row Level Security (RLS) policies ensuring users only query workspaces and members they belong to.

---

## 💻 Technical Checklist
- [x] Workspace & Team Collaboration TypeScript Types (`src/types.ts`)
- [x] Supabase Migration with RLS Security Policies (`/supabase/migrations/07_team_collaboration_schema.sql`)
- [x] Workspace Service (`src/services/WorkspaceService.ts`)
- [x] Team & Invitation Service (`src/services/TeamService.ts`)
- [x] Notification Service (`src/services/NotificationService.ts`)
- [x] Comment & Presence Service (`src/services/CommentService.ts`)
- [x] Workspace Selector (`src/components/team/WorkspaceSelector.tsx`)
- [x] Create Workspace Modal (`src/components/team/CreateWorkspaceModal.tsx`)
- [x] Invite Member Modal (`src/components/team/InviteMemberModal.tsx`)
- [x] Team Member Card (`src/components/team/TeamMemberCard.tsx`)
- [x] Realtime Presence Bar (`src/components/team/TeamPresenceBar.tsx`)
- [x] Notification Drawer (`src/components/team/NotificationDrawer.tsx`)
- [x] Item Comment Thread (`src/components/team/ItemCommentThread.tsx`)
- [x] Main Team Collaboration View (`src/components/team/TeamCollaborationView.tsx`)

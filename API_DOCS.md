# 📖 CherryFlow OS – API & Service Architecture Documentation

CherryFlow OS uses a hybrid architecture combining server-side Express API routes for sensitive operations (AI generation, streaming, telemetry) with client-side Supabase services for real-time database queries.

---

## 🛰️ Express Backend Endpoints (`/api/*`)

### 1. AI Business Copilot
- **Endpoint**: `POST /api/ai/copilot`
- **Request Body**:
  ```json
  {
    "prompt": "How do I increase lead conversion rates for my design agency?",
    "context": { "businessType": "Agency", "monthlyRevenue": 25000 }
  }
  ```
- **Response**: `{ "result": "Markdown formatted strategic advice..." }`

### 2. AI Sales Outreach Generator
- **Endpoint**: `POST /api/ai/outreach`
- **Request Body**:
  ```json
  {
    "customerName": "Sarah Jenkins",
    "company": "Nexus Digital",
    "status": "Proposal Sent",
    "dealValue": 18500,
    "objective": "Follow up on proposal review and schedule closing call"
  }
  ```
- **Response**: `{ "result": "Subject line & email body..." }`

### 3. AI Task Breakdown Generator
- **Endpoint**: `POST /api/ai/task-breakdown`
- **Request Body**:
  ```json
  {
    "taskTitle": "Prepare Q3 Enterprise Proposal",
    "description": "Include custom SLA and pricing breakdown",
    "priority": "High"
  }
  ```
- **Response**: `{ "subtasks": [{ "title": "Draft SLA draft", "estimatedMinutes": 45 }] }`

### 4. AI Note Summarizer
- **Endpoint**: `POST /api/ai/note-summary`
- **Request Body**:
  ```json
  {
    "title": "Strategy Sync Notes",
    "content": "Discussed hiring 2 senior devs and migrating to Supabase..."
  }
  ```
- **Response**: `{ "result": "Executive summary and action items..." }`

### 5. AI Chat Streaming (Server-Sent Events)
- **Endpoint**: `POST /api/ai/chat/stream`
- **Content-Type**: `text/event-stream`
- **Request Body**:
  ```json
  {
    "message": "What are our top revenue drivers this quarter?",
    "history": [{ "role": "user", "content": "Hello" }],
    "model": "gemini-3.6-flash",
    "temperature": 0.7
  }
  ```
- **Stream Output**: `data: {"text": "Chunk..."}\n\ndata: [DONE]\n\n`

### 6. DevOps System Diagnostics
- **`GET /api/health`**: Returns system uptime, memory usage, and service configuration statuses.
- **`GET /api/metrics`**: Returns total API requests handled, active rate-limit records, Node version, and process ID.
- **`GET /api/logs`**: Returns the 100 most recent server diagnostic logs.
- **`POST /api/devops/backup`**: Triggers a database snapshot simulation.

---

## 🗄️ Client Services (`src/services/`)

- **`CustomerService`**: CRUD operations, Kanban pipeline state, CSV exports, bulk archiving.
- **`TaskService`**: Project task boards, subtasks, task attachments, filters.
- **`NoteService`**: Markdown notes, tagging, pinning, search filtering.
- **`ChatService`**: AI chat history persistence, session creation, streaming chunks.
- **`ActivityService`**: System activity audit logs.
- **`BillingService`**: Subscription plan tiers, invoice history, payment method updates.
- **`AutomationService`**: Workflow triggers, action execution logs, automation state.
- **`TeamService`**: Workspace members, roles (Owner, Admin, Member, Guest), invitation tokens.

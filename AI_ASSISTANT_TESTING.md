# CherryFlow AI Business Assistant Testing Guide

## Overview
The AI Business Assistant module in CherryFlow provides business owners with streaming AI guidance, prompt templates, customer/note context injection, and direct conversion of AI outputs into actionable tasks in the Task Hub.

---

## Features Built
1. **AI Chat Interface & Streaming**: Real-time word-by-word streaming responses via Server-Sent Events (SSE) from `/api/ai/chat/stream`.
2. **Conversation History Management**: Persistent sessions with rename, pin, search, delete, and clear history options.
3. **Modular AI Provider Configuration**: Support for Gemini (`gemini-3.6-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`), with configurable temperature slider (0.0 to 1.0) and system prompt customization.
4. **Business Prompt Library**: Pre-built structured templates for emails, business proposals, marketing content, meeting notes summaries, and task generation.
5. **AI Automation Features**:
   - **Convert AI Output to Task**: Directly creates a task in the Task Hub with automated subtasks and tags.
   - **Save AI Output to Notes**: Stores strategy insights directly into Business Notes.
   - **Attach Customer / Note Context**: Inject real customer data or strategy notes into the chat context.
6. **Database Schema & RLS**: Supabase tables (`chat_sessions`, `chat_messages`, `ai_usage_logs`, `prompt_templates`) with Row-Level Security policies in `supabase/migrations/05_ai_chat_schema.sql`.

---

## How to Test

### 1. Test Streaming Chat & Responses
1. Navigate to the **AI Copilot** tab in the main navigation.
2. Type a message in the chat input bar, e.g., *"Draft a warm sales email for a $10,000 web redesign proposal"*.
3. Verify that response text streams word-by-word into the chat bubble.
4. Test the **Stop Generation** button while text is streaming.

### 2. Test Business Prompt Library
1. Click the **Prompt Library** button above the chat input bar.
2. Select a template category (e.g., *Sales & Emails*, *Proposals*, or *Tasks & Planning*).
3. Click a prompt template (e.g. *"Write Business Proposal"*).
4. Verify that the prompt text is loaded into the input bar.

### 3. Test Business Context Attachment
1. Click **+ Customer** in the input bar chips.
2. Select an existing customer account (e.g., *Acme Corp*).
3. Verify that customer details (deal value, status, notes) are attached as context to your AI prompt.

### 4. Test AI Automation (Convert Output to Task / Note)
1. After the AI generates a response, hover over the message toolbar below the response bubble.
2. Click **Create Task**.
3. Verify the toast notification *"Task created in Task Hub!"*.
4. Navigate to the **Tasks** tab to verify the new AI task with subtasks.

### 5. Test AI Settings & Persona Configuration
1. Click the **Config / Sliders** button in the top header or sidebar.
2. Change the temperature slider to `0.9` (Creative) or `0.2` (Analytical).
3. Select a model variant (e.g., `Gemini 3.6 Flash` or `Gemini 3.1 Pro`).
4. Modify the **System Instructions Persona** and save.

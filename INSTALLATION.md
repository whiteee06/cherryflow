# 💻 CherryFlow OS – Developer Installation & Local Setup Guide

This guide provides step-by-step instructions for installing and running CherryFlow OS in a local development environment.

---

## 📋 System Requirements

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher (or `bun` v1.1+)
- **Git**: Installed and configured
- **Supabase Account** (Optional): A free Supabase project if using real cloud database persistence. CherryFlow includes an automatic local storage fallback for instant testing.

---

## 🛠️ Step 1: Clone Repository & Install Dependencies

Open your terminal and run:

```bash
# Clone the repository
git clone https://github.com/your-organization/cherryflow-os.git

# Navigate into project directory
cd cherryflow-os

# Install all dependencies from package.json
npm install
```

---

## 🔑 Step 2: Set Up Environment Variables

1. Copy the provided environment variable template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   NODE_ENV="development"
   PORT=3000
   
   # Server-side Gemini API key (Required for AI Copilot features)
   GEMINI_API_KEY="AIzaSyYourKeyHere"
   
   # Optional Supabase credentials
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key-here"
   ```

---

## 🚀 Step 3: Run the Development Server

Start the full-stack Express + Vite dev server:

```bash
npm run dev
```

The application will launch on **`http://localhost:3000`**.

---

## 🧪 Step 4: Run Tests & Verification

Verify your installation by running the lint and test tools:

```bash
# Run TypeScript compilation and type check
npm run lint

# Run automated unit and integration tests
npm test
```

---

## 🗄️ Step 5: (Optional) Local Database Seeding with Supabase

If connecting to a Supabase database instance:

1. Log into your Supabase Dashboard at `https://app.supabase.com`.
2. Go to the **SQL Editor**.
3. Execute the migration files located in `supabase/migrations/` in sequence (`01` through `09`).
4. Execute `supabase/seed.sql` to populate initial plans, workspaces, customers, and tasks.

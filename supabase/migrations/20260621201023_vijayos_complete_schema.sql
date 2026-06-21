/*
# VijayOS Complete Database Schema

## Overview
Complete Personal Business Operating System schema for Vijay Shukla.
Multi-user application with authenticated access and user-specific data isolation.

## New Tables
1. `profiles` - User profile information (extends auth.users)
2. `tasks` - Task management with brand, priority, status, category
3. `brands` - Business brand definitions with progress tracking
4. `projects` - Website/digital projects with milestones
5. `learning_topics` - Learning curriculum items with progress
6. `trades` - Trading journal entries
7. `ideas` - Ideas and problems tracking
8. `daily_tasks` - Recurring daily routines
9. `kpis` - Key performance indicators
10. `ai_sessions` - AI assistant chat history
11. `daily_reports` - End-of-day AI summaries
12. `time_allocations` - Time utilization tracking

## Security
- All tables have RLS enabled
- Owner-scoped CRUD: users only see their own data
- user_id defaults to auth.uid() for seamless inserts
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  full_name text NOT NULL DEFAULT 'Vijay Shukla',
  email text UNIQUE,
  role text DEFAULT 'Managing Director & CEO',
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'business',
  overview text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  health_score integer DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  revenue_placeholder jsonb DEFAULT '{}',
  priority integer DEFAULT 2,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_brands" ON brands;
CREATE POLICY "select_own_brands" ON brands FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_brands" ON brands;
CREATE POLICY "insert_own_brands" ON brands FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_brands" ON brands;
CREATE POLICY "update_own_brands" ON brands FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_brands" ON brands;
CREATE POLICY "delete_own_brands" ON brands FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('not_started', 'pending', 'in_progress', 'waiting', 'blocked', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category text DEFAULT 'operations' CHECK (category IN ('daily', 'weekly', 'monthly', 'business', 'learning', 'project', 'trading', 'personal')),
  due_date date,
  completed_at timestamptz,
  estimated_minutes integer DEFAULT 30,
  actual_minutes integer,
  location text,
  repeat text,
  notes text,
  tags text[] DEFAULT '{}',
  is_ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date date,
  start_date date,
  completed_at timestamptz,
  roadmap jsonb DEFAULT '[]',
  files jsonb DEFAULT '[]',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- LEARNING TOPICS TABLE
CREATE TABLE IF NOT EXISTS learning_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'business_analyst' CHECK (category IN ('business_analyst', 'english', 'resume', 'other')),
  topic text NOT NULL,
  description text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  study_hours decimal DEFAULT 0,
  target_hours integer DEFAULT 10,
  notes text,
  resources jsonb DEFAULT '[]',
  priority integer DEFAULT 2,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_learning" ON learning_topics;
CREATE POLICY "select_own_learning" ON learning_topics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_learning" ON learning_topics;
CREATE POLICY "insert_own_learning" ON learning_topics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_learning" ON learning_topics;
CREATE POLICY "update_own_learning" ON learning_topics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_learning" ON learning_topics;
CREATE POLICY "delete_own_learning" ON learning_topics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- TRADES TABLE (Trading Journal)
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date date NOT NULL DEFAULT CURRENT_DATE,
  symbol text NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  quantity decimal NOT NULL,
  entry_price decimal NOT NULL,
  exit_price decimal,
  profit_loss decimal DEFAULT 0,
  outcome text DEFAULT 'open' CHECK (outcome IN ('open', 'profit', 'loss', 'breakeven')),
  strategy text,
  setup_reason text,
  exit_reason text,
  notes text,
  tags text[] DEFAULT '{}',
  risk_reward_ratio decimal,
  position_size decimal,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_trades" ON trades;
CREATE POLICY "select_own_trades" ON trades FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_trades" ON trades;
CREATE POLICY "insert_own_trades" ON trades FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trades" ON trades;
CREATE POLICY "update_own_trades" ON trades FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trades" ON trades;
CREATE POLICY "delete_own_trades" ON trades FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- IDEAS TABLE
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  type text DEFAULT 'idea' CHECK (type IN ('idea', 'problem', 'opportunity')),
  title text NOT NULL,
  detail text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'snoozed', 'rejected')),
  priority text DEFAULT 'medium',
  impact text DEFAULT 'medium',
  notes text,
  tags text[] DEFAULT '{}',
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ideas" ON ideas;
CREATE POLICY "select_own_ideas" ON ideas FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ideas" ON ideas;
CREATE POLICY "insert_own_ideas" ON ideas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ideas" ON ideas;
CREATE POLICY "update_own_ideas" ON ideas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ideas" ON ideas;
CREATE POLICY "delete_own_ideas" ON ideas FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- DAILY TASKS TABLE (Recurring routines)
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  schedule text DEFAULT 'daily' CHECK (schedule IN ('daily', 'weekly', 'monthly', 'custom')),
  custom_days integer[] DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_today boolean DEFAULT false,
  completion_date date,
  streak_count integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_daily_tasks" ON daily_tasks;
CREATE POLICY "select_own_daily_tasks" ON daily_tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_daily_tasks" ON daily_tasks;
CREATE POLICY "insert_own_daily_tasks" ON daily_tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_daily_tasks" ON daily_tasks;
CREATE POLICY "update_own_daily_tasks" ON daily_tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_daily_tasks" ON daily_tasks;
CREATE POLICY "delete_own_daily_tasks" ON daily_tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- KPIs TABLE
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_type text DEFAULT 'counter',
  value decimal DEFAULT 0,
  target decimal,
  unit text,
  category text DEFAULT 'general',
  period text DEFAULT 'daily',
  trend text DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  trend_percentage decimal DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_kpis" ON kpis;
CREATE POLICY "select_own_kpis" ON kpis FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_kpis" ON kpis;
CREATE POLICY "insert_own_kpis" ON kpis FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_kpis" ON kpis;
CREATE POLICY "update_own_kpis" ON kpis FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_kpis" ON kpis;
CREATE POLICY "delete_own_kpis" ON kpis FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- AI SESSIONS TABLE (Chat History)
CREATE TABLE IF NOT EXISTS ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text DEFAULT 'chat' CHECK (session_type IN ('chat', 'recommendation', 'report', 'analysis')),
  messages jsonb DEFAULT '[]',
  context jsonb DEFAULT '{}',
  actions jsonb DEFAULT '[]',
  summary text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_sessions" ON ai_sessions;
CREATE POLICY "select_own_ai_sessions" ON ai_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_sessions" ON ai_sessions;
CREATE POLICY "insert_own_ai_sessions" ON ai_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_sessions" ON ai_sessions;
CREATE POLICY "update_own_ai_sessions" ON ai_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_sessions" ON ai_sessions;
CREATE POLICY "delete_own_ai_sessions" ON ai_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- DAILY REPORTS TABLE
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  report_type text DEFAULT 'end_of_day' CHECK (report_type IN ('end_of_day', 'weekly', 'monthly')),
  summary text,
  tasks_completed integer DEFAULT 0,
  tasks_pending integer DEFAULT 0,
  learning_completed boolean DEFAULT false,
  learning_hours decimal DEFAULT 0,
  productivity_score integer DEFAULT 0,
  challenges text[] DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  ai_insights jsonb DEFAULT '{}',
  recommendations jsonb DEFAULT '[]',
  time_allocation jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON daily_reports;
CREATE POLICY "select_own_reports" ON daily_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reports" ON daily_reports;
CREATE POLICY "insert_own_reports" ON daily_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reports" ON daily_reports;
CREATE POLICY "update_own_reports" ON daily_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON daily_reports;
CREATE POLICY "delete_own_reports" ON daily_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- TIME ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS time_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  hours decimal DEFAULT 0,
  percentage decimal DEFAULT 0,
  description text,
  tasks_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE time_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_time" ON time_allocations;
CREATE POLICY "select_own_time" ON time_allocations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_time" ON time_allocations;
CREATE POLICY "insert_own_time" ON time_allocations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_time" ON time_allocations;
CREATE POLICY "update_own_time" ON time_allocations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_time" ON time_allocations;
CREATE POLICY "delete_own_time" ON time_allocations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_brand ON tasks(user_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_user ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_user ON learning_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user ON daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_kpis_user ON kpis(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, report_date);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Vijay Shukla'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
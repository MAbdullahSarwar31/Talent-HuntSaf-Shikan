-- SAF SHIKAN Mission Profitability Schema
-- Complete Postgres schema with Row Level Security (RLS) policies and roles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for clean domain constraints
CREATE TYPE app_role AS ENUM ('admin', 'finance', 'operations');
CREATE TYPE drone_status AS ENUM ('active', 'maintenance', 'grounded');
CREATE TYPE mission_status AS ENUM ('completed', 'in_progress', 'aborted');
CREATE TYPE province_type AS ENUM ('Punjab', 'Sindh', 'KPK', 'Balochistan');
CREATE TYPE crop_type AS ENUM ('Cotton', 'Wheat', 'Rice', 'Sugarcane');
CREATE TYPE payment_status AS ENUM ('received', 'pending', 'overdue');
CREATE TYPE cost_category AS ENUM ('travel', 'battery_wear', 'chemical_loading', 'operator_labor', 'maintenance_reserve', 'retry_fuel');
CREATE TYPE score_band AS ENUM ('excellent', 'good', 'average', 'poor', 'critical');

-- 1. Profiles Table (User roles sitting above existing Admin/Operator portal)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'operations',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Drones Table
CREATE TABLE IF NOT EXISTS drones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  status drone_status NOT NULL DEFAULT 'active',
  total_flight_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  maintenance_burden_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  hourly_depreciation_cost_pkr NUMERIC(12, 2) NOT NULL DEFAULT 4500.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Operators Table
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  cnic TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  province province_type NOT NULL DEFAULT 'Punjab',
  experience_years INTEGER NOT NULL DEFAULT 2,
  hourly_rate_pkr NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
  total_missions INTEGER NOT NULL DEFAULT 0,
  retry_rate_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Missions Table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  province province_type NOT NULL,
  crop_type crop_type NOT NULL,
  status mission_status NOT NULL DEFAULT 'completed',
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE RESTRICT,
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
  flight_hours NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  idle_time_minutes INTEGER NOT NULL DEFAULT 0,
  area_covered_acres NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  revenue_pkr NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  amount_pkr NUMERIC(14, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'received',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Costs Table
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  category cost_category NOT NULL,
  amount_pkr NUMERIC(14, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Profitability Scores Table
CREATE TABLE IF NOT EXISTS profitability_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID UNIQUE NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL,
  band score_band NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cost_pkr NUMERIC(14, 2) NOT NULL,
  hours_down NUMERIC(8, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Scoring Rules Table
CREATE TABLE IF NOT EXISTS scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  weight NUMERIC(5, 2) NOT NULL,
  threshold_good NUMERIC(10, 2) NOT NULL,
  threshold_poor NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profitability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS app_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Profiles visible to all authenticated users" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Admin can modify profiles" ON profiles
  FOR ALL USING (current_user_role() = 'admin');

-- Drones Policies
CREATE POLICY "Drones visible to all roles" ON drones
  FOR SELECT USING (true);
CREATE POLICY "Operations and Admin can modify drones" ON drones
  FOR ALL USING (current_user_role() IN ('admin', 'operations'));

-- Operators Policies
CREATE POLICY "Operators visible to all roles" ON operators
  FOR SELECT USING (true);
CREATE POLICY "Operations and Admin can modify operators" ON operators
  FOR ALL USING (current_user_role() IN ('admin', 'operations'));

-- Missions Policies
CREATE POLICY "Missions visible to all roles" ON missions
  FOR SELECT USING (true);
CREATE POLICY "Operations, Finance, and Admin can modify missions" ON missions
  FOR ALL USING (current_user_role() IN ('admin', 'operations', 'finance'));

-- Payments Policies
CREATE POLICY "Payments visible to all roles" ON payments
  FOR SELECT USING (true);
CREATE POLICY "Finance and Admin can modify payments" ON payments
  FOR ALL USING (current_user_role() IN ('admin', 'finance'));

-- Costs Policies
CREATE POLICY "Costs visible to all roles" ON costs
  FOR SELECT USING (true);
CREATE POLICY "Finance and Admin can modify costs" ON costs
  FOR ALL USING (current_user_role() IN ('admin', 'finance'));

-- Profitability Scores Policies
CREATE POLICY "Scores visible to all roles" ON profitability_scores
  FOR SELECT USING (true);
CREATE POLICY "Finance and Admin can modify scores" ON profitability_scores
  FOR ALL USING (current_user_role() IN ('admin', 'finance'));

-- Maintenance Logs Policies
CREATE POLICY "Maintenance logs visible to all roles" ON maintenance_logs
  FOR SELECT USING (true);
CREATE POLICY "Operations and Admin can modify maintenance logs" ON maintenance_logs
  FOR ALL USING (current_user_role() IN ('admin', 'operations'));

-- Scoring Rules Policies
CREATE POLICY "Scoring rules visible to all roles" ON scoring_rules
  FOR SELECT USING (true);
CREATE POLICY "Admin can modify scoring rules" ON scoring_rules
  FOR ALL USING (current_user_role() = 'admin');

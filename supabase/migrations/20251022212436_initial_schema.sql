/*
  Complete TAXLY Database Schema
  
  This schema covers all features shown in the application:
  - Dashboard (documents, alerts, monthly stats)
  - Accountant features (clients, reviews)
  - Upload functionality (documents, file processing)
  - AI Assistant (conversations, suggestions)
  - Calculator (tax calculations, saved calculations)
  - Email integration (email accounts, extracted documents)
  - Analytics (performance metrics, insights)
  - Alerts (notifications, compliance alerts)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  business_name TEXT,
  user_role TEXT DEFAULT 'individual' CHECK (user_role IN ('individual', 'accountant', 'admin')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (for document upload and processing)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  document_type TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error', 'review_needed')),
  amount DECIMAL(12,2),
  vendor TEXT,
  transaction_date DATE,
  category TEXT,
  description TEXT,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  tax_deductible BOOLEAN DEFAULT FALSE,
  receipt_type TEXT CHECK (receipt_type IN ('business', 'personal', 'medical', 'charitable')),
  extracted_data JSONB,
  processing_time DECIMAL(8,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table (for accountants managing clients)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accountant_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'review', 'completed', 'inactive')),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  estimated_refund DECIMAL(12,2) DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  flags TEXT[],
  notes TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review items table (for accountant review queue)
CREATE TABLE IF NOT EXISTS review_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) NOT NULL,
  accountant_id UUID REFERENCES auth.users(id) NOT NULL,
  document_id UUID REFERENCES documents(id),
  type TEXT NOT NULL CHECK (type IN ('document', 'calculation', 'deduction', 'compliance')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_info')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  amount DECIMAL(12,2),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  flags TEXT[],
  notes TEXT[],
  due_date TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table (notifications and compliance alerts)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('deadline', 'compliance', 'error', 'info', 'success', 'regulation', 'audit')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  action_required TEXT,
  affected_clients INTEGER DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax calculations table (for calculator feature)
CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT,
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  filing_status TEXT NOT NULL CHECK (filing_status IN ('single', 'marriedJoint', 'marriedSeparate', 'headOfHousehold')),
  state TEXT NOT NULL,
  gross_income DECIMAL(12,2) NOT NULL,
  adjusted_gross_income DECIMAL(12,2),
  taxable_income DECIMAL(12,2),
  federal_tax DECIMAL(12,2),
  state_tax DECIMAL(12,2),
  fica_tax DECIMAL(12,2),
  total_tax DECIMAL(12,2),
  effective_rate DECIMAL(5,2),
  marginal_rate DECIMAL(5,2),
  after_tax_income DECIMAL(12,2),
  deductions JSONB,
  calculation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email accounts table (for email integration)
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'other')),
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'syncing', 'error', 'disconnected')),
  auto_sync BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  documents_found INTEGER DEFAULT 0,
  sync_folders TEXT[],
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Email documents table (documents found in emails)
CREATE TABLE IF NOT EXISTS email_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email_account_id UUID REFERENCES email_accounts(id) NOT NULL,
  document_id UUID REFERENCES documents(id),
  subject TEXT NOT NULL,
  sender TEXT NOT NULL,
  email_date TIMESTAMP WITH TIME ZONE NOT NULL,
  attachments INTEGER DEFAULT 0,
  category TEXT,
  amount DECIMAL(12,2),
  processed BOOLEAN DEFAULT FALSE,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  tags TEXT[],
  email_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversations table (for AI assistant)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics data table (for analytics dashboard)
CREATE TABLE IF NOT EXISTS analytics_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  documents_processed INTEGER DEFAULT 0,
  documents_pending INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0,
  cost_savings DECIMAL(12,2) DEFAULT 0,
  efficiency_score INTEGER DEFAULT 0 CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  error_count INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  expenses DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Expenses table (for expense tracking)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  document_id UUID REFERENCES documents(id),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT,
  transaction_date DATE NOT NULL,
  payment_method TEXT,
  tax_deductible BOOLEAN DEFAULT FALSE,
  business_purpose TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log table (for tracking user actions)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_accountant_id ON clients(accountant_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_review_items_accountant_id ON review_items(accountant_id);
CREATE INDEX IF NOT EXISTS idx_review_items_status ON review_items(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_email_documents_user_id ON email_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_period ON analytics_data(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Clients policies (for accountants)
CREATE POLICY "Accountants can view own clients" ON clients FOR SELECT USING (auth.uid() = accountant_id);
CREATE POLICY "Accountants can insert clients" ON clients FOR INSERT WITH CHECK (auth.uid() = accountant_id);
CREATE POLICY "Accountants can update own clients" ON clients FOR UPDATE USING (auth.uid() = accountant_id);
CREATE POLICY "Accountants can delete own clients" ON clients FOR DELETE USING (auth.uid() = accountant_id);

-- Review items policies
CREATE POLICY "Accountants can view own review items" ON review_items FOR SELECT USING (auth.uid() = accountant_id);
CREATE POLICY "Accountants can insert review items" ON review_items FOR INSERT WITH CHECK (auth.uid() = accountant_id);
CREATE POLICY "Accountants can update own review items" ON review_items FOR UPDATE USING (auth.uid() = accountant_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid() = user_id);

-- Tax calculations policies
CREATE POLICY "Users can view own calculations" ON tax_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calculations" ON tax_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calculations" ON tax_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calculations" ON tax_calculations FOR DELETE USING (auth.uid() = user_id);

-- Email accounts policies
CREATE POLICY "Users can view own email accounts" ON email_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email accounts" ON email_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email accounts" ON email_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email accounts" ON email_accounts FOR DELETE USING (auth.uid() = user_id);

-- Email documents policies
CREATE POLICY "Users can view own email documents" ON email_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email documents" ON email_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email documents" ON email_documents FOR UPDATE USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can view own conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- Analytics data policies
CREATE POLICY "Users can view own analytics" ON analytics_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON analytics_data FOR UPDATE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- User activity policies
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity" ON user_activity FOR INSERT WITH CHECK (true);

-- Create functions for common operations

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO user_activity (user_id, action, resource_type, resource_id, details)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_items_updated_at BEFORE UPDATE ON review_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_calculations_updated_at BEFORE UPDATE ON tax_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON email_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_documents_updated_at BEFORE UPDATE ON email_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_data_updated_at BEFORE UPDATE ON analytics_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
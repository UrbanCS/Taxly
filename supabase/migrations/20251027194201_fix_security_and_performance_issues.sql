/*
  # Fix Security and Performance Issues

  This migration addresses multiple security and performance concerns identified by Supabase:

  ## 1. Foreign Key Indexes
  Adds indexes to all foreign key columns to improve query performance:
  - ai_conversations.user_id
  - email_documents.document_id
  - email_documents.email_account_id
  - expenses.document_id
  - review_items.client_id
  - review_items.document_id
  - tax_calculations.user_id

  ## 2. RLS Policy Optimization
  Updates all RLS policies to use `(select auth.uid())` instead of `auth.uid()` 
  to prevent re-evaluation for each row, significantly improving performance at scale.
  
  Affected tables:
  - user_profiles (3 policies)
  - documents (4 policies)
  - clients (4 policies)
  - review_items (3 policies)
  - alerts (2 policies)
  - tax_calculations (4 policies)
  - email_accounts (4 policies)
  - email_documents (3 policies)
  - ai_conversations (4 policies)
  - analytics_data (3 policies)
  - expenses (4 policies)
  - user_activity (1 policy)

  ## 3. Function Security
  Sets explicit search_path for functions to prevent search path injection attacks:
  - log_user_activity
  - update_updated_at_column

  ## 4. Unused Indexes Cleanup
  Removes indexes that are not being used by the database
*/

-- =====================================================
-- 1. ADD INDEXES FOR FOREIGN KEYS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id 
  ON public.ai_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_email_documents_document_id 
  ON public.email_documents(document_id);

CREATE INDEX IF NOT EXISTS idx_email_documents_email_account_id 
  ON public.email_documents(email_account_id);

CREATE INDEX IF NOT EXISTS idx_expenses_document_id 
  ON public.expenses(document_id);

CREATE INDEX IF NOT EXISTS idx_review_items_client_id 
  ON public.review_items(client_id);

CREATE INDEX IF NOT EXISTS idx_review_items_document_id 
  ON public.review_items(document_id);

CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id 
  ON public.tax_calculations(user_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - USER_PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - CLIENTS
-- =====================================================

DROP POLICY IF EXISTS "Accountants can view own clients" ON public.clients;
CREATE POLICY "Accountants can view own clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (accountant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Accountants can insert clients" ON public.clients;
CREATE POLICY "Accountants can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (accountant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Accountants can update own clients" ON public.clients;
CREATE POLICY "Accountants can update own clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (accountant_id = (select auth.uid()))
  WITH CHECK (accountant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Accountants can delete own clients" ON public.clients;
CREATE POLICY "Accountants can delete own clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (accountant_id = (select auth.uid()));

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - REVIEW_ITEMS
-- =====================================================

DROP POLICY IF EXISTS "Accountants can view own review items" ON public.review_items;
CREATE POLICY "Accountants can view own review items"
  ON public.review_items FOR SELECT
  TO authenticated
  USING (accountant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Accountants can insert review items" ON public.review_items;
CREATE POLICY "Accountants can insert review items"
  ON public.review_items FOR INSERT
  TO authenticated
  WITH CHECK (accountant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Accountants can update own review items" ON public.review_items;
CREATE POLICY "Accountants can update own review items"
  ON public.review_items FOR UPDATE
  TO authenticated
  USING (accountant_id = (select auth.uid()))
  WITH CHECK (accountant_id = (select auth.uid()));

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - ALERTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own alerts" ON public.alerts;
CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - TAX_CALCULATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own calculations" ON public.tax_calculations;
CREATE POLICY "Users can view own calculations"
  ON public.tax_calculations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own calculations" ON public.tax_calculations;
CREATE POLICY "Users can insert own calculations"
  ON public.tax_calculations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own calculations" ON public.tax_calculations;
CREATE POLICY "Users can update own calculations"
  ON public.tax_calculations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own calculations" ON public.tax_calculations;
CREATE POLICY "Users can delete own calculations"
  ON public.tax_calculations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - EMAIL_ACCOUNTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own email accounts" ON public.email_accounts;
CREATE POLICY "Users can view own email accounts"
  ON public.email_accounts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own email accounts" ON public.email_accounts;
CREATE POLICY "Users can insert own email accounts"
  ON public.email_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own email accounts" ON public.email_accounts;
CREATE POLICY "Users can update own email accounts"
  ON public.email_accounts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own email accounts" ON public.email_accounts;
CREATE POLICY "Users can delete own email accounts"
  ON public.email_accounts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES - EMAIL_DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own email documents" ON public.email_documents;
CREATE POLICY "Users can view own email documents"
  ON public.email_documents FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own email documents" ON public.email_documents;
CREATE POLICY "Users can insert own email documents"
  ON public.email_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own email documents" ON public.email_documents;
CREATE POLICY "Users can update own email documents"
  ON public.email_documents FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES - AI_CONVERSATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
CREATE POLICY "Users can view own conversations"
  ON public.ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.ai_conversations;
CREATE POLICY "Users can insert own conversations"
  ON public.ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own conversations" ON public.ai_conversations;
CREATE POLICY "Users can update own conversations"
  ON public.ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.ai_conversations;
CREATE POLICY "Users can delete own conversations"
  ON public.ai_conversations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES - ANALYTICS_DATA
-- =====================================================

DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_data;
CREATE POLICY "Users can view own analytics"
  ON public.analytics_data FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_data;
CREATE POLICY "Users can insert own analytics"
  ON public.analytics_data FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own analytics" ON public.analytics_data;
CREATE POLICY "Users can update own analytics"
  ON public.analytics_data FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES - EXPENSES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 13. OPTIMIZE RLS POLICIES - USER_ACTIVITY
-- =====================================================

DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity;
CREATE POLICY "Users can view own activity"
  ON public.user_activity FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 14. FIX FUNCTION SEARCH PATHS
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO user_activity (user_id, action, resource_type, resource_id, details)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 15. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_review_items_accountant_id;
DROP INDEX IF EXISTS public.idx_review_items_status;
DROP INDEX IF EXISTS public.idx_alerts_resolved;
DROP INDEX IF EXISTS public.idx_email_documents_user_id;
DROP INDEX IF EXISTS public.idx_analytics_data_period;
DROP INDEX IF EXISTS public.idx_expenses_date;
DROP INDEX IF EXISTS public.idx_user_activity_user_id;
DROP INDEX IF EXISTS public.idx_user_activity_created_at;
DROP INDEX IF EXISTS public.idx_documents_created_at;
DROP INDEX IF EXISTS public.idx_clients_accountant_id;
DROP INDEX IF EXISTS public.idx_clients_status;
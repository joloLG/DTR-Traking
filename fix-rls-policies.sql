-- Fix RLS policies for proper authentication
-- Run this in your Supabase SQL editor

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own DTR records" ON dtr_records;
DROP POLICY IF EXISTS "Users can insert own DTR records" ON dtr_records;
DROP POLICY IF EXISTS "Users can update own DTR records" ON dtr_records;
DROP POLICY IF EXISTS "Users can delete own DTR records" ON dtr_records;

-- Recreate policies with simpler logic
CREATE POLICY "Users can view own DTR records" ON dtr_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DTR records" ON dtr_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DTR records" ON dtr_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DTR records" ON dtr_records
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE dtr_records ENABLE ROW LEVEL SECURITY;

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Service role can update users for OJT calculation" ON users;

-- Recreate users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Service role policies (for server-side operations)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update users for OJT calculation" ON users
    FOR UPDATE USING (auth.role() = 'service_role');

-- Ensure RLS is enabled for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

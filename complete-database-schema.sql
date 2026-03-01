-- =====================================================
-- DTR TRACKER - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Run this entire script in your Supabase SQL editor
-- This will create all tables, indexes, triggers, and policies
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  ojt_hours_required DECIMAL(10,2) DEFAULT 0.00,
  ojt_hours_completed DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DTR records table with shift_type support
CREATE TABLE dtr_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME,
  total_hours DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN time_out IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (date + time_out - date + time_in))/3600
      ELSE 0 
    END
  ) STORED,
  description TEXT,
  shift_type VARCHAR(20) DEFAULT 'regular' CHECK (shift_type IN ('morning', 'afternoon', 'regular')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, shift_type)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_dtr_records_user_id ON dtr_records(user_id);
CREATE INDEX idx_dtr_records_date ON dtr_records(date);
CREATE INDEX idx_dtr_records_user_date ON dtr_records(user_id, date);

-- =====================================================
-- 3. CREATE TRIGGER FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update user's total OJT hours when DTR records change
CREATE OR REPLACE FUNCTION update_user_ojt_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's total completed hours
    UPDATE users 
    SET ojt_hours_completed = (
        SELECT COALESCE(SUM(total_hours), 0)
        FROM dtr_records 
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dtr_records_updated_at BEFORE UPDATE ON dtr_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for automatic OJT hours calculation
CREATE TRIGGER update_ojt_hours_on_insert
    AFTER INSERT ON dtr_records
    FOR EACH ROW
    EXECUTE FUNCTION update_user_ojt_hours();

CREATE TRIGGER update_ojt_hours_on_update
    AFTER UPDATE ON dtr_records
    FOR EACH ROW
    EXECUTE FUNCTION update_user_ojt_hours();

CREATE TRIGGER update_ojt_hours_on_delete
    AFTER DELETE ON dtr_records
    FOR EACH ROW
    EXECUTE FUNCTION update_user_ojt_hours();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtr_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id OR id IS NULL);

-- Service role policies for users (for server-side operations)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update users for OJT calculation" ON users
    FOR UPDATE USING (auth.role() = 'service_role');

-- DTR records policies
CREATE POLICY "Users can view own DTR records" ON dtr_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DTR records" ON dtr_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DTR records" ON dtr_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DTR records" ON dtr_records
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. SETUP INSTRUCTIONS
-- =====================================================

/*
After running this schema:

1. Set up Supabase Authentication:
   - Go to Authentication > Settings
   - Enable email/password authentication
   - Add your site URL and redirect URLs

2. Configure Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

3. Test the Setup:
   - Register a new user account
   - Login and verify dashboard access
   - Add DTR records and test calendar functionality

Features Included:
- ✅ User authentication and profiles
- ✅ DTR time tracking with morning/afternoon shifts
- ✅ Automatic OJT hours calculation
- ✅ Row Level Security for data protection
- ✅ Optimized indexes for performance
- ✅ Calendar color coding (red=single shift, green=complete day)
- ✅ Show password functionality
- ✅ Responsive design

The database is now ready for your DTR Tracker application!
*/

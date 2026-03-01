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

-- Create DTR records table
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_dtr_records_user_id ON dtr_records(user_id);
CREATE INDEX idx_dtr_records_date ON dtr_records(date);
CREATE INDEX idx_dtr_records_user_date ON dtr_records(user_id, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dtr_records_updated_at BEFORE UPDATE ON dtr_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtr_records ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text OR id IS NULL);

-- Allow service role to insert users (for registration)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow service role to update users (for OJT hours trigger)
CREATE POLICY "Service role can update users for OJT calculation" ON users
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create policies for DTR records
CREATE POLICY "Users can view own DTR records" ON dtr_records
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own DTR records" ON dtr_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own DTR records" ON dtr_records
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own DTR records" ON dtr_records
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Function to update user's total OJT hours
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

-- Create trigger to automatically update user's OJT hours when DTR records change
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

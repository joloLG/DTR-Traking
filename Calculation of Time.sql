-- =====================================================
-- FIX INCORRECT TIME CALCULATION FORMULA
-- =====================================================
-- This script fixes the mathematical error in the total_hours calculation

-- The current formula is incorrect:
-- EXTRACT(EPOCH FROM (date + time_out - date + time_in))/3600
-- This calculates: (time_out + time_in) instead of (time_out - time_in)

-- First, create a backup of the existing table
CREATE TABLE dtr_records_backup AS SELECT * FROM dtr_records;

-- Drop the existing table (this will also drop triggers)
DROP TABLE IF EXISTS dtr_records;

-- Recreate the table with CORRECTED total_hours calculation
CREATE TABLE dtr_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME,
  total_hours DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN time_out IS NOT NULL THEN 
        -- CORRECTED FORMULA: Calculate actual time difference
        EXTRACT(EPOCH FROM (time_out::time - time_in::time))/3600
      ELSE 0 
    END
  ) STORED,
  description TEXT,
  shift_type VARCHAR(20) DEFAULT 'regular' CHECK (shift_type IN ('morning', 'afternoon', 'regular')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, shift_type)
);

-- Restore data from backup (excluding the generated total_hours column)
INSERT INTO dtr_records (id, user_id, date, time_in, time_out, description, shift_type, created_at, updated_at)
SELECT id, user_id, date, time_in, time_out, description, shift_type, created_at, updated_at
FROM dtr_records_backup;

-- Drop the backup table
DROP TABLE dtr_records_backup;

-- Recreate indexes
CREATE INDEX idx_dtr_records_user_id ON dtr_records(user_id);
CREATE INDEX idx_dtr_records_date ON dtr_records(date);
CREATE INDEX idx_dtr_records_user_date ON dtr_records(user_id, date);

-- Recreate triggers
CREATE TRIGGER update_dtr_records_updated_at BEFORE UPDATE ON dtr_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Re-enable RLS
ALTER TABLE dtr_records ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view own DTR records" ON dtr_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DTR records" ON dtr_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DTR records" ON dtr_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DTR records" ON dtr_records
    FOR DELETE USING (auth.uid() = user_id);

/*
MATHEMATICAL VERIFICATION:

Example: Morning Shift 8:00 AM to 12:15 PM
- Time In: 08:00
- Time Out: 12:15
- Expected: 4.25 hours
- Formula: EXTRACT(EPOCH FROM ('12:15'::time - '08:00'::time))/3600
- Result: (4 hours 15 minutes) = 4.25 hours ✓

Example: Afternoon Shift 1:00 PM to 5:30 PM  
- Time In: 13:00
- Time Out: 17:30
- Expected: 4.5 hours
- Formula: EXTRACT(EPOCH FROM ('17:30'::time - '13:00'::time))/3600
- Result: (4 hours 30 minutes) = 4.5 hours ✓

The corrected formula now properly calculates:
Time Out - Time In = Actual Hours Worked
*/

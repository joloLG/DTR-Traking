-- Fix RLS policies for OJT hours trigger
-- Run this in your Supabase SQL editor to fix the RLS issue

-- Allow service role to update users (for OJT hours trigger)
CREATE POLICY "Service role can update users for OJT calculation" ON users
    FOR UPDATE USING (auth.role() = 'service_role');

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_ojt_hours_on_insert ON dtr_records;
DROP TRIGGER IF EXISTS update_ojt_hours_on_update ON dtr_records;
DROP TRIGGER IF EXISTS update_ojt_hours_on_delete ON dtr_records;

-- Drop and recreate the trigger function with SECURITY DEFINER
DROP FUNCTION IF EXISTS update_user_ojt_hours();

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

-- Recreate triggers
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

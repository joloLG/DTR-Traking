-- Calendar Notes Table for OJT Narrative Reports
-- This table stores daily notes that users can add to their calendar
-- These notes are used to generate AI-powered narrative reports

CREATE TABLE IF NOT EXISTS calendar_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one note per user per date
  UNIQUE(user_id, date)
);

-- Enable RLS (Row Level Security)
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own calendar notes
CREATE POLICY "Users can view own calendar notes" ON calendar_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar notes" ON calendar_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar notes" ON calendar_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar notes" ON calendar_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_calendar_notes_user_date ON calendar_notes(user_id, date);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_calendar_notes_updated_at
  BEFORE UPDATE ON calendar_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

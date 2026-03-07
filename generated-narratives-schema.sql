-- Generated Narratives Table for OJT Narrative Reports
-- This table stores AI-generated narrative reports for users

CREATE TABLE IF NOT EXISTS generated_narratives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('day', 'week', 'month', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE generated_narratives ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own narratives
CREATE POLICY "Users can view own generated narratives" ON generated_narratives
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated narratives" ON generated_narratives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated narratives" ON generated_narratives
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated narratives" ON generated_narratives
  FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_generated_narratives_user_date ON generated_narratives(user_id, created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_narratives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_generated_narratives_updated_at
  BEFORE UPDATE ON generated_narratives
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_narratives_updated_at();

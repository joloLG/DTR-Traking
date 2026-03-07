-- Create narrative_reports table
CREATE TABLE IF NOT EXISTS narrative_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraint to ensure one report per user per date
  UNIQUE(user_id, date)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_narrative_reports_user_date ON narrative_reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_narrative_reports_user_id ON narrative_reports(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE narrative_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view their own narrative reports" ON narrative_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own narrative reports" ON narrative_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own narrative reports" ON narrative_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own narrative reports" ON narrative_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_narrative_reports_updated_at
  BEFORE UPDATE ON narrative_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

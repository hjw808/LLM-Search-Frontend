-- Create test_usage table to track monthly test runs
CREATE TABLE IF NOT EXISTS public.test_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_count INTEGER DEFAULT 0,
  month_year TEXT NOT NULL, -- Format: "YYYY-MM" for easy monthly tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Enable Row Level Security
ALTER TABLE public.test_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for own usage"
ON public.test_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own usage"
ON public.test_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own usage"
ON public.test_usage FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_usage_user_month ON public.test_usage(user_id, month_year);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_test_usage_timestamp ON public.test_usage;
CREATE TRIGGER update_test_usage_timestamp
  BEFORE UPDATE ON public.test_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_test_usage_timestamp();

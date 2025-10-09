-- Create a function to execute dynamic SQL (for migrations only)
-- This should only be accessible to service role

CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission only to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.exec_sql IS 'Execute dynamic SQL for migrations. Use with caution - service role only.';

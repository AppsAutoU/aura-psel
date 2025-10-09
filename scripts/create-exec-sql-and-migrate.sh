#!/bin/bash

echo "🔧 Creating exec_sql function and adding nivel_ingles column..."
echo ""

# Supabase credentials
SUPABASE_URL="https://xjnjfytapohglezpwksf.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbmpmeXRhcG9oZ2xlenB3a3NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MzQxNiwiZXhwIjoyMDY3NjM5NDE2fQ.OhjRHvwWZMjfpWRELvLx65duhXS8BhS7ggFM3-q6zDY"

# Step 1: Try to create exec_sql function
echo "📝 Step 1: Creating exec_sql function..."
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql; END; $$;"
  }'

echo ""
echo ""

# Step 2: Add nivel_ingles column
echo "📝 Step 2: Adding nivel_ingles column..."
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;"
  }'

echo ""
echo ""
echo "✅ Migration attempt completed!"
echo ""
echo "📋 If the above failed, please run this SQL manually in Supabase Dashboard:"
echo "   ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;"

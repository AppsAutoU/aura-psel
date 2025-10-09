const https = require('https');

const SUPABASE_URL = 'https://xjnjfytapohglezpwksf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbmpmeXRhcG9oZ2xlenB3a3NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MzQxNiwiZXhwIjoyMDY3NjM5NDE2fQ.OhjRHvwWZMjfpWRELvLx65duhXS8BhS7ggFM3-q6zDY';

console.log('🔧 Adding nivel_ingles column to aura_jobs_candidatos...\n');

// SQL to execute
const sql = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'aura_jobs_candidatos'
    AND column_name = 'nivel_ingles'
  ) THEN
    ALTER TABLE aura_jobs_candidatos ADD COLUMN nivel_ingles TEXT;
    RAISE NOTICE 'Column nivel_ingles added successfully';
  ELSE
    RAISE NOTICE 'Column nivel_ingles already exists';
  END IF;
END $$;
`;

// Make HTTP request to Supabase REST API
const data = JSON.stringify({
  query: sql
});

const options = {
  hostname: 'xjnjfytapohglezpwksf.supabase.co',
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 204) {
      console.log('✅ Migration executed successfully!');
      console.log('Column nivel_ingles has been added to aura_jobs_candidatos\n');
    } else {
      console.log(`❌ Migration failed with status ${res.statusCode}`);
      console.log('Response:', responseData);
      console.log('\n📝 Please run this SQL manually in Supabase Dashboard:');
      console.log('ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;\n');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n📝 Please run this SQL manually in Supabase Dashboard:');
  console.log('ALTER TABLE aura_jobs_candidatos ADD COLUMN IF NOT EXISTS nivel_ingles TEXT;\n');
});

req.write(data);
req.end();

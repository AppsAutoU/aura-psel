-- Fix admin signup by adding RLS policy for initial user creation
-- This allows authenticated users to create their own profile in aura_jobs_usuarios

-- Add a policy that allows authenticated users to insert their own record
CREATE POLICY "Users can create their own profile" ON aura_jobs_usuarios
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Add a policy that allows users to read their own profile
CREATE POLICY "Users can read their own profile" ON aura_jobs_usuarios
    FOR SELECT
    USING (auth.uid() = id);

-- Add a policy that allows users to update their own profile  
CREATE POLICY "Users can update their own profile" ON aura_jobs_usuarios
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
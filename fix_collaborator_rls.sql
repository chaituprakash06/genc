-- Complete reset of RLS policies for dispute_collaborators table

-- First, disable RLS temporarily and drop ALL policies
ALTER TABLE public.dispute_collaborators DISABLE ROW LEVEL SECURITY;

-- Drop all possible policies that might exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'dispute_collaborators' AND schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.dispute_collaborators', r.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.dispute_collaborators ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "dispute_owners_full_access" ON public.dispute_collaborators
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.disputes d 
            WHERE d.id = dispute_id AND d.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.disputes d 
            WHERE d.id = dispute_id AND d.user_id = auth.uid()
        )
    );

-- Allow users to view their own invitations
CREATE POLICY "users_view_own_invitations" ON public.dispute_collaborators
    FOR SELECT
    USING (email = auth.email() OR user_id = auth.uid());
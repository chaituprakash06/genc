-- Create dispute_collaborators table
CREATE TABLE IF NOT EXISTS public.dispute_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'contributor', 'viewer')),
    permissions JSONB,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaborator_activities table
CREATE TABLE IF NOT EXISTS public.collaborator_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dispute_collaborators_dispute_id ON public.dispute_collaborators(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_collaborators_user_id ON public.dispute_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_dispute_collaborators_email ON public.dispute_collaborators(email);
CREATE INDEX IF NOT EXISTS idx_dispute_collaborators_status ON public.dispute_collaborators(status);

CREATE INDEX IF NOT EXISTS idx_collaborator_activities_dispute_id ON public.collaborator_activities(dispute_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_activities_user_id ON public.collaborator_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_activities_created_at ON public.collaborator_activities(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dispute_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for dispute_collaborators
CREATE POLICY "Users can view collaborators for disputes they have access to" ON public.dispute_collaborators
    FOR SELECT
    USING (
        -- User is the dispute owner
        EXISTS (
            SELECT 1 FROM public.disputes d 
            WHERE d.id = dispute_id AND d.user_id = auth.uid()
        )
        OR
        -- User is a collaborator on the dispute
        EXISTS (
            SELECT 1 FROM public.dispute_collaborators dc 
            WHERE dc.dispute_id = dispute_collaborators.dispute_id 
            AND dc.user_id = auth.uid() 
            AND dc.status = 'accepted'
        )
        OR
        -- User is viewing their own invitation
        user_id = auth.uid()
        OR
        email = auth.email()
    );

CREATE POLICY "Dispute owners and admins can manage collaborators" ON public.dispute_collaborators
    FOR ALL
    USING (
        -- User is the dispute owner
        EXISTS (
            SELECT 1 FROM public.disputes d 
            WHERE d.id = dispute_id AND d.user_id = auth.uid()
        )
        OR
        -- User is an admin collaborator on the dispute
        EXISTS (
            SELECT 1 FROM public.dispute_collaborators dc 
            WHERE dc.dispute_id = dispute_collaborators.dispute_id 
            AND dc.user_id = auth.uid() 
            AND dc.status = 'accepted'
            AND dc.role = 'admin'
        )
    );

CREATE POLICY "Users can accept/decline their own invitations" ON public.dispute_collaborators
    FOR UPDATE
    USING (user_id = auth.uid() OR email = auth.email())
    WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- RLS policies for collaborator_activities
CREATE POLICY "Users can view activities for disputes they have access to" ON public.collaborator_activities
    FOR SELECT
    USING (
        -- User is the dispute owner
        EXISTS (
            SELECT 1 FROM public.disputes d 
            WHERE d.id = dispute_id AND d.user_id = auth.uid()
        )
        OR
        -- User is a collaborator on the dispute
        EXISTS (
            SELECT 1 FROM public.dispute_collaborators dc 
            WHERE dc.dispute_id = collaborator_activities.dispute_id 
            AND dc.user_id = auth.uid() 
            AND dc.status = 'accepted'
        )
    );

CREATE POLICY "Collaborators can create activities" ON public.collaborator_activities
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND
        (
            -- User is the dispute owner
            EXISTS (
                SELECT 1 FROM public.disputes d 
                WHERE d.id = dispute_id AND d.user_id = auth.uid()
            )
            OR
            -- User is a collaborator on the dispute
            EXISTS (
                SELECT 1 FROM public.dispute_collaborators dc 
                WHERE dc.dispute_id = collaborator_activities.dispute_id 
                AND dc.user_id = auth.uid() 
                AND dc.status = 'accepted'
            )
        )
    );

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_dispute_collaborators_updated_at
    BEFORE UPDATE ON public.dispute_collaborators
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.dispute_collaborators TO authenticated;
GRANT ALL ON public.collaborator_activities TO authenticated;
GRANT ALL ON public.dispute_collaborators TO service_role;
GRANT ALL ON public.collaborator_activities TO service_role;
// lib/services/collaborator-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

type DisputeCollaborator = Database['public']['Tables']['dispute_collaborators']['Row']
type CollaboratorInsert = Omit<Database['public']['Tables']['dispute_collaborators']['Insert'], 'invited_by'> & {
  invited_by?: string
}
type CollaboratorUpdate = Database['public']['Tables']['dispute_collaborators']['Update']
type CollaboratorActivity = Database['public']['Tables']['collaborator_activities']['Row']
type ActivityInsert = Database['public']['Tables']['collaborator_activities']['Insert']

export const CollaboratorService = {
  // Get all collaborators for a dispute
  async getDisputeCollaborators(disputeId: string): Promise<DisputeCollaborator[]> {
    const supabase = createClientComponentClient<Database>()
    
    const { data, error } = await supabase
      .from('dispute_collaborators')
      .select(`
        *,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('dispute_id', disputeId)
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Error fetching collaborators:', error)
      return []
    }

    return data || []
  },

  // Invite a collaborator
  async inviteCollaborator(collaborator: CollaboratorInsert): Promise<DisputeCollaborator | null> {
    const supabase = createClientComponentClient<Database>()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('dispute_collaborators')
      .insert({
        ...collaborator,
        invited_by: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error inviting collaborator:', error)
      return null
    }

    // Log the activity
    await this.logActivity({
      dispute_id: collaborator.dispute_id,
      user_id: user.id,
      activity_type: 'collaborator_invited',
      description: `Invited ${collaborator.email} as ${collaborator.role}`,
      metadata: { email: collaborator.email, role: collaborator.role }
    })

    return data
  },

  // Update collaborator role or permissions
  async updateCollaborator(id: string, updates: CollaboratorUpdate): Promise<DisputeCollaborator | null> {
    const supabase = createClientComponentClient<Database>()
    
    const { data, error } = await supabase
      .from('dispute_collaborators')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating collaborator:', error)
      return null
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && data) {
      await this.logActivity({
        dispute_id: data.dispute_id,
        user_id: user.id,
        activity_type: 'collaborator_updated',
        description: `Updated collaborator ${data.email}`,
        metadata: updates
      })
    }

    return data
  },

  // Remove a collaborator
  async removeCollaborator(id: string, disputeId: string): Promise<boolean> {
    const supabase = createClientComponentClient<Database>()
    
    // First get the collaborator info for logging
    const { data: collaborator } = await supabase
      .from('dispute_collaborators')
      .select('email')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('dispute_collaborators')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error removing collaborator:', error)
      return false
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user && collaborator) {
      await this.logActivity({
        dispute_id: disputeId,
        user_id: user.id,
        activity_type: 'collaborator_removed',
        description: `Removed collaborator ${collaborator.email}`,
        metadata: { email: collaborator.email }
      })
    }

    return true
  },

  // Accept collaboration invitation
  async acceptInvitation(id: string): Promise<boolean> {
    const supabase = createClientComponentClient<Database>()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('dispute_collaborators')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user_id: user.id
      })
      .eq('id', id)
      .eq('email', user.email)

    if (error) {
      console.error('Error accepting invitation:', error)
      return false
    }

    return true
  },

  // Decline collaboration invitation
  async declineInvitation(id: string): Promise<boolean> {
    const supabase = createClientComponentClient<Database>()
    
    const { error } = await supabase
      .from('dispute_collaborators')
      .update({ status: 'declined' })
      .eq('id', id)

    if (error) {
      console.error('Error declining invitation:', error)
      return false
    }

    return true
  },

  // Get collaborator activities
  async getCollaboratorActivities(disputeId: string, limit: number = 20): Promise<CollaboratorActivity[]> {
    const supabase = createClientComponentClient<Database>()
    
    const { data, error } = await supabase
      .from('collaborator_activities')
      .select(`
        *,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching activities:', error)
      return []
    }

    return data || []
  },

  // Log an activity
  async logActivity(activity: ActivityInsert): Promise<CollaboratorActivity | null> {
    const supabase = createClientComponentClient<Database>()
    
    const { data, error } = await supabase
      .from('collaborator_activities')
      .insert(activity)
      .select()
      .single()

    if (error) {
      console.error('Error logging activity:', error)
      return null
    }

    return data
  },

  // Check if user is a collaborator on a dispute
  async isCollaborator(disputeId: string, userId?: string): Promise<DisputeCollaborator | null> {
    const supabase = createClientComponentClient<Database>()
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }

    const { data, error } = await supabase
      .from('dispute_collaborators')
      .select('*')
      .eq('dispute_id', disputeId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single()

    if (error) return null
    return data
  },

  // Get user's role on a dispute
  async getUserRole(disputeId: string, userId?: string): Promise<string | null> {
    const collaborator = await this.isCollaborator(disputeId, userId)
    return collaborator?.role || null
  },

  // Check if user has permission
  async hasPermission(disputeId: string, permission: string, userId?: string): Promise<boolean> {
    const collaborator = await this.isCollaborator(disputeId, userId)
    if (!collaborator) return false

    const permissions = collaborator.permissions as string[] | null
    if (!permissions || !Array.isArray(permissions)) return false

    return permissions.includes(permission)
  }
}
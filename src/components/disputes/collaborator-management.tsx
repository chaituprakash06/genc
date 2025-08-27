'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  UserPlus,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  Activity
} from 'lucide-react'
import { CollaboratorService } from '@/lib/services/collaborator-service'
import { Database } from '@/lib/database.types'

type DisputeCollaborator = Database['public']['Tables']['dispute_collaborators']['Row'] & {
  profiles?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

type CollaboratorActivity = Database['public']['Tables']['collaborator_activities']['Row'] & {
  profiles?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface CollaboratorManagementProps {
  disputeId: string
  isOwner?: boolean
}

export default function CollaboratorManagement({ disputeId, isOwner = false }: CollaboratorManagementProps) {
  const [collaborators, setCollaborators] = useState<DisputeCollaborator[]>([])
  const [activities, setActivities] = useState<CollaboratorActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer',
    permissions: []
  })
  const [inviting, setInviting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [collaboratorsData, activitiesData] = await Promise.all([
        CollaboratorService.getDisputeCollaborators(disputeId),
        CollaboratorService.getCollaboratorActivities(disputeId)
      ])
      setCollaborators(collaboratorsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading collaborator data:', error)
      alert('Failed to load collaborators')
    } finally {
      setLoading(false)
    }
  }, [disputeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.email) return

    setInviting(true)
    try {
      const permissions = getPermissionsByRole(inviteForm.role)
      const collaborator = await CollaboratorService.inviteCollaborator({
        dispute_id: disputeId,
        email: inviteForm.email,
        role: inviteForm.role,
        permissions: permissions
      })

      if (collaborator) {
        alert('Collaborator invited successfully')
        setInviteDialogOpen(false)
        setInviteForm({ email: '', role: 'viewer', permissions: [] })
        await loadData()
      } else {
        alert('Failed to invite collaborator')
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error)
      alert('Failed to invite collaborator')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveCollaborator = async (id: string) => {
    try {
      const success = await CollaboratorService.removeCollaborator(id, disputeId)
      if (success) {
        alert('Collaborator removed')
        await loadData()
      } else {
        alert('Failed to remove collaborator')
      }
    } catch (error) {
      console.error('Error removing collaborator:', error)
      alert('Failed to remove collaborator')
    }
  }

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const permissions = getPermissionsByRole(newRole)
      const updated = await CollaboratorService.updateCollaborator(id, {
        role: newRole,
        permissions: permissions
      })
      
      if (updated) {
        alert('Collaborator role updated')
        await loadData()
      } else {
        alert('Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const getPermissionsByRole = (role: string) => {
    switch (role) {
      case 'admin':
        return ['read', 'write', 'delete', 'invite', 'manage']
      case 'editor':
        return ['read', 'write', 'invite']
      case 'contributor':
        return ['read', 'write']
      case 'viewer':
      default:
        return ['read']
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'contributor':
        return 'bg-orange-100 text-orange-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'UN'
  }

  const formatActivityTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Collaborators List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Collaborators</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage who can access and contribute to this dispute
              </p>
            </div>
            {isOwner && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Collaborator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Collaborator</DialogTitle>
                    <DialogDescription>
                      Invite someone to collaborate on this dispute case
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteCollaborator} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Can only view</SelectItem>
                          <SelectItem value="contributor">Contributor - Can add content</SelectItem>
                          <SelectItem value="editor">Editor - Can edit and invite</SelectItem>
                          <SelectItem value="admin">Admin - Full access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={inviting}>
                        {inviting ? 'Inviting...' : 'Send Invitation'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No collaborators yet</p>
                <p className="text-sm">Invite team members to collaborate on this dispute</p>
              </div>
            ) : (
              collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={collaborator.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(collaborator.profiles?.full_name, collaborator.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {collaborator.profiles?.full_name || collaborator.email}
                        </p>
                        <Badge className={getRoleColor(collaborator.role)}>
                          {collaborator.role}
                        </Badge>
                        <Badge className={getStatusColor(collaborator.status)}>
                          {collaborator.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {collaborator.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {collaborator.status === 'declined' && <XCircle className="w-3 h-3 mr-1" />}
                          {collaborator.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{collaborator.email}</p>
                      <p className="text-xs text-gray-500">
                        Invited {formatActivityTime(collaborator.invited_at)}
                        {collaborator.accepted_at && ` • Joined ${formatActivityTime(collaborator.accepted_at)}`}
                      </p>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.id, 'admin')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.id, 'editor')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Make Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.id, 'contributor')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Make Contributor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(collaborator.id, 'viewer')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Make Viewer
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Collaboration Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No activity yet</p>
                <p className="text-sm">Collaboration activity will appear here</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.profiles?.full_name, activity.profiles?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {activity.profiles?.full_name || activity.profiles?.email}
                      </span>
                      {' '}
                      <span className="text-gray-600">{activity.description}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatActivityTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// app/disputes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calendar, MoreVertical, Trash2, Archive } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DisputeService } from '@/lib/services/dispute-service'
import { Database } from '@/lib/database.types'

type Dispute = Database['public']['Tables']['disputes']['Row']

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'pending'>('all')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadDisputes()
    }
  }, [mounted])

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const data = await DisputeService.getDisputes()
      // Ensure data is always an array
      setDisputes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading disputes:', error)
      setDisputes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const success = await DisputeService.deleteDispute(id)
    if (success) {
      await loadDisputes()
    }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'resolved' | 'pending') => {
    const updated = await DisputeService.updateDispute(id, { status })
    if (updated) {
      await loadDisputes()
    }
  }

  // Ensure disputes is an array before filtering
  const filteredDisputes = filter === 'all' 
    ? disputes 
    : disputes.filter(d => d.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'resolved':
        return 'text-gray-600 bg-gray-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Don't render dynamic content until mounted to avoid hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading disputes...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Disputes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all your dispute cases in one place
              </p>
            </div>
            <Link href="/disputes/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Dispute
              </Button>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'active', 'pending', 'resolved'] as const).map(status => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'all' && ` (${disputes.length})`}
                {status !== 'all' && ` (${disputes.filter(d => d.status === status).length})`}
              </Button>
            ))}
          </div>

          {/* Disputes grid */}
          {filteredDisputes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-500 mb-4">
                  {filter === 'all' 
                    ? "You haven't created any disputes yet"
                    : `No ${filter} disputes`}
                </p>
                {filter === 'all' && (
                  <Link href="/disputes/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Dispute
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDisputes.map((dispute) => (
                <Card 
                  key={dispute.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/disputes/${dispute.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">
                        {dispute.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(dispute.id, 'active')
                          }}>
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(dispute.id, 'pending')
                          }}>
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(dispute.id, 'resolved')
                          }}>
                            <Archive className="w-4 h-4 mr-2" />
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(dispute.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {dispute.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {dispute.document_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
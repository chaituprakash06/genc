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

interface Dispute {
  id: string
  title: string
  description: string
  createdAt: Date
  lastModified: Date
  status: 'active' | 'resolved' | 'pending'
  documentCount: number
  reportCount: number
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'pending'>('all')
  const router = useRouter()

  useEffect(() => {
    // Load disputes from localStorage
    const savedDisputes = localStorage.getItem('disputes')
    if (savedDisputes) {
      const parsed = JSON.parse(savedDisputes)
      setDisputes(parsed.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        lastModified: new Date(d.lastModified)
      })))
    }
  }, [])

  const handleDelete = (id: string) => {
    const updated = disputes.filter(d => d.id !== id)
    setDisputes(updated)
    localStorage.setItem('disputes', JSON.stringify(updated))
  }

  const handleStatusChange = (id: string, status: 'active' | 'resolved' | 'pending') => {
    const updated = disputes.map(d => 
      d.id === id ? { ...d, status, lastModified: new Date() } : d
    )
    setDisputes(updated)
    localStorage.setItem('disputes', JSON.stringify(updated))
  }

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
                          {dispute.documentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dispute.lastModified.toLocaleDateString()}
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

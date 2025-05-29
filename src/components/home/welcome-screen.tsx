// components/home/welcome-screen.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen, Clock } from 'lucide-react'
import { DisputeService, Dispute } from '@/lib/services/dispute-service'

export default function WelcomeScreen() {
  const [disputes, setDisputes] = useState<Dispute[]>([])

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = () => {
    const allDisputes = DisputeService.getDisputes()
    setDisputes(allDisputes)
  }

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to GenC</h1>
          <p className="text-xl mb-2">Your AI-powered dispute resolution assistant</p>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your disputes and get strategic advice to strengthen your negotiation position
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Add New Dispute Card */}
          <Card className="transition-all hover:scale-105 hover:shadow-lg cursor-pointer border-2 border-dashed">
            <Link href="/disputes/new">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Add New Dispute</h2>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Start a new dispute case and upload relevant documents
                </p>
              </CardContent>
            </Link>
          </Card>

          {/* Continue Existing Dispute Card */}
          <Card className="transition-all hover:scale-105 hover:shadow-lg cursor-pointer">
            <CardContent className="pt-6 pb-6 h-full min-h-[200px]">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Continue Existing Dispute</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  {disputes.length > 0 
                    ? `You have ${disputes.length} ongoing dispute${disputes.length > 1 ? 's' : ''}`
                    : 'No disputes yet'}
                </p>
                {disputes.length > 0 && (
                  <Link href="/disputes">
                    <Button variant="outline">View All Disputes</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Disputes */}
        {disputes.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Disputes</h3>
            <div className="space-y-3">
              {disputes.slice(0, 3).map((dispute) => (
                <Link key={dispute.id} href={`/disputes/${dispute.id}`}>
                  <Card className="transition-all hover:shadow-md cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{dispute.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dispute.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dispute.lastModified.toLocaleDateString()}
                            </span>
                            <span>
                              {dispute.documentCount} document{dispute.documentCount !== 1 ? 's' : ''}
                            </span>
                            <span>
                              {dispute.reportCount} report{dispute.reportCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need help getting started?
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/chat">
              <Button variant="outline">
                Chat with AI Assistant
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline">
                View User Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

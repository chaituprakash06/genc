// components/home/welcome-screen.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, FileText, Lightbulb, Plus, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { DisputeService } from '@/lib/services/dispute-service'
import { Database } from '@/lib/database.types'

type Dispute = Database['public']['Tables']['disputes']['Row']

export default function WelcomeScreen() {
  const router = useRouter()
  const [recentDisputes, setRecentDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentDisputes()
  }, [])

  const loadRecentDisputes = async () => {
    setLoading(true)
    try {
      const disputes = await DisputeService.getDisputes()
      // Get the 3 most recent disputes
      setRecentDisputes(disputes.slice(0, 3))
    } catch (error) {
      console.error('Error loading disputes:', error)
      setRecentDisputes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome back!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your AI-powered negotiation assistant is ready to help
        </p>
      </div>

      {/* Recent Disputes or Get Started */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading your disputes...</p>
        </div>
      ) : recentDisputes.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Disputes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDisputes.map((dispute) => (
              <Card 
                key={dispute.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/disputes/${dispute.id}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{dispute.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {dispute.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : 'No date'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dispute.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/disputes">
              <Button variant="outline">
                View All Disputes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Get Started with Your First Dispute</CardTitle>
            <CardDescription>
              Create a dispute case and let our AI help you negotiate better outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/disputes/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Dispute
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-blue-500 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Document Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Upload contracts and documents for AI-powered analysis and insights
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-500 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>AI Negotiation Advisor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Get strategic advice based on proven negotiation tactics and frameworks
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-500 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Smart Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Receive personalized strategies to strengthen your negotiation position
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Link href="/disputes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Dispute
          </Button>
        </Link>
        <Link href="/disputes">
          <Button variant="outline">
            View All Disputes
          </Button>
        </Link>
      </div>
    </div>
  )
}
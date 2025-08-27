// app/disputes/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Upload, Brain, MessageSquare, Users, Loader2 } from 'lucide-react'
import { DisputeService } from '@/lib/services/dispute-service'
import DocumentUpload from '@/components/disputes/document-upload'
import DocumentList from '@/components/disputes/document-list'
import ReportViewer from '@/components/disputes/report-viewer'
import DisputeChat from '@/components/disputes/dispute-chat'
import CollaboratorManagement from '@/components/disputes/collaborator-management'
import { Database } from '@/lib/database.types'

type DisputeWithDetails = Database['public']['Tables']['disputes']['Row'] & {
  documents: Database['public']['Tables']['user_documents']['Row'][]
  reports: Database['public']['Tables']['dispute_reports']['Row'][]
}

export default function DisputeDetailPage() {
  const params = useParams()
  const [dispute, setDispute] = useState<DisputeWithDetails | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Database['public']['Tables']['dispute_reports']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDispute = useCallback(async () => {
    setLoading(true)
    try {
      const data = await DisputeService.getDisputeWithDetails(params.id as string)
      if (data) {
        setDispute(data)
        if (data.reports && data.reports.length > 0) {
          setSelectedReport(prev => prev || data.reports[0])
        }
      }
    } catch (error) {
      console.error('Error loading dispute:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadDispute()
  }, [loadDispute])

  const handleGenerateReport = async () => {
    if (!dispute) return

    if (!dispute.documents || dispute.documents.length === 0) {
      alert('Please upload documents before generating a report')
      setActiveTab('documents')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: dispute.documents,
          disputeDetails: dispute
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const { analysis } = await response.json()
      
      // Save the report to Supabase
      const report = await DisputeService.createReport({
        dispute_id: dispute.id,
        title: 'AI Analysis Report',
        report_type: 'analysis',
        summary: analysis.summary || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        opportunities: analysis.opportunities || [],
        risks: analysis.risks || [],
        negotiation_strategies: analysis.negotiationStrategies || [],
        key_terms: analysis.keyTerms || [],
        recommendations: analysis.recommendations || []
      })

      if (report) {
        await loadDispute()
      }
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Dispute not found</p>
            <Link href="/disputes">
              <Button>Back to Disputes</Button>
            </Link>
          </div>
        </main>
      </div>
    )
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

  const getUrgencyColor = (urgency?: string | null) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/disputes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Disputes
              </Button>
            </Link>
          </div>

          {/* Title and Status */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{dispute.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Created {dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : 'Unknown'}</span>
                <span>•</span>
                <span>Last updated {dispute.last_modified ? new Date(dispute.last_modified).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
                {dispute.status}
              </span>
              {dispute.urgency && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(dispute.urgency)}`}>
                  {dispute.urgency} urgency
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">
                Documents {dispute.documents && dispute.documents.length > 0 && `(${dispute.documents.length})`}
              </TabsTrigger>
              <TabsTrigger value="collaborators">
                <Users className="w-4 h-4 mr-1" />
                Collaborators
              </TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="analysis">
                AI Analysis {dispute.reports && dispute.reports.length > 0 && `(${dispute.reports.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dispute Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{dispute.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dispute.dispute_type && (
                      <div>
                        <h3 className="font-semibold mb-1">Type</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {dispute.dispute_type.charAt(0).toUpperCase() + dispute.dispute_type.slice(1).replace('-', ' ')}
                        </p>
                      </div>
                    )}
                    
                    {dispute.opposing_party && (
                      <div>
                        <h3 className="font-semibold mb-1">Opposing Party</h3>
                        <p className="text-gray-600 dark:text-gray-400">{dispute.opposing_party}</p>
                      </div>
                    )}
                    
                    {dispute.dispute_value && (
                      <div>
                        <h3 className="font-semibold mb-1">Estimated Value</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          ${parseFloat(dispute.dispute_value.toString()).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('documents')}>
                  <CardContent className="pt-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Upload Documents</h3>
                    <p className="text-sm text-gray-600 mt-1">Add contracts and evidence</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('collaborators')}>
                  <CardContent className="pt-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <h3 className="font-semibold">Manage Team</h3>
                    <p className="text-sm text-gray-600 mt-1">Invite collaborators</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('chat')}>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">Chat with AI</h3>
                    <p className="text-sm text-gray-600 mt-1">Ask questions about your case</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analysis')}>
                  <CardContent className="pt-6 text-center">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">Generate Analysis</h3>
                    <p className="text-sm text-gray-600 mt-1">Get AI-powered insights</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DocumentUpload 
                    disputeId={dispute.id} 
                    onUploadComplete={loadDispute}
                  />
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Uploaded Documents</h3>
                    <DocumentList 
                      disputeId={dispute.id}
                      documents={dispute.documents}
                      onDocumentChange={loadDispute}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaborators">
              <CollaboratorManagement 
                disputeId={dispute.id}
                isOwner={true} // TODO: Check if current user is the dispute owner
              />
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>AI Analysis</CardTitle>
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!dispute.reports || dispute.reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No analysis generated yet</p>
                      <p className="text-sm mt-2">Upload documents first, then generate AI analysis</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dispute.reports.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                          {dispute.reports.map((report, index) => (
                            <Button
                              key={report.id}
                              variant={selectedReport?.id === report.id ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              Report {index + 1}
                            </Button>
                          ))}
                        </div>
                      )}
                      {selectedReport && (
                        <ReportViewer report={selectedReport} />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle>AI Assistant Chat</CardTitle>
                  <p className="text-sm text-gray-600">
                    Ask questions about your dispute and get strategic advice based on proven negotiation tactics
                  </p>
                </CardHeader>
                <CardContent>
                  <DisputeChat dispute={dispute} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
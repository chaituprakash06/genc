// app/disputes/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Upload, Brain, MessageSquare, Loader2 } from 'lucide-react'
import { DisputeService, Dispute, Report } from '@/lib/services/dispute-service'
import DocumentUpload from '@/components/disputes/document-upload'
import DocumentList from '@/components/disputes/document-list'
import ReportViewer from '@/components/disputes/report-viewer'

export default function DisputeDetailPage() {
  const params = useParams()
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [reports, setReports] = useState<Report[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    const found = DisputeService.getDispute(params.id as string)
    if (found) {
      setDispute(found)
      const disputeReports = DisputeService.getReports(params.id as string)
      setReports(disputeReports)
      if (disputeReports.length > 0 && !selectedReport) {
        setSelectedReport(disputeReports[0])
      }
    }
  }, [params.id, selectedReport])

  const refreshData = () => {
    const found = DisputeService.getDispute(params.id as string)
    if (found) {
      setDispute(found)
      const disputeReports = DisputeService.getReports(params.id as string)
      setReports(disputeReports)
      if (disputeReports.length > 0) {
        setSelectedReport(disputeReports[0])
      }
    }
  }

  const handleGenerateReport = async () => {
    if (!dispute) return

    const documents = DisputeService.getDocuments(dispute.id)
    if (documents.length === 0) {
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
          documents: documents,
          disputeDetails: dispute
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const { report } = await response.json()
      
      // Save the report
      DisputeService.saveReport(report)
      refreshData()
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
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

  const getUrgencyColor = (urgency?: string) => {
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
                <span>Created {dispute.createdAt.toLocaleDateString()}</span>
                <span>•</span>
                <span>Last updated {dispute.lastModified.toLocaleDateString()}</span>
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
                Documents {dispute.documentCount > 0 && `(${dispute.documentCount})`}
              </TabsTrigger>
              <TabsTrigger value="analysis">
                AI Analysis {dispute.reportCount > 0 && `(${dispute.reportCount})`}
              </TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
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
                    {dispute.disputeType && (
                      <div>
                        <h3 className="font-semibold mb-1">Type</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {dispute.disputeType.charAt(0).toUpperCase() + dispute.disputeType.slice(1).replace('-', ' ')}
                        </p>
                      </div>
                    )}
                    
                    {dispute.opposingParty && (
                      <div>
                        <h3 className="font-semibold mb-1">Opposing Party</h3>
                        <p className="text-gray-600 dark:text-gray-400">{dispute.opposingParty}</p>
                      </div>
                    )}
                    
                    {dispute.disputeValue && (
                      <div>
                        <h3 className="font-semibold mb-1">Estimated Value</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          ${parseInt(dispute.disputeValue).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('documents')}>
                  <CardContent className="pt-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Upload Documents</h3>
                    <p className="text-sm text-gray-600 mt-1">Add contracts and evidence</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analysis')}>
                  <CardContent className="pt-6 text-center">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">Generate Analysis</h3>
                    <p className="text-sm text-gray-600 mt-1">Get AI-powered insights</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('chat')}>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">Chat with AI</h3>
                    <p className="text-sm text-gray-600 mt-1">Ask questions about your case</p>
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
                    onUploadComplete={refreshData}
                  />
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Uploaded Documents</h3>
                    <DocumentList 
                      disputeId={dispute.id}
                      onDocumentChange={refreshData}
                    />
                  </div>
                </CardContent>
              </Card>
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
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No analysis generated yet</p>
                      <p className="text-sm mt-2">Upload documents first, then generate AI analysis</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                          {reports.map((report, index) => (
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
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation with the AI assistant</p>
                    <p className="text-sm mt-2">Ask questions about your dispute and get strategic advice</p>
                    <Button className="mt-4">
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

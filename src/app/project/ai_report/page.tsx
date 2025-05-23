// app/project/ai_report/page.tsx
'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import ReportGenerator from '@/components/ai_report/report-generator'
import ReportViewer from '@/components/ai_report/report-viewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface Report {
  id: string
  title: string
  createdAt: Date
  status: 'generating' | 'ready' | 'error'
  content?: {
    summary: string
    keyFindings: string[]
    recommendations: string[]
    risks: string[]
    opportunities: string[]
  }
}

export default function AIReportPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    
    // Mock report generation - replace with actual API call
    const newReport: Report = {
      id: Date.now().toString(),
      title: `Contract Analysis Report - ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      status: 'generating'
    }
    
    setReports(prev => [newReport, ...prev])
    
    // Simulate API delay
    setTimeout(() => {
      const updatedReport: Report = {
        ...newReport,
        status: 'ready',
        content: {
          summary: 'This contract presents several opportunities for negotiation with some areas of concern that need addressing.',
          keyFindings: [
            'Payment terms are favorable but could be improved',
            'Termination clause heavily favors the other party',
            'Intellectual property rights need clarification',
            'Force majeure clause is comprehensive'
          ],
          recommendations: [
            'Negotiate for net 30 payment terms instead of net 60',
            'Add mutual termination rights with 30-day notice',
            'Clarify IP ownership for work products',
            'Consider adding specific performance metrics'
          ],
          risks: [
            'Unilateral termination rights for counterparty',
            'Unclear dispute resolution process',
            'No limitation of liability clause'
          ],
          opportunities: [
            'Room to negotiate better payment terms',
            'Possibility to add performance bonuses',
            'Can include escalation clause for multi-year terms'
          ]
        }
      }
      
      setReports(prev => 
        prev.map(r => r.id === newReport.id ? updatedReport : r)
      )
      setSelectedReport(updatedReport)
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Report Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate comprehensive AI-powered analysis reports for your contracts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Generate New Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportGenerator 
                    onGenerate={handleGenerateReport}
                    isGenerating={isGenerating}
                  />
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reports.length === 0 ? (
                      <p className="text-sm text-gray-500">No reports generated yet</p>
                    ) : (
                      reports.map(report => (
                        <Button
                          key={report.id}
                          variant={selectedReport?.id === report.id ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{report.title}</div>
                            <div className="text-xs text-gray-500">
                              {report.createdAt.toLocaleString()}
                            </div>
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Report Viewer</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReport ? (
                    <ReportViewer report={selectedReport} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Select a report to view or generate a new one
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

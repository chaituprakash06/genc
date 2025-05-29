// components/disputes/report-viewer.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Calendar } from 'lucide-react'
import { Report } from '@/lib/services/dispute-service'
import ReactMarkdown from 'react-markdown'

interface ReportViewerProps {
  report: Report
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const handleDownloadPDF = () => {
    // For now, we'll create a simple text file
    // In production, you'd use a library like jsPDF or react-pdf
    const blob = new Blob([report.analysis], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dispute-report-${report.id}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          Generated on {new Date(report.createdAt).toLocaleString()}
        </div>
        <Button onClick={handleDownloadPDF} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dispute Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>
              {report.analysis}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

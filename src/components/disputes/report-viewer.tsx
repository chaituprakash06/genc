// components/disputes/report-viewer.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Calendar } from 'lucide-react'
import { Report } from '@/lib/services/dispute-service'
import { Json } from '@/lib/database.types'

interface ReportViewerProps {
  report: Report
}

export default function ReportViewer({ report }: ReportViewerProps) {
  // Helper function to safely parse JSON fields
  const parseJsonField = (field: Json): any => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch {
        return field
      }
    }
    return field
  }

  // Format the report content for display/download
  const formatReportContent = () => {
    const sections = [
      `# ${report.title}`,
      '',
      `**Report Type:** ${report.report_type}`,
      `**Generated:** ${new Date(report.created_at).toLocaleString()}`,
      '',
      '## Summary',
      report.summary || 'No summary available.',
      '',
      '## Strengths',
      JSON.stringify(parseJsonField(report.strengths), null, 2),
      '',
      '## Weaknesses',
      JSON.stringify(parseJsonField(report.weaknesses), null, 2),
      '',
      '## Opportunities',
      JSON.stringify(parseJsonField(report.opportunities), null, 2),
      '',
      '## Risks',
      JSON.stringify(parseJsonField(report.risks), null, 2),
      '',
      '## Negotiation Strategies',
      JSON.stringify(parseJsonField(report.negotiation_strategies), null, 2),
      '',
      '## Key Terms',
      JSON.stringify(parseJsonField(report.key_terms), null, 2),
      '',
      '## Recommendations',
      JSON.stringify(parseJsonField(report.recommendations), null, 2)
    ]
    
    return sections.join('\n')
  }

  const handleDownloadPDF = () => {
    // For now, we'll create a simple text file
    // In production, you'd use a library like jsPDF or react-pdf
    const content = formatReportContent()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dispute-report-${report.id}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Render individual sections
  const renderSection = (title: string, content: Json) => {
    const parsed = parseJsonField(content)
    
    if (Array.isArray(parsed)) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <ul className="list-disc list-inside space-y-1">
            {parsed.map((item, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      )
    }
    
    if (typeof parsed === 'object' && parsed !== null) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        </div>
      )
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300">{String(parsed)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          Generated on {new Date(report.created_at).toLocaleString()}
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
            {report.title}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Type: {report.report_type}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
              </div>
            )}
            
            {renderSection('Strengths', report.strengths)}
            {renderSection('Weaknesses', report.weaknesses)}
            {renderSection('Opportunities', report.opportunities)}
            {renderSection('Risks', report.risks)}
            {renderSection('Negotiation Strategies', report.negotiation_strategies)}
            {renderSection('Key Terms', report.key_terms)}
            {renderSection('Recommendations', report.recommendations)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
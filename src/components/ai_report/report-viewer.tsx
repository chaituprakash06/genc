// components/report/report-viewer.tsx
'use client'

import { Report } from '@/app/project/ai_report/page'
import { Button } from '@/components/ui/button'

interface ReportViewerProps {
  report: Report
}

export default function ReportViewer({ report }: ReportViewerProps) {
  if (report.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Generating your report...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          This may take a few moments
        </p>
      </div>
    )
  }

  if (report.status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error generating report. Please try again.
        </p>
      </div>
    )
  }

  if (!report.content) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{report.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generated on {report.createdAt.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            Share
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Executive Summary</h3>
        <p className="text-sm">{report.content.summary}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
        <ul className="space-y-2">
          {report.content.keyFindings.map((finding, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-sm">{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
            Risks
          </h3>
          <div className="space-y-2">
            {report.content.risks.map((risk, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-950 p-3 rounded">
                <p className="text-sm">{risk}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
            Opportunities
          </h3>
          <div className="space-y-2">
            {report.content.opportunities.map((opportunity, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-950 p-3 rounded">
                <p className="text-sm">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
        <div className="space-y-3">
          {report.content.recommendations.map((rec, index) => (
            <div key={index} className="border-l-4 border-blue-600 pl-4">
              <p className="font-medium">Recommendation {index + 1}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button className="mr-2">
          Start Negotiation Chat
        </Button>
        <Button variant="outline">
          Request Human Review
        </Button>
      </div>
    </div>
  )
}

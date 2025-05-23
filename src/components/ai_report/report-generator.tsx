// components/report/report-generator.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ReportGeneratorProps {
  onGenerate: (documentIds: string[]) => void
  isGenerating: boolean
}

export default function ReportGenerator({ onGenerate, isGenerating }: ReportGeneratorProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  
  // Mock documents - in real app, fetch from API
  const mockDocuments = [
    { id: '1', name: 'Service Agreement 2024.pdf' },
    { id: '2', name: 'NDA_Company_X.docx' },
    { id: '3', name: 'Purchase_Order_Terms.pdf' },
  ]

  const handleGenerate = () => {
    if (selectedDocs.length > 0) {
      onGenerate(selectedDocs)
    }
  }

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Select Documents to Analyze</h3>
        <div className="space-y-2">
          {mockDocuments.map(doc => (
            <div key={doc.id} className="flex items-center space-x-2">
              <Checkbox
                id={doc.id}
                checked={selectedDocs.includes(doc.id)}
                onCheckedChange={() => toggleDocument(doc.id)}
                disabled={isGenerating}
              />
              <Label 
                htmlFor={doc.id} 
                className="text-sm cursor-pointer flex-1"
              >
                {doc.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Report Options</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="detailed" defaultChecked disabled={isGenerating} />
            <Label htmlFor="detailed" className="text-sm">
              Include detailed clause analysis
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="risks" defaultChecked disabled={isGenerating} />
            <Label htmlFor="risks" className="text-sm">
              Highlight risks and opportunities
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="comparison" disabled={isGenerating} />
            <Label htmlFor="comparison" className="text-sm">
              Compare with industry standards
            </Label>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleGenerate}
        disabled={selectedDocs.length === 0 || isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating Report...' : 'Generate Report'}
      </Button>
    </div>
  )
}

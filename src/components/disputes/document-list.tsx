// components/disputes/document-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, Trash2, Clock } from 'lucide-react'
import { DisputeService, Document } from '@/lib/services/dispute-service'

interface DocumentListProps {
  disputeId: string
  onDocumentChange?: () => void
}

export default function DocumentList({ disputeId, onDocumentChange }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const docs = DisputeService.getDocuments(disputeId)
    setDocuments(docs)
  }, [disputeId])

  const loadDocuments = () => {
    const docs = DisputeService.getDocuments(disputeId)
    setDocuments(docs)
  }

  const handleDelete = (docId: string) => {
    DisputeService.deleteDocument(docId, disputeId)
    loadDocuments()
    if (onDocumentChange) {
      onDocumentChange()
    }
  }

  const handleDownload = (doc: Document) => {
    // Create a blob from the content
    const blob = new Blob([doc.content || ''], { type: doc.type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No documents uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{doc.size}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

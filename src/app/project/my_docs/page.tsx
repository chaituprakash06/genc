// app/project/my_docs/page.tsx
'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import DocumentUpload from '@/components/my_docs/document-upload'
import DocumentList from '@/components/my_docs/document-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
}

export default function MyDocsPage() {
  const [documents, setDocuments] = useState<Document[]>([])

  const handleUpload = (newDocs: Document[]) => {
    setDocuments(prev => [...prev, ...newDocs])
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Documents</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and manage your contract documents for AI analysis
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload onUpload={handleUpload} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={documents} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

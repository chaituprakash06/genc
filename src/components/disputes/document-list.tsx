// components/disputes/document-list.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, Trash2, Clock, Loader2 } from 'lucide-react'
import { DisputeService } from '@/lib/services/dispute-service'
import { createClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'

type Document = Database['public']['Tables']['user_documents']['Row']

interface DocumentListProps {
  disputeId: string
  documents?: Document[] // Optional prop if parent already has documents
  onDocumentChange?: () => void
}

export default function DocumentList({ disputeId, documents: propDocuments, onDocumentChange }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>(propDocuments || [])
  const [loading, setLoading] = useState(!propDocuments)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const docs = await DisputeService.getDocuments(disputeId)
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }, [disputeId])

  useEffect(() => {
    if (!propDocuments) {
      loadDocuments()
    }
  }, [propDocuments, loadDocuments])

  useEffect(() => {
    if (propDocuments) {
      setDocuments(propDocuments)
    }
  }, [propDocuments])

  const handleDelete = async (docId: string) => {
    setDeletingId(docId)
    try {
      // Get document details first
      const doc = documents.find(d => d.id === docId)
      
      if (doc) {
        // Delete from storage if file exists
        if (doc.file_path) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([doc.file_path])
          
          if (storageError) {
            console.error('Error deleting from storage:', storageError)
          }
        }
      }

      // Delete from database
      const success = await DisputeService.deleteDocument(docId, disputeId)
      
      if (success) {
        if (!propDocuments) {
          await loadDocuments()
        }
        if (onDocumentChange) {
          onDocumentChange()
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path)

      if (error) {
        console.error('Error downloading from storage:', error)
        alert('Failed to download document. Please try again.')
        return
      }

      // Create download link
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document. Please try again.')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
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
        <Card key={doc.id} className={deletingId === doc.id ? 'opacity-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(doc)}
                  disabled={deletingId === doc.id}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
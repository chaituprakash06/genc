// components/disputes/document-list.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, Trash2, Clock, Calendar, Loader2, Eye } from 'lucide-react'
import { DisputeService } from '@/lib/services/dispute-service'
import { createClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'

// Use the database type directly
type Document = Database['public']['Tables']['user_documents']['Row']

interface DocumentListProps {
  disputeId: string
  documents?: Document[]
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
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('dispute_id', disputeId)
      
      if (error) throw error
      
      // Sort by file_name in descending order (newest dates first)
      const sorted = (data || []).sort((a, b) => {
        // Extract dates from filenames if they exist
        const dateA = a.file_name.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
        const dateB = b.file_name.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
        
        // If both have dates, compare them (descending)
        if (dateA && dateB) {
          return dateB.localeCompare(dateA)
        }
        // If only one has a date, it comes first
        if (dateA) return -1
        if (dateB) return 1
        // Otherwise, compare full filenames (descending)
        return b.file_name.localeCompare(a.file_name)
      })
      
      setDocuments(sorted)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }, [disputeId, supabase])

  useEffect(() => {
    if (!propDocuments) {
      loadDocuments()
    }
  }, [propDocuments, loadDocuments])

  useEffect(() => {
    if (propDocuments) {
      // Sort by extracting dates from filenames
      const sorted = [...propDocuments].sort((a, b) => {
        // Extract dates from filenames if they exist
        const dateA = a.file_name.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
        const dateB = b.file_name.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
        
        // If both have dates, compare them (descending - newest first)
        if (dateA && dateB) {
          return dateB.localeCompare(dateA)
        }
        // If only one has a date, it comes first
        if (dateA) return -1
        if (dateB) return 1
        // Otherwise, compare full filenames (descending)
        return b.file_name.localeCompare(a.file_name)
      })
      setDocuments(sorted)
    }
  }, [propDocuments])

  const handleDelete = async (docId: string) => {
    setDeletingId(docId)
    try {
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
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path)

      if (error) {
        console.error('Error downloading from storage:', error)
        alert('Failed to download document. Please try again.')
        return
      }

      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.original_name || doc.file_name  // Use original name for download if available
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document. Please try again.')
    }
  }

  const handlePreview = async (doc: Document) => {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(doc.file_path)
      
      window.open(data.publicUrl, '_blank')
    } catch (error) {
      console.error('Error getting preview URL:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('doc')) return '📝'
    if (mimeType.includes('text')) return '📃'
    return '📎'
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
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{getFileIcon(doc.mime_type)}</span>
                <div className="flex-1">
                  <p className="font-medium">
                    {doc.file_name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(doc.file_size)}</span>
                    
                    {doc.document_type && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {doc.document_type}
                      </span>
                    )}
                    
                    {doc.extracted_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {doc.extracted_date ? formatDate(doc.extracted_date) : 'Unknown'}
                        {doc.extraction_confidence === 'low' && (
                          <span className="text-yellow-600 ml-1">(estimated)</span>
                        )}
                      </span>
                    )}
                    
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Uploaded {doc.uploaded_at ? formatDate(doc.uploaded_at) : 'Unknown'}
                    </span>
                    
                    {doc.processed_at && (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ AI Processed
                      </span>
                    )}
                  </div>
                  
                  {doc.original_name && doc.original_name !== doc.file_name && (
                    <p className="text-xs text-gray-400 mt-1">
                      Original: {doc.original_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.mime_type.includes('pdf') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreview(doc)}
                    disabled={deletingId === doc.id}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
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
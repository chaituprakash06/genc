// components/disputes/document-upload.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, Loader2, RefreshCw } from 'lucide-react'
import { DisputeService } from '@/lib/services/dispute-service'
import { createClient } from '@/lib/supabase-browser'
import { DocumentProcessor } from '@/lib/services/document-processor'

interface DocumentUploadProps {
  disputeId: string
  onUploadComplete?: () => void
}

export default function DocumentUpload({ disputeId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setProcessing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Process each file
      for (const file of selectedFiles) {
        // First, process the document to extract date and generate new name
        const processed = await DocumentProcessor.processDocument(
          file, 
          user.id, 
          disputeId
        )

        // Upload file to Supabase Storage with the new name
        const fileName = `${user.id}/${disputeId}/${processed.newName}`
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError)
          throw uploadError
        }

        // Save document metadata to database with extracted information
        const document = await DisputeService.uploadDocument({
          dispute_id: disputeId,
          file_name: processed.newName,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          extracted_date: processed.extractedDate?.toISOString(),
          document_type: processed.documentType,
          extraction_confidence: processed.confidence,
          processed_at: new Date().toISOString(),
          original_name: file.name
        })

        if (!document) {
          throw new Error('Failed to save document metadata')
        }
      }
      
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const handleReprocessDocuments = async () => {
    setProcessing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      await DocumentProcessor.reprocessDisputeDocuments(disputeId, user.id)
      
      if (onUploadComplete) {
        onUploadComplete()
      }
      
      alert('Documents reprocessed successfully!')
    } catch (error) {
      console.error('Error reprocessing documents:', error)
      alert('Failed to reprocess documents. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReprocessDocuments}
          disabled={processing}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reprocess All Documents
            </>
          )}
        </Button>
      </div>

      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOC, DOCX, TXT up to 10MB
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Documents will be automatically dated and renamed
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              className="w-full mt-4"
              onClick={handleUpload}
              disabled={uploading || processing}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {processing ? 'Processing & Uploading...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
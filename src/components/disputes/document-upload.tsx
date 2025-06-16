// components/disputes/document-upload.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, Loader2, RefreshCw } from 'lucide-react'
import { DisputeService } from '@/lib/services/dispute-service'
import { createClient } from '@/lib/supabase-browser'

interface DocumentUploadProps {
  disputeId: string
  onUploadComplete?: () => void
}

interface ProcessedDocument {
  originalName: string
  newName: string
  extractedDate: Date | null
  content: string
  documentType: string
  confidence: 'high' | 'medium' | 'low'
}

export default function DocumentUpload({ disputeId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Helper function to extract text content
  const extractTextContent = async (file: File): Promise<string> => {
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      return await file.text()
    }
    // For other files, return a placeholder
    return `[Content of ${file.name} - ${file.type}]`
  }

  // Helper function to extract document info using AI
  const extractDocumentInfo = async (content: string, fileName: string): Promise<{
    documentType: string
    extractedDate: Date | null
    confidence: 'high' | 'medium' | 'low'
  }> => {
    try {
      const response = await fetch('/api/ai/extract-document-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, fileName })
      })
      
      if (!response.ok) throw new Error('Document info extraction failed')
      
      const { documentType, date, confidence } = await response.json()
      return {
        documentType: documentType || 'Unknown',
        extractedDate: date ? new Date(date) : null,
        confidence: confidence || 'low'
      }
    } catch (error) {
      console.error('Error extracting document info:', error)
      // Fallback to basic extraction
      return {
        documentType: guessDocumentType(fileName),
        extractedDate: new Date(),
        confidence: 'low'
      }
    }
  }

  // Helper function to guess document type from filename
  const guessDocumentType = (fileName: string): string => {
    const lowerName = fileName.toLowerCase()
    
    if (lowerName.includes('contract')) return 'Contract'
    if (lowerName.includes('agreement')) return 'Agreement'
    if (lowerName.includes('invoice')) return 'Invoice'
    if (lowerName.includes('receipt')) return 'Receipt'
    if (lowerName.includes('letter')) return 'Letter'
    if (lowerName.includes('memo')) return 'Memo'
    if (lowerName.includes('report')) return 'Report'
    if (lowerName.includes('statement')) return 'Statement'
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'PDF Document'
    if (ext === 'doc' || ext === 'docx') return 'Word Document'
    if (ext === 'txt') return 'Text Document'
    
    return 'Document'
  }

  // Helper function to generate new filename with date prefix
  const generateNewFileName = (originalName: string, date: Date | null): string => {
    const baseDate = date || new Date()
    const dateStr = baseDate.toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Remove any existing date prefix
    const cleanName = originalName.replace(/^\d{4}-\d{2}-\d{2}_/, '')
    
    return `${dateStr}_${cleanName}`
  }

  // Process a single document
  const processDocument = async (file: File): Promise<ProcessedDocument> => {
    const content = await extractTextContent(file)
    const { documentType, extractedDate, confidence } = await extractDocumentInfo(content, file.name)
    const newFileName = generateNewFileName(file.name, extractedDate)
    
    return {
      originalName: file.name,
      newName: newFileName,
      extractedDate,
      content,
      documentType,
      confidence
    }
  }

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
        // Process the document to extract date and generate new name
        const processed = await processDocument(file)

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

      // Get all documents for the dispute
      const { data: documents, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('uploaded_at', { ascending: false })
      
      if (error) throw error
      
      for (const doc of documents || []) {
        // Download file from storage
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from('documents')
          .download(doc.file_path)
        
        if (downloadError || !fileBlob) {
          console.error(`Error downloading ${doc.file_name}:`, downloadError)
          continue
        }
        
        // Process document without creating a File object
        const fileName = doc.original_name || doc.file_name
        let content = ''
        
        // Extract text content based on type
        if (doc.mime_type?.includes('text') || fileName.endsWith('.txt')) {
          content = await fileBlob.text()
        } else {
          content = `[Content of ${fileName} - ${doc.mime_type}]`
        }
        
        // Extract document info
        const { documentType, extractedDate, confidence } = await extractDocumentInfo(content, fileName)
        const newFileName = generateNewFileName(fileName, extractedDate)
        
        // Generate new path
        const newPath = `${user.id}/${disputeId}/${newFileName}`
        
        // Rename file in storage if needed
        if (doc.file_path !== newPath) {
          // Upload with new name - fileBlob is already available
          await supabase.storage
            .from('documents')
            .upload(newPath, fileBlob, { upsert: true })
          
          // Delete old file
          await supabase.storage
            .from('documents')
            .remove([doc.file_path])
        }
        
        // Update database record
         const updateData: {
          file_name: string
          file_path: string
          extracted_date?: string
          document_type?: string
          extraction_confidence?: string
          processed_at?: string
          original_name?: string
        } = {
          file_name: newFileName,
          file_path: newPath,
        }

        // Only add these fields if they exist in the table
        if (extractedDate) {
          updateData.extracted_date = extractedDate.toISOString()
        }
        if (documentType) {
          updateData.document_type = documentType
        }
        if (confidence) {
          updateData.extraction_confidence = confidence
        }
        updateData.processed_at = new Date().toISOString()
        updateData.original_name = doc.original_name || doc.file_name

        await supabase
          .from('user_documents')
          .update(updateData)
          .eq('id', doc.id)
      }
      
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
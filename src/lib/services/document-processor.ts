// lib/services/document-processor.ts
import { createClient } from '@/lib/supabase-browser'
import { Document } from '@/lib/services/dispute-service'

interface ProcessedDocument {
  originalName: string
  newName: string
  extractedDate: Date | null
  content: string
  documentType: string
  confidence: 'high' | 'medium' | 'low'
}

export class DocumentProcessor {
  private static supabase = createClient()

  /**
   * Extract text content from various file types
   */
  static async extractTextContent(file: File): Promise<string> {
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      return await file.text()
    }
    
    // For PDF files
    if (file.type === 'application/pdf') {
      return await this.extractPdfText(file)
    }
    
    // For DOC/DOCX files
    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      return await this.extractDocText(file)
    }
    
    return ''
  }

  /**
   * Extract text from PDF using API endpoint
   */
  private static async extractPdfText(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('PDF extraction failed')
      
      const { text } = await response.json()
      return text
    } catch (error) {
      console.error('Error extracting PDF text:', error)
      return ''
    }
  }

  /**
   * Extract text from DOC/DOCX using API endpoint
   */
  private static async extractDocText(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/extract-doc', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('DOC extraction failed')
      
      const { text } = await response.json()
      return text
    } catch (error) {
      console.error('Error extracting DOC text:', error)
      return ''
    }
  }

  /**
   * Extract document info including type and date using AI
   */
  static async extractDocumentInfo(content: string, fileName: string): Promise<{
    documentType: string
    extractedDate: Date | null
    confidence: 'high' | 'medium' | 'low'
  }> {
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
      return {
        documentType: 'Unknown',
        extractedDate: null,
        confidence: 'low'
      }
    }
  }

  /**
   * Generate new filename with date prefix
   */
  static generateNewFileName(originalName: string, date: Date | null): string {
    const baseDate = date || new Date()
    const dateStr = baseDate.toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Remove any existing date prefix (in case of re-processing)
    const cleanName = originalName.replace(/^\d{4}-\d{2}-\d{2}_/, '')
    
    return `${dateStr}_${cleanName}`
  }

  /**
   * Process a single document
   */
  static async processDocument(
    file: File, 
    userId: string, 
    disputeId: string
  ): Promise<ProcessedDocument> {
    // Extract text content
    const content = await this.extractTextContent(file)
    
    // Extract document info using AI
    const { documentType, extractedDate, confidence } = await this.extractDocumentInfo(content, file.name)
    
    // Generate new filename
    const newFileName = this.generateNewFileName(file.name, extractedDate)
    
    return {
      originalName: file.name,
      newName: newFileName,
      extractedDate,
      content,
      documentType,
      confidence
    }
  }

  /**
   * Rename file in Supabase storage
   */
  static async renameFileInStorage(oldPath: string, newPath: string): Promise<void> {
    const { data, error: downloadError } = await this.supabase.storage
      .from('documents')
      .download(oldPath)
    
    if (downloadError) throw downloadError
    
    // Upload with new name
    const { error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(newPath, data, { upsert: true })
    
    if (uploadError) throw uploadError
    
    // Delete old file
    const { error: deleteError } = await this.supabase.storage
      .from('documents')
      .remove([oldPath])
    
    if (deleteError) {
      console.error('Error deleting old file:', deleteError)
    }
  }

  /**
   * Reprocess all documents for a dispute
   */
  static async reprocessDisputeDocuments(disputeId: string, userId: string): Promise<void> {
    try {
      // Get all documents for the dispute
      const { data: documents, error } = await this.supabase
        .from('user_documents')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('uploaded_at', { ascending: false })
      
      if (error) throw error
      
      for (const doc of documents || []) {
        // Download file from storage
        const { data, error } = await this.supabase.storage
          .from('documents')
          .download(doc.file_path)
        
        if (error) {
          console.error(`Error downloading ${doc.file_name}:`, error)
          continue
        }
        
        // Convert blob to File
        const file = new File([data], doc.file_name, { type: doc.mime_type })
        
        // Process and extract info
        const processed = await this.processDocument(file, userId, disputeId)
        
        // Generate new path
        const newPath = `${userId}/${disputeId}/${processed.newName}`
        
        // Rename file in storage if needed
        if (doc.file_path !== newPath) {
          await this.renameFileInStorage(doc.file_path, newPath)
        }
        
        // Update database record
        await this.supabase
          .from('user_documents')
          .update({
            file_name: processed.newName,
            file_path: newPath,
            processed_at: new Date().toISOString(),
            extracted_date: processed.extractedDate?.toISOString(),
            document_type: processed.documentType,
            extraction_confidence: processed.confidence,
            original_name: doc.original_name || doc.file_name
          })
          .eq('id', doc.id)
      }
    } catch (error) {
      console.error('Error reprocessing documents:', error)
      throw error
    }
  }
}
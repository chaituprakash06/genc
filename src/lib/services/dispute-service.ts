// lib/services/dispute-service.ts
import { createClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'

// Export these types so they can be imported elsewhere
export type Dispute = Database['public']['Tables']['disputes']['Row']
export type Document = Database['public']['Tables']['user_documents']['Row']
export type Report = Database['public']['Tables']['dispute_reports']['Row']

// You can also export Insert and Update types if needed elsewhere
export type DisputeInsert = Database['public']['Tables']['disputes']['Insert']
export type DisputeUpdate = Database['public']['Tables']['disputes']['Update']
export type DocumentInsert = Database['public']['Tables']['user_documents']['Insert']
export type ReportInsert = Database['public']['Tables']['dispute_reports']['Insert']

export class DisputeService {
  private static supabase = createClient()
  // Dispute methods
  static async getDisputes(): Promise<Dispute[]> {
    const { data, error } = await this.supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching disputes:', error)
      return []
    }

    return data || []
  }

  static async getDispute(id: string): Promise<Dispute | null> {
    const { data, error } = await this.supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching dispute:', error)
      return null
    }

    return data
  }

  static async createDispute(dispute: Omit<Database['public']['Tables']['disputes']['Insert'], 'user_id'>): Promise<Dispute | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await this.supabase
      .from('disputes')
      .insert({
        ...dispute,
        user_id: user.id,
        document_count: 0,
        report_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating dispute:', error)
      return null
    }

    return data
  }

  static async updateDispute(id: string, updates: Database['public']['Tables']['disputes']['Update']): Promise<Dispute | null> {
    const { data, error } = await this.supabase
      .from('disputes')
      .update({
        ...updates,
        last_modified: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating dispute:', error)
      return null
    }

    return data
  }

  static async deleteDispute(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('disputes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting dispute:', error)
      return false
    }

    return true
  }

  // Document methods
  static async getDocuments(disputeId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('user_documents')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return data || []
  }

  static async uploadDocument(document: Omit<Database['public']['Tables']['user_documents']['Insert'], 'user_id'>): Promise<Document | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await this.supabase
      .from('user_documents')
      .insert({
        ...document,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error uploading document:', error)
      return null
    }

    // Update document count
    await this.updateDocumentCount(document.dispute_id)

    return data
  }

  static async deleteDocument(id: string, disputeId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }

    // Update document count
    await this.updateDocumentCount(disputeId)

    return true
  }

  // Report methods
  static async getReports(disputeId: string): Promise<Report[]> {
    const { data, error } = await this.supabase
      .from('dispute_reports')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      return []
    }

    return data || []
  }

  static async createReport(report: Omit<Database['public']['Tables']['dispute_reports']['Insert'], 'user_id'>): Promise<Report | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await this.supabase
      .from('dispute_reports')
      .insert({
        ...report,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return null
    }

    // Update report count
    await this.updateReportCount(report.dispute_id)

    return data
  }

  // Helper methods
  static async getDisputeWithDetails(id: string) {
    const dispute = await this.getDispute(id)
    if (!dispute) return null

    const [documents, reports] = await Promise.all([
      this.getDocuments(id),
      this.getReports(id)
    ])

    return {
      ...dispute,
      documents,
      reports
    }
  }

  // Update counts
  private static async updateDocumentCount(disputeId: string) {
    const { count } = await this.supabase
      .from('user_documents')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', disputeId)

    if (count !== null) {
      await this.supabase
        .from('disputes')
        .update({ 
          document_count: count,
          last_modified: new Date().toISOString()
        })
        .eq('id', disputeId)
    }
  }

  private static async updateReportCount(disputeId: string) {
    const { count } = await this.supabase
      .from('dispute_reports')
      .select('*', { count: 'exact', head: true })
      .eq('dispute_id', disputeId)

    if (count !== null) {
      await this.supabase
        .from('disputes')
        .update({ 
          report_count: count,
          last_modified: new Date().toISOString()
        })
        .eq('id', disputeId)
    }
  }
}
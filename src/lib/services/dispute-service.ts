// lib/services/dispute-service.ts
export interface Dispute {
  id: string
  title: string
  description: string
  createdAt: Date
  lastModified: Date
  status: 'active' | 'resolved' | 'pending'
  documentCount: number
  reportCount: number
  disputeType?: string
  opposingParty?: string
  disputeValue?: string
  urgency?: string
  documents?: Document[]
  reports?: Report[]
}

export interface Document {
  id: string
  name: string
  type: string
  size: string
  content?: string
  uploadedAt: Date
  disputeId: string
}

export interface Report {
  id: string
  createdAt: Date
  analysis: string
  disputeId: string
  status: 'generating' | 'completed' | 'error'
}

export class DisputeService {
  private static DISPUTES_KEY = 'disputes'
  private static DOCUMENTS_KEY = 'documents'
  private static REPORTS_KEY = 'reports'

  // Dispute methods
  static getDisputes(): Dispute[] {
    const saved = localStorage.getItem(this.DISPUTES_KEY)
    if (!saved) return []
    
    return JSON.parse(saved).map((d: Dispute) => ({
      ...d,
      createdAt: new Date(d.createdAt),
      lastModified: new Date(d.lastModified)
    }))
  }

  static getDispute(id: string): Dispute | null {
    const disputes = this.getDisputes()
    return disputes.find(d => d.id === id) || null
  }

  static saveDispute(dispute: Dispute): void {
    const disputes = this.getDisputes()
    const index = disputes.findIndex(d => d.id === dispute.id)
    
    if (index >= 0) {
      disputes[index] = dispute
    } else {
      disputes.push(dispute)
    }
    
    localStorage.setItem(this.DISPUTES_KEY, JSON.stringify(disputes))
  }

  static deleteDispute(id: string): void {
    const disputes = this.getDisputes().filter(d => d.id !== id)
    localStorage.setItem(this.DISPUTES_KEY, JSON.stringify(disputes))
    
    // Also delete associated documents and reports
    this.deleteDocumentsByDisputeId(id)
    this.deleteReportsByDisputeId(id)
  }

  // Document methods
  static getDocuments(disputeId: string): Document[] {
    const saved = localStorage.getItem(this.DOCUMENTS_KEY)
    if (!saved) return []
    
    const allDocs = JSON.parse(saved).map((d: Document) => ({
      ...d,
      uploadedAt: new Date(d.uploadedAt)
    }))
    
    return allDocs.filter((d: Document) => d.disputeId === disputeId)
  }

  static saveDocument(document: Document): void {
    const saved = localStorage.getItem(this.DOCUMENTS_KEY)
    const documents = saved ? JSON.parse(saved) : []
    documents.push(document)
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(documents))
    
    // Update dispute document count
    const dispute = this.getDispute(document.disputeId)
    if (dispute) {
      dispute.documentCount = this.getDocuments(document.disputeId).length
      dispute.lastModified = new Date()
      this.saveDispute(dispute)
    }
  }

  static deleteDocument(id: string, disputeId: string): void {
    const saved = localStorage.getItem(this.DOCUMENTS_KEY)
    if (!saved) return
    
    const documents = JSON.parse(saved).filter((d: Document) => d.id !== id)
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(documents))
    
    // Update dispute document count
    const dispute = this.getDispute(disputeId)
    if (dispute) {
      dispute.documentCount = this.getDocuments(disputeId).length
      dispute.lastModified = new Date()
      this.saveDispute(dispute)
    }
  }

  static deleteDocumentsByDisputeId(disputeId: string): void {
    const saved = localStorage.getItem(this.DOCUMENTS_KEY)
    if (!saved) return
    
    const documents = JSON.parse(saved).filter((d: Document) => d.disputeId !== disputeId)
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(documents))
  }

  // Report methods
  static getReports(disputeId: string): Report[] {
    const saved = localStorage.getItem(this.REPORTS_KEY)
    if (!saved) return []
    
    const allReports = JSON.parse(saved).map((r: Report) => ({
      ...r,
      createdAt: new Date(r.createdAt)
    }))
    
    return allReports.filter((r: Report) => r.disputeId === disputeId)
  }

  static saveReport(report: Report): void {
    const saved = localStorage.getItem(this.REPORTS_KEY)
    const reports = saved ? JSON.parse(saved) : []
    reports.push(report)
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports))
    
    // Update dispute report count
    const dispute = this.getDispute(report.disputeId)
    if (dispute) {
      dispute.reportCount = this.getReports(report.disputeId).length
      dispute.lastModified = new Date()
      this.saveDispute(dispute)
    }
  }

  static deleteReportsByDisputeId(disputeId: string): void {
    const saved = localStorage.getItem(this.REPORTS_KEY)
    if (!saved) return
    
    const reports = JSON.parse(saved).filter((r: Report) => r.disputeId !== disputeId)
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports))
  }
}

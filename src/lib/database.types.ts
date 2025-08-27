export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string | null
          dispute_id: string
          id: string
          last_message_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dispute_id: string
          id?: string
          last_message_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dispute_id?: string
          id?: string
          last_message_at?: string | null
          user_id?: string
        }
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          dispute_id: string
          id: string
          role: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          dispute_id: string
          id?: string
          role: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          dispute_id?: string
          id?: string
          role?: string
          sources?: Json | null
          user_id?: string
        }
      }
      collaborator_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          dispute_id: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          dispute_id: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          dispute_id?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
      }
      dispute_collaborators: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          dispute_id: string
          email: string
          id: string
          invited_at: string | null
          invited_by: string
          permissions: Json | null
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          dispute_id: string
          email: string
          id?: string
          invited_at?: string | null
          invited_by: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          dispute_id?: string
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
      }
      dispute_reports: {
        Row: {
          created_at: string | null
          dispute_id: string
          id: string
          key_terms: Json | null
          negotiation_strategies: Json | null
          opportunities: Json | null
          recommendations: Json | null
          report_type: string
          risks: Json | null
          strengths: Json | null
          summary: string | null
          title: string
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          created_at?: string | null
          dispute_id: string
          id?: string
          key_terms?: Json | null
          negotiation_strategies?: Json | null
          opportunities?: Json | null
          recommendations?: Json | null
          report_type?: string
          risks?: Json | null
          strengths?: Json | null
          summary?: string | null
          title: string
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          created_at?: string | null
          dispute_id?: string
          id?: string
          key_terms?: Json | null
          negotiation_strategies?: Json | null
          opportunities?: Json | null
          recommendations?: Json | null
          report_type?: string
          risks?: Json | null
          strengths?: Json | null
          summary?: string | null
          title?: string
          user_id?: string
          weaknesses?: Json | null
        }
      }
      disputes: {
        Row: {
          created_at: string | null
          description: string
          dispute_type: string | null
          dispute_value: number | null
          document_count: number | null
          id: string
          last_modified: string | null
          opposing_party: string | null
          report_count: number | null
          status: string
          title: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          dispute_type?: string | null
          dispute_value?: number | null
          document_count?: number | null
          id?: string
          last_modified?: string | null
          opposing_party?: string | null
          report_count?: number | null
          status?: string
          title: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          dispute_type?: string | null
          dispute_value?: number | null
          document_count?: number | null
          id?: string
          last_modified?: string | null
          opposing_party?: string | null
          report_count?: number | null
          status?: string
          title?: string
          urgency?: string | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
      }
      user_document_chunks: {
        Row: {
          chunk_index: number | null
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          page_number: number | null
          user_id: string
        }
        Insert: {
          chunk_index?: number | null
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          page_number?: number | null
          user_id: string
        }
        Update: {
          chunk_index?: number | null
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          page_number?: number | null
          user_id?: string
        }
      }
      user_documents: {
        Row: {
          dispute_id: string
          document_type: string | null
          extracted_date: string | null
          extraction_confidence: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          original_name: string | null
          processed_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          dispute_id: string
          document_type?: string | null
          extracted_date?: string | null
          extraction_confidence?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          original_name?: string | null
          processed_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          dispute_id?: string
          document_type?: string | null
          extracted_date?: string | null
          extraction_confidence?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_name?: string | null
          processed_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
      }
    }
  }
}
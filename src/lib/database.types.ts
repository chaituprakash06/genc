// lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      disputes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          dispute_type: string | null
          opposing_party: string | null
          dispute_value: number | null
          urgency: string | null
          status: string
          created_at: string
          last_modified: string
          document_count: number | null
          report_count: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          dispute_type?: string | null
          opposing_party?: string | null
          dispute_value?: number | null
          urgency?: string | null
          status?: string
          created_at?: string
          last_modified?: string
          document_count?: number | null
          report_count?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          dispute_type?: string | null
          opposing_party?: string | null
          dispute_value?: number | null
          urgency?: string | null
          status?: string
          created_at?: string
          last_modified?: string
          document_count?: number | null
          report_count?: number | null
        }
      }
      user_documents: {
        Row: {
          id: string
          dispute_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          dispute_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          dispute_id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          uploaded_at?: string
        }
      }
      user_document_chunks: {
        Row: {
          id: string
          document_id: string
          user_id: string
          content: string
          embedding: string | null
          page_number: number | null
          chunk_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          content: string
          embedding?: string | null
          page_number?: number | null
          chunk_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          content?: string
          embedding?: string | null
          page_number?: number | null
          chunk_index?: number | null
          created_at?: string
        }
      }
      dispute_reports: {
        Row: {
          id: string
          dispute_id: string
          user_id: string
          report_type: string
          title: string
          summary: string | null
          strengths: Json | null
          weaknesses: Json | null
          opportunities: Json | null
          risks: Json | null
          negotiation_strategies: Json | null
          key_terms: Json | null
          recommendations: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          dispute_id: string
          user_id: string
          report_type?: string
          title: string
          summary?: string | null
          strengths?: Json | null
          weaknesses?: Json | null
          opportunities?: Json | null
          risks?: Json | null
          negotiation_strategies?: Json | null
          key_terms?: Json | null
          recommendations?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          dispute_id?: string
          user_id?: string
          report_type?: string
          title?: string
          summary?: string | null
          strengths?: Json | null
          weaknesses?: Json | null
          opportunities?: Json | null
          risks?: Json | null
          negotiation_strategies?: Json | null
          key_terms?: Json | null
          recommendations?: Json | null
          created_at?: string
        }
      }
      chat_conversations: {
        Row: {
          id: string
          dispute_id: string
          user_id: string
          created_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          dispute_id: string
          user_id: string
          created_at?: string
          last_message_at?: string
        }
        Update: {
          id?: string
          dispute_id?: string
          user_id?: string
          created_at?: string
          last_message_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          dispute_id: string
          user_id: string
          role: string
          content: string
          sources: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          dispute_id: string
          user_id: string
          role: string
          content: string
          sources?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          dispute_id?: string
          user_id?: string
          role?: string
          content?: string
          sources?: Json | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
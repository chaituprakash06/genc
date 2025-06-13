// lib/services/chat-service.ts
import { createClient } from '@/lib/supabase-browser'
import { Database, Json } from '@/lib/database.types'
import { RealtimeChannel } from '@supabase/supabase-js'

type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type ChatConversation = Database['public']['Tables']['chat_conversations']['Row']

export class ChatService {
  private static supabase = createClient()
  private static subscriptions: Map<string, RealtimeChannel> = new Map()

  // Conversation methods
  static async getConversations(disputeId: string): Promise<ChatConversation[]> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return []
    }

    return data || []
  }

  static async createConversation(disputeId: string): Promise<ChatConversation | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await this.supabase
      .from('chat_conversations')
      .insert({
        dispute_id: disputeId,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error.message, error.details, error.hint)
      return null
    }

    return data
  }

  static async getOrCreateConversation(disputeId: string): Promise<ChatConversation | null> {
    // First, try to get existing conversation
    const conversations = await this.getConversations(disputeId)
    
    if (conversations.length > 0) {
      return conversations[0]
    }
    
    // If no conversation exists, create one
    return await this.createConversation(disputeId)
  }

  // Message methods
  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data || []
  }

  static async sendMessage(
    conversationId: string,
    disputeId: string, 
    content: string, 
    role: 'user' | 'assistant',
    sources?: Json
  ): Promise<ChatMessage | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        dispute_id: disputeId,
        user_id: user.id,
        content,
        role,
        sources: sources || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return null
    }

    // Update conversation's last_message_at
    await this.supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  }

  // Real-time subscription for live chat
  static subscribeToMessages(
    conversationId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    // Clean up existing subscription
    const existingChannel = this.subscriptions.get(conversationId)
    if (existingChannel) {
      existingChannel.unsubscribe()
    }

    // Create new subscription
    const channel = this.supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: any) => {
          onMessage(payload.new as ChatMessage)
        }
      )
      .subscribe()

    this.subscriptions.set(conversationId, channel)

    // Return cleanup function
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete(conversationId)
    }
  }

  // Get all messages for a dispute (across all conversations)
  static async getDisputeMessages(disputeId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching dispute messages:', error)
      return []
    }

    return data || []
  }

  // Clean up all subscriptions
  static cleanup() {
    this.subscriptions.forEach(channel => channel.unsubscribe())
    this.subscriptions.clear()
  }
}
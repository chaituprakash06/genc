// components/disputes/dispute-chat.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Loader2, Book } from 'lucide-react'
import { ChatService } from '@/lib/services/chat-service'
import { Database, Json } from '@/lib/database.types'

type Dispute = Database['public']['Tables']['disputes']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type ChatConversation = Database['public']['Tables']['chat_conversations']['Row']

interface MessageSource {
  content: string
  source: string
  page: number
}

interface DisputeChatProps {
  dispute: Dispute
}

export default function DisputeChat({ dispute }: DisputeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showSources, setShowSources] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChat = useCallback(async () => {
    setIsInitializing(true)
    try {
      const conv = await ChatService.getOrCreateConversation(dispute.id)
      
      if (conv) {
        setConversation(conv)
        const existingMessages = await ChatService.getMessages(conv.id)
        
        // If no messages exist, add a welcome message
        if (existingMessages.length === 0) {
          const welcomeMessage = await ChatService.sendMessage(
            conv.id,
            dispute.id,
            `Hi! I'm your AI negotiation advisor. I have access to negotiation strategies and can help you with "${dispute.title}". What would you like to know?`,
            'assistant'
          )
          if (welcomeMessage) {
            setMessages([welcomeMessage])
          }
        } else {
          setMessages(existingMessages)
        }
        
        // Subscribe to new messages
        unsubscribeRef.current = ChatService.subscribeToMessages(
        conv.id,
        (newMessage: ChatMessage) => {
            setMessages(prev => [...prev, newMessage])
        }
        )
      } else {
        console.error('Failed to create or get conversation')
        // Show error state to user
        setMessages([{
          id: 'error',
          conversation_id: '',
          dispute_id: dispute.id,
          user_id: '',
          role: 'assistant',
          content: 'Sorry, I encountered an error initializing the chat. Please refresh the page and try again.',
          sources: null,
          created_at: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      setMessages([{
        id: 'error',
        conversation_id: '',
        dispute_id: dispute.id,
        user_id: '',
        role: 'assistant',
        content: 'Sorry, I encountered an error initializing the chat. Please refresh the page and try again.',
        sources: null,
        created_at: new Date().toISOString()
      }])
    } finally {
      setIsInitializing(false)
    }
  }, [dispute.id, dispute.title])

  useEffect(() => {
    initializeChat()
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [initializeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !conversation) return

    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Send user message
      const userMessage = await ChatService.sendMessage(
        conversation.id,
        dispute.id,
        userInput,
        'user'
      )

      if (!userMessage) throw new Error('Failed to send message')

      // Get AI response
      const response = await fetch('/api/dispute-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          disputeDetails: dispute,
          conversationId: conversation.id,
          messageHistory: messages.slice(-10) // Last 10 messages for context
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      // Send AI response with sources
      await ChatService.sendMessage(
        conversation.id,
        dispute.id,
        data.content,
        'assistant',
        data.sources
      )
    } catch (error) {
      console.error('Chat error:', error)
      await ChatService.sendMessage(
        conversation.id,
        dispute.id,
        'Sorry, I encountered an error. Please try again.',
        'assistant'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const parseMessageSources = (sources: Json | null): MessageSource[] | null => {
  if (!sources) return null
  
  // Handle different source formats
  if (Array.isArray(sources)) {
    // Validate that each item in the array has the required properties
    const isValidSourceArray = sources.every(
      (item) => 
        typeof item === 'object' && 
        item !== null &&
        'content' in item && 
        'source' in item && 
        'page' in item
    )
    
    if (isValidSourceArray) {
        return sources as unknown as MessageSource[]
    }
    return null
  }
  
  // If sources is a JSON string
  if (typeof sources === 'string') {
    try {
      const parsed = JSON.parse(sources)
      if (Array.isArray(parsed)) {
        // Recursively call to validate the parsed array
        return parseMessageSources(parsed)
      }
      return null
    } catch {
      return null
    }
  }
  
  return null
}

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const sources = parseMessageSources(message.sources)
          
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                    ) : (
                    <img 
                        src="/robot-avatar.png"  // Replace with your PNG file path
                        alt="AI Assistant"
                        className="w-5 h-5 object-cover"
                    />
                    )}
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Sources */}
                  {sources && sources.length > 0 && (
                    <div className="px-2">
                      <button
                        onClick={() => setShowSources(showSources === message.id ? null : message.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Book className="w-3 h-3" />
                        {sources.length} source{sources.length > 1 ? 's' : ''} referenced
                      </button>
                      
                      {showSources === message.id && (
                        <div className="mt-2 space-y-2">
                          {sources.map((source, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-xs">
                              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                {source.source} - Page {source.page}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 line-clamp-3">
                                {source.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="px-2 text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center overflow-hidden">
                <img 
                    src="/robot-avatar.png"  // Same PNG file path
                    alt="AI Assistant"
                    className="w-8 h-8 object-cover"
                />
                </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about negotiation strategies, tactics, or get advice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          AI will search negotiation strategies from the knowledge base to provide relevant advice
        </p>
      </form>
    </div>
  )
}
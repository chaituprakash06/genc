// app/api/dispute-chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface Message {
  role: string
  content: string
}

interface DisputeDetails {
  id: string
  title: string
  description: string
  disputeType?: string
  opposingParty?: string
  disputeValue?: string
  urgency?: string
}

interface SearchResult {
  chunk_id: string
  document_id: string
  content: string
  page_number: number
  similarity: number
  document_title: string
}

interface Source {
  content: string
  source: string
  page: number
}

export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('Supabase credentials not set')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { message, disputeDetails, messageHistory }: {
      message: string
      disputeDetails: DisputeDetails
      messageHistory: Message[]
    } = await request.json()

    console.log('Processing chat request for dispute:', disputeDetails.title)

    // Create search query combining user message and dispute context
    const searchQuery = `${message} ${disputeDetails.title} ${disputeDetails.description}`
    
    let context = ''
    const sources: Source[] = []
    
    try {
      // Generate embedding for search
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: searchQuery
      })
      
      const queryEmbedding = embeddingResponse.data[0].embedding
      
      // Search for relevant chunks
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_documents', {
          query_embedding: queryEmbedding,
          match_count: 3
        })
      
      if (searchError) {
        console.error('Supabase search error:', searchError)
        // Continue without RAG if search fails
      } else {
        const typedResults = searchResults as SearchResult[] | null
        
        if (typedResults && typedResults.length > 0) {
          context = '\n\nRelevant information from knowledge base:\n' +
            typedResults.map((result: SearchResult, idx: number) => {
              sources.push({
                content: result.content,
                source: result.document_title,
                page: result.page_number
              })
              return `[${idx + 1}] ${result.content}`
            }).join('\n\n')
        }
      }
    } catch (embeddingError) {
      console.error('Embedding generation error:', embeddingError)
      // Continue without embeddings if they fail
    }

    // Build conversation history for context
    const conversationHistory = messageHistory
      .filter((msg: Message) => msg.role !== 'system')
      .slice(-5) // Keep last 5 messages for context
      .map((msg: Message) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

    // Generate response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a general counsel and expert negotiation strategist. Your role is to help the user gain the upper hand in their dispute through strategic advice based on game theory and proven negotiation tactics.

Dispute Context:
- Title: ${disputeDetails.title}
- Description: ${disputeDetails.description}
${disputeDetails.disputeType ? `- Type: ${disputeDetails.disputeType}` : ''}
${disputeDetails.opposingParty ? `- Opposing Party: ${disputeDetails.opposingParty}` : ''}
${disputeDetails.disputeValue ? `- Estimated Value: ${disputeDetails.disputeValue}` : ''}
${disputeDetails.urgency ? `- Urgency Level: ${disputeDetails.urgency}` : ''}

Key Considerations:
- Whether they're disputing with an individual or company (${disputeDetails.opposingParty?.toLowerCase().includes('inc') || disputeDetails.opposingParty?.toLowerCase().includes('llc') || disputeDetails.opposingParty?.toLowerCase().includes('corp') ? 'likely a company' : 'assess based on context'})
- Their desired outcome (to be clarified through conversation)
- Power dynamics and leverage points

Your Approach:
1. Analyze the situation through a game theory lens - what are the incentives, alternatives, and pressure points?
2. Draw from the knowledge base of negotiation tactics and strategies, citing specific techniques with [1], [2], etc.
3. Provide actionable advice on how to gain psychological and strategic advantages
4. Suggest specific phrases, timing strategies, and negotiation choreography
5. Identify and exploit potential weaknesses in the opposing party's position
6. Always think 3-4 moves ahead - anticipate responses and counter-strategies
7. Be direct and strategic - this is about winning, not just resolving

Remember: The goal is to help the user achieve the upper hand and maximize their outcome in this negotiation.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message + context
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseContent = completion.choices[0].message.content || ''

    return NextResponse.json({
      content: responseContent,
      sources: sources
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return more specific error information
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to process chat message',
          details: error.message,
          type: error.name
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
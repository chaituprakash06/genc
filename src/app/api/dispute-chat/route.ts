// app/api/dispute-chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    const { message, disputeDetails, messageHistory }: {
      message: string
      disputeDetails: DisputeDetails
      messageHistory: Message[]
    } = await request.json()

    // Create search query combining user message and dispute context
    const searchQuery = `${message} ${disputeDetails.title} ${disputeDetails.description}`
    
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
      console.error('Search error:', searchError)
    }
    
    // Format context from search results
    let context = ''
    const sources: Source[] = []
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
          content: `You are an expert negotiation advisor helping with a dispute.
          
Dispute Context:
- Title: ${disputeDetails.title}
- Description: ${disputeDetails.description}
${disputeDetails.disputeType ? `- Type: ${disputeDetails.disputeType}` : ''}
${disputeDetails.opposingParty ? `- Opposing Party: ${disputeDetails.opposingParty}` : ''}
${disputeDetails.disputeValue ? `- Value: $${disputeDetails.disputeValue}` : ''}

When responding:
1. Use the provided context from the knowledge base when relevant
2. Cite sources using [1], [2], etc. when referencing specific information
3. Provide practical, actionable advice specific to this dispute
4. Be conversational but professional
5. If no relevant information is found in the knowledge base for a specific question, still provide general negotiation advice based on the dispute context`
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
      sources: typedResults && typedResults.length > 0 ? sources : []
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
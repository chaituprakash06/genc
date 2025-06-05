// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Document {
  name: string
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

export async function POST(request: NextRequest) {
  try {
    const { documents, disputeDetails }: { documents: Document[], disputeDetails: DisputeDetails } = await request.json()

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      )
    }

    // Combine document contents
    const documentContent = documents.map((doc: Document) => 
      `Document: ${doc.name}\nContent: ${doc.content}`
    ).join('\n\n---\n\n')

    // Create search query from dispute details
    const searchQuery = `${disputeDetails.title} ${disputeDetails.description} negotiation tactics strategy`
    
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
        match_count: 5
      })
    
    if (searchError) {
      console.error('Search error:', searchError)
      // Continue without RAG if search fails
    }
    
    // Format search results as context
    let ragContext = ''
    const typedResults = searchResults as SearchResult[] | null
    
    if (typedResults && typedResults.length > 0) {
      ragContext = '\n\nRelevant negotiation strategies from knowledge base:\n\n' +
        typedResults.map((result: SearchResult, idx: number) => 
          `[${idx + 1}] From "${result.document_title}" (Page ${result.page_number}):\n${result.content}\n`
        ).join('\n---\n')
    }

    // System prompt
    const systemPrompt = `You are an expert legal analyst specializing in dispute resolution and contract negotiation. 

${typedResults && typedResults.length > 0 ? 'Use the provided negotiation strategies from the knowledge base to support your recommendations. Cite sources using [1], [2], etc.' : ''}

Analyze the provided documents and dispute details to create a comprehensive report that includes:
1. Executive Summary
2. Key Issues Identified
3. Strengths of Your Position
4. Potential Weaknesses
5. Recommended Negotiation Strategy
6. Risk Assessment
7. Suggested Next Steps

Focus on practical, actionable advice that can strengthen the negotiating position.`

    const userPrompt = `Dispute Details:
Title: ${disputeDetails.title}
Description: ${disputeDetails.description}
Type: ${disputeDetails.disputeType || 'General'}
Opposing Party: ${disputeDetails.opposingParty || 'Not specified'}
Estimated Value: ${disputeDetails.disputeValue ? `$${disputeDetails.disputeValue}` : 'Not specified'}
Urgency: ${disputeDetails.urgency || 'Medium'}

Documents:
${documentContent}
${ragContext}

Please analyze this dispute and provide a comprehensive strategic report.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const analysis = completion.choices[0].message.content

    // Add references if we used RAG
    let finalAnalysis = analysis || ''
    if (typedResults && typedResults.length > 0) {
      const references = typedResults.map((result: SearchResult, idx: number) => 
        `[${idx + 1}] ${result.document_title}, Page ${result.page_number}`
      ).join('\n')
      
      finalAnalysis = `${analysis}\n\nReferences:\n${references}`
    }

    // Structure the response
    const report = {
      id: Date.now().toString(),
      createdAt: new Date(),
      analysis: finalAnalysis,
      disputeId: disputeDetails.id,
      status: 'completed'
    }

    return NextResponse.json({ report })

  } catch (error) {
    console.error('Error generating analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
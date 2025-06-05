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
    const systemPrompt = `You are a general counsel and master negotiation strategist. Your mission is to analyze the provided documentation and create a strategic playbook that will give your client decisive advantages in their upcoming negotiations.

${typedResults && typedResults.length > 0 ? 'Leverage the negotiation strategies and game theory principles from the knowledge base. Cite specific tactics using [1], [2], etc.' : ''}

Your analysis must focus on creating leverage and gaining the upper hand. Think like a chess grandmaster - several moves ahead.`

    const userPrompt = `I need your strategic analysis to dominate this negotiation:

DISPUTE OVERVIEW:
Title: ${disputeDetails.title}
Description: ${disputeDetails.description}
Type: ${disputeDetails.disputeType || 'General'}
Opposing Party: ${disputeDetails.opposingParty || 'Not specified'} (${disputeDetails.opposingParty?.toLowerCase().includes('inc') || disputeDetails.opposingParty?.toLowerCase().includes('llc') || disputeDetails.opposingParty?.toLowerCase().includes('corp') ? 'Corporate Entity' : 'Individual/Unknown'})
Stakes: ${disputeDetails.disputeValue ? `${disputeDetails.disputeValue}` : 'Not specified'}
Time Pressure: ${disputeDetails.urgency || 'Medium'}

DOCUMENTATION PROVIDED:
${documentContent}

STRATEGIC INTELLIGENCE:
${ragContext}

Create a comprehensive strategic report with these sections:

1. POWER DYNAMICS ASSESSMENT
   - Who currently has leverage and why
   - Hidden leverage points we can create or exploit
   - Opposing party's likely pressure points and weaknesses

2. GAME THEORY ANALYSIS
   - Best Alternative to Negotiated Agreement (BATNA) for both sides
   - Zone of Possible Agreement (ZOPA)
   - Nash equilibrium considerations
   - Information asymmetries we can exploit

3. PSYCHOLOGICAL WARFARE TACTICS
   - How to frame the negotiation to our advantage
   - Emotional triggers and cognitive biases to leverage
   - Power moves and strategic demonstrations

4. NEGOTIATION CHOREOGRAPHY
   - Optimal sequence of moves and counter-moves
   - When to be aggressive vs. collaborative
   - Specific phrases and language to use for maximum impact
   - Timing strategies (when to push, when to wait)

5. OFFENSIVE STRATEGIES
   - How to put the opposing party on the defensive
   - Creating urgency and scarcity
   - Using silence, delays, and other tactical tools
   - Coalition building and third-party leverage

6. DEFENSIVE PREPARATIONS
   - Anticipating their tactics and preparing counters
   - Protecting our vulnerabilities
   - Maintaining optionality and flexibility

7. VICTORY CONDITIONS & EXECUTION PLAN
   - Clear definition of winning outcomes (in order of preference)
   - Red lines and walk-away points
   - Specific action items for next 48 hours
   - Contingency plans for various scenarios

Remember: This is not about fair compromise - it's about maximizing our client's outcome and gaining the upper hand. Be ruthlessly strategic.`

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
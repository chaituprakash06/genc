import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase-server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { documentId, content } = await request.json()
    const supabase = createServerClient()
    
    // Split content into chunks (for large documents)
    const chunks = splitIntoChunks(content, 1000) // 1000 chars per chunk
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      // Generate embedding for the chunk
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      })
      
      // Store in your vector database
      const { error } = await supabase
        .from('document_chunks')
        .insert({
          document_id: documentId,
          chunk_index: i,
          content: chunk,
          embedding: embedding.data[0].embedding,
        })
      
      if (error) throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Embedding creation error:', error)
    return NextResponse.json({ error: 'Failed to create embeddings' }, { status: 500 })
  }
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim())
  
  return chunks
}
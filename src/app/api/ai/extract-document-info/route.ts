// app/api/ai/extract-document-info/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json()
    
    if (!content && !fileName) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }
    
    // Use AI to extract document information
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a document analyzer. Analyze documents and return information in JSON format.
          Your response must be valid JSON with this exact structure:
          {
            "documentType": "string describing the type of document",
            "date": "YYYY-MM-DD format or null",
            "confidence": "high" | "medium" | "low"
          }`
        },
        {
          role: 'user',
          content: `Analyze this document and answer:
1) What type of document was this?
2) What date was this document produced, from the pages you can read?
3) If you can't find a date, take a guess based on context clues.

Filename: ${fileName}
Content excerpt: ${content.substring(0, 3000)}

Return your response in the JSON format specified.`
        }
      ],
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    // Validate the response structure
    const documentType = result.documentType || 'Unknown Document'
    const date = result.date && /^\d{4}-\d{2}-\d{2}$/.test(result.date) ? result.date : null
    const confidence = ['high', 'medium', 'low'].includes(result.confidence) ? result.confidence : 'low'
    
    return NextResponse.json({ 
      documentType,
      date,
      confidence
    })
  } catch (error) {
    console.error('Document info extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract document information' }, { status: 500 })
  }
}
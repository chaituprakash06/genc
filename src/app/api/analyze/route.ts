// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { documents, disputeDetails } = await request.json()

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      )
    }

    // Combine document contents
    const documentContent = documents.map((doc: any) => 
      `Document: ${doc.name}\nContent: ${doc.content}`
    ).join('\n\n---\n\n')

    // System prompt for dispute analysis
    const systemPrompt = `You are an expert legal analyst specializing in dispute resolution and contract negotiation. Your role is to analyze documents and provide strategic advice to help resolve disputes efficiently.

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

    // Structure the response
    const report = {
      id: Date.now().toString(),
      createdAt: new Date(),
      analysis: analysis,
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

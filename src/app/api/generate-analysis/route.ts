// app/api/generate-analysis/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectDescription, disputeReason, desiredOutcome } = body
    
    // Validate required fields
    if (!projectDescription || !disputeReason || !desiredOutcome) {
      return NextResponse.json(
        { error: 'Missing required project information' },
        { status: 400 }
      )
    }
    
    // Prepare the prompt for OpenAI
    const prompt = `
      I need a strategic analysis for a contract negotiation or dispute. Please analyze the following details and provide strategic recommendations:
      
      Project Description: ${projectDescription}
      
      Dispute Reason: ${disputeReason}
      
      Desired Outcome: ${desiredOutcome}
      
      Please provide a structured analysis with:
      1. Two priority areas of focus
      2. For each priority:
         - Specific points to focus on
         - Potential contradictions to look for
         - Assessment of opposite party's good/bad faith
         - Areas to avoid
    `
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a contract negotiation AI assistant that provides strategic analysis for disputes and negotiations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    const analysisText = response.choices[0].message.content
    
    // In a real app, you would parse the analysis text into a structured format
    // For simplicity, we'll return a mocked structured response
    return NextResponse.json({
      strategicAnalysis: {
        priority1: {
          focus: ["Establish clear contract terms", "Identify contractual breaches"],
          contradictions: ["Opposite party contradicts themselves in following:"],
          faithAssessment: "Is opposite party acting in good faith or bad faith",
          avoid: ["Making personal accusations", "Disputing unrelated matters"]
        },
        priority2: {
          focus: ["Document all communication", "Propose reasonable solutions"],
          contradictions: ["Opposite party contradicts themselves in following:"],
          faithAssessment: "Is opposite party acting in good faith or bad faith",
          avoid: ["Threatening legal action prematurely", "Emotional arguments"]
        }
      },
      rawAnalysis: analysisText
    })
    
  } catch (error) {
    console.error('Error generating analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
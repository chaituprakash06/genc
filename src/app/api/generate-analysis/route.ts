// src/app/api/generate-analysis/route.ts
import { NextResponse } from 'next/server'

// Mock data for analysis
const mockAnalysisData = {
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
  rawAnalysis: "This is a mock analysis for development and demonstration purposes."
};

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
    
    // Log the received data for debugging
    console.log('Received project data:', {
      projectDescription: projectDescription.substring(0, 50) + '...',
      disputeReason: disputeReason.substring(0, 50) + '...',
      desiredOutcome: desiredOutcome.substring(0, 50) + '...'
    });
    
    // Return mock data for now
    // In a real implementation, this would call the OpenAI API
    return NextResponse.json(mockAnalysisData);
    
  } catch (error) {
    console.error('Error generating analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
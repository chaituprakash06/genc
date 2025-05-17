// app/project/analysis/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/navbar'

interface ProjectData {
  projectDescription: string
  disputeReason: string
  desiredOutcome: string
}

interface AnalysisResult {
  strategicAnalysis: {
    priority1: {
      focus: string[]
      contradictions: string[]
      faithAssessment: string
      avoid: string[]
    },
    priority2: {
      focus: string[]
      contradictions: string[]
      faithAssessment: string
      avoid: string[]
    }
  }
}

export default function ProjectAnalysis() {
  const router = useRouter()
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem('projectData')
    if (storedData) {
      setProjectData(JSON.parse(storedData))
      generateAnalysis(JSON.parse(storedData))
    } else {
      router.push('/project/create')
    }
  }, [router])

  const generateAnalysis = async (data: ProjectData) => {
    setIsLoading(true)
  
  try {
    // In a real app, this would be an API call to your backend which would then call OpenAI
    // For now, we'll use our mock data, but we'll reference the data parameter to avoid the ESLint error
    console.log('Generating analysis based on:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis response
    const mockAnalysis: AnalysisResult = {
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
      }
    };
    
    setAnalysis(mockAnalysis);
  } catch (error) {
    console.error('Error generating analysis:', error);
  } finally {
    setIsLoading(false);
  }
    
    // In a real implementation with OpenAI:
    /*
    try {
      const response = await fetch('/api/generate-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate analysis')
      }
      
      const analysisData = await response.json()
      setAnalysis(analysisData)
    } catch (error) {
      console.error('Error generating analysis:', error)
    } finally {
      setIsLoading(false)
    }
    */
  }

  const handleAddUpdates = () => {
    router.push('/project/update')
  }

  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF or document
    alert('Report downloaded')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 flex items-center justify-center">
          <p>Generating your strategic analysis...</p>
        </main>
      </div>
    )
  }

  if (!analysis || !projectData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Here is your strategic analysis:</h2>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="border p-4 mb-6">
              <h3 className="font-semibold mb-2">Priority 1: Areas of focus:</h3>
              <ul className="list-disc pl-6 space-y-1">
                {analysis.strategicAnalysis.priority1.focus.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                <li>
                  <span className="font-medium">Opposite party contradicts themselves in following:</span>
                </li>
                <li className="pl-4">
                  Is opposite party acting in good faith or bad faith
                </li>
              </ul>
              
              <h3 className="font-semibold mt-4 mb-2">Areas to avoid:</h3>
              <ul className="list-disc pl-6 space-y-1">
                {analysis.strategicAnalysis.priority1.avoid.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="border p-4 mb-6">
              <h3 className="font-semibold mb-2">Priority 2: Areas of focus:</h3>
              <ul className="list-disc pl-6 space-y-1">
                {analysis.strategicAnalysis.priority2.focus.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                <li>
                  <span className="font-medium">Opposite party contradicts themselves in following:</span>
                </li>
                <li className="pl-4">
                  Is opposite party acting in good faith or bad faith
                </li>
              </ul>
              
              <h3 className="font-semibold mt-4 mb-2">Areas to avoid:</h3>
              <ul className="list-disc pl-6 space-y-1">
                {analysis.strategicAnalysis.priority2.avoid.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button 
            onClick={handleAddUpdates} 
            className="bg-yellow-200 hover:bg-yellow-300 text-black"
          >
            Add updates
          </Button>
          <Button 
            onClick={handleDownloadReport} 
            className="bg-green-200 hover:bg-green-300 text-black"
          >
            Download report
          </Button>
        </div>
      </main>
    </div>
  )
}
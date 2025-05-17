// app/project/verify/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/navbar'

interface ProjectData {
  projectDescription: string
  disputeReason: string
  desiredOutcome: string
}

export default function VerifyProject() {
  const router = useRouter()
  const [projectData, setProjectData] = useState<ProjectData | null>(null)

  useEffect(() => {
    const storedData = localStorage.getItem('projectData')
    if (storedData) {
      setProjectData(JSON.parse(storedData))
    } else {
      router.push('/project/create')
    }
  }, [router])

  const handleGenerateReport = () => {
    router.push('/project/analysis')
  }

  const handleAmendProject = () => {
    router.push('/project/create')
  }

  if (!projectData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Please verify the following details are correct</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border p-4 mb-6">
              <h3 className="font-semibold mb-2">Summary of project:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>{projectData.projectDescription.substring(0, 30)}...</li>
                <li>{projectData.disputeReason.substring(0, 30)}...</li>
                <li>{projectData.desiredOutcome.substring(0, 30)}...</li>
                <li>...</li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Button 
                onClick={handleGenerateReport} 
                className="bg-green-200 hover:bg-green-300 text-black"
              >
                Generate report
              </Button>
              <Button 
                onClick={handleAmendProject} 
                className="bg-yellow-200 hover:bg-yellow-300 text-black"
              >
                Amend project
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
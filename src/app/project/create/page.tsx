// app/project/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/navbar'

export default function CreateProject() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    projectDescription: '',
    disputeReason: '',
    desiredOutcome: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store the form data in localStorage for now
    localStorage.setItem('projectData', JSON.stringify(formData))
    // Navigate to the verification page
    router.push('/project/verify')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your project</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="{Enter text here}" 
                className="min-h-[100px]"
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why are you disputing this mandate?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="{Enter text here}" 
                className="min-h-[100px]"
                name="disputeReason"
                value={formData.disputeReason}
                onChange={handleInputChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What outcome are you seeking?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="{Enter text here}" 
                className="min-h-[100px]"
                name="desiredOutcome"
                value={formData.desiredOutcome}
                onChange={handleInputChange}
                required
              />
            </CardContent>
          </Card>
          
          <Button type="submit" className="w-full bg-green-200 hover:bg-green-300 text-black">
            Submit Project
          </Button>
        </form>
      </main>
    </div>
  )
}
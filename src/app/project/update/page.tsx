// app/project/update/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/navbar'

export default function UpdateProject() {
  const router = useRouter()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would save the updates
    router.push('/project/analysis')
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add updates to your project</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Provide any new information or developments related to your case..." 
                className="min-h-[200px]"
                required
              />
            </CardContent>
          </Card>
          
          <Button type="submit" className="w-full bg-green-200 hover:bg-green-300 text-black">
            Submit Updates
          </Button>
        </form>
      </main>
    </div>
  )
}
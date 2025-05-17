// app/upload/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/navbar'

export default function UploadDocument() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }
  
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would upload the file to the server
    if (selectedFile) {
      // Simulate file upload
      setTimeout(() => {
        router.push('/project/create')
      }, 1000)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <label 
                  htmlFor="document-upload" 
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  Click to select a document
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'PDF, DOC, or DOCX files accepted'}
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!selectedFile}
              >
                Upload Document
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
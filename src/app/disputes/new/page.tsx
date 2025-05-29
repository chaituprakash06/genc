// app/disputes/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewDisputePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    disputeType: '',
    opposingParty: '',
    disputeValue: '',
    urgency: 'medium',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create new dispute
    const newDispute = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'active' as const,
      documentCount: 0,
      reportCount: 0,
      disputeType: formData.disputeType,
      opposingParty: formData.opposingParty,
      disputeValue: formData.disputeValue,
      urgency: formData.urgency,
    }

    // Save to localStorage
    const existingDisputes = localStorage.getItem('disputes')
    const disputes = existingDisputes ? JSON.parse(existingDisputes) : []
    disputes.push(newDispute)
    localStorage.setItem('disputes', JSON.stringify(disputes))

    // Redirect to dispute detail page
    router.push(`/disputes/${newDispute.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/disputes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Disputes
              </Button>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Create New Dispute</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Provide details about your dispute to get started
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Dispute Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Dispute Title*</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Contract breach with ABC Corp"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief overview of the dispute..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disputeType">Type of Dispute*</Label>
                    <Select
                      value={formData.disputeType}
                      onValueChange={(value) => setFormData({ ...formData, disputeType: value })}
                      required
                    >
                      <SelectTrigger id="disputeType" className="mt-1">
                        <SelectValue placeholder="Select dispute type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract Dispute</SelectItem>
                        <SelectItem value="employment">Employment Dispute</SelectItem>
                        <SelectItem value="intellectual-property">Intellectual Property</SelectItem>
                        <SelectItem value="partnership">Partnership Dispute</SelectItem>
                        <SelectItem value="commercial">Commercial Dispute</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="opposingParty">Opposing Party</Label>
                    <Input
                      id="opposingParty"
                      placeholder="Company or individual name"
                      value={formData.opposingParty}
                      onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disputeValue">Estimated Value ($)</Label>
                    <Input
                      id="disputeValue"
                      type="number"
                      placeholder="0"
                      value={formData.disputeValue}
                      onChange={(e) => setFormData({ ...formData, disputeValue: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                    >
                      <SelectTrigger id="urgency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - No immediate deadline</SelectItem>
                        <SelectItem value="medium">Medium - Action needed soon</SelectItem>
                        <SelectItem value="high">High - Urgent action required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={!formData.title || !formData.description || !formData.disputeType}>
                    Create Dispute
                  </Button>
                  <Link href="/disputes">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}

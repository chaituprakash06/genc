// components/profile/profile-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserProfile } from '@/app/project/profile/page'

interface ProfileFormProps {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState(profile)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onUpdate(formData)
    setIsSaving(false)
  }

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Acme Inc."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="role">Role/Title</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="Legal Counsel"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Select Industry</option>
            <option value="technology">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <Label htmlFor="experience">Years of Experience</Label>
          <select
            id="experience"
            value={formData.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
            className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Select Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="11-20">11-20 years</option>
            <option value="20+">20+ years</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about your professional background and expertise..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

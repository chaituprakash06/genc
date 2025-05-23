// app/project/profile/page.tsx
'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import ProfileForm from '@/components/profile/profile-form'
import ProfileStats from '@/components/profile/profile-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface UserProfile {
  name: string
  email: string
  company: string
  role: string
  industry: string
  experience: string
  preferences: {
    negotiationStyle: 'aggressive' | 'collaborative' | 'defensive'
    riskTolerance: 'low' | 'medium' | 'high'
    priorityFocus: string[]
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    company: '',
    role: '',
    industry: '',
    experience: '',
    preferences: {
      negotiationStyle: 'collaborative',
      riskTolerance: 'medium',
      priorityFocus: []
    }
  })

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    // Here you would typically save to backend
    console.log('Profile updated:', updatedProfile)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile and negotiation preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="settings">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileForm 
                    profile={profile} 
                    onUpdate={handleProfileUpdate}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Your Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Negotiation Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Negotiation Style</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Your preferred approach to contract negotiations
                      </p>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={profile.preferences.negotiationStyle}
                        onChange={(e) => handleProfileUpdate({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            negotiationStyle: e.target.value as 'aggressive' | 'collaborative' | 'defensive'
                          }
                        })}
                      >
                        <option value="aggressive">Aggressive - Push for maximum advantage</option>
                        <option value="collaborative">Collaborative - Seek win-win solutions</option>
                        <option value="defensive">Defensive - Protect current position</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Risk Tolerance</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        How much risk are you willing to accept in negotiations
                      </p>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={profile.preferences.riskTolerance}
                        onChange={(e) => handleProfileUpdate({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            riskTolerance: e.target.value as 'low' | 'medium' | 'high'
                          }
                        })}
                      >
                        <option value="low">Low - Minimize risks</option>
                        <option value="medium">Medium - Balanced approach</option>
                        <option value="high">High - Accept risks for better terms</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Priority Areas</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select areas that are most important in your negotiations
                      </p>
                      <div className="space-y-2">
                        {[
                          'Payment Terms',
                          'Intellectual Property',
                          'Liability Limitations',
                          'Termination Clauses',
                          'Confidentiality',
                          'Dispute Resolution'
                        ].map(area => (
                          <label key={area} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={profile.preferences.priorityFocus.includes(area)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleProfileUpdate({
                                    ...profile,
                                    preferences: {
                                      ...profile.preferences,
                                      priorityFocus: [...profile.preferences.priorityFocus, area]
                                    }
                                  })
                                } else {
                                  handleProfileUpdate({
                                    ...profile,
                                    preferences: {
                                      ...profile.preferences,
                                      priorityFocus: profile.preferences.priorityFocus.filter(a => a !== area)
                                    }
                                  })
                                }
                              }}
                            />
                            {area}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

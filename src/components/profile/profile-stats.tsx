// components/profile/profile-stats.tsx
'use client'

import { Card } from '@/components/ui/card'

export default function ProfileStats() {
  const stats = [
    { label: 'Documents Analyzed', value: '24', trend: '+12%' },
    { label: 'Reports Generated', value: '18', trend: '+8%' },
    { label: 'Negotiations Completed', value: '7', trend: '+15%' },
    { label: 'Success Rate', value: '85%', trend: '+5%' },
  ]

  const recentActivity = [
    { action: 'Generated report', document: 'Service Agreement 2024.pdf', time: '2 hours ago' },
    { action: 'Uploaded document', document: 'NDA_CompanyX.docx', time: '5 hours ago' },
    { action: 'Completed negotiation', document: 'Purchase Order Terms.pdf', time: '1 day ago' },
    { action: 'Generated report', document: 'License Agreement.pdf', time: '2 days ago' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.trend}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.document}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Contract Types Analyzed</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Service Agreements</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-sm">45%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">NDAs</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <span className="text-sm">30%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Purchase Orders</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <span className="text-sm">15%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Other</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <span className="text-sm">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

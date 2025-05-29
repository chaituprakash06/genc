// app/guide/page.tsx
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, Brain, MessageSquare, Users, Shield } from 'lucide-react'

export default function GuidePage() {
  const steps = [
    {
      icon: FileText,
      title: "Create a Dispute",
      description: "Start by creating a new dispute case with basic information about your situation."
    },
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Add all relevant contracts, emails, and evidence related to your dispute."
    },
    {
      icon: Brain,
      title: "Generate AI Analysis",
      description: "Our AI analyzes your documents against legal precedents and negotiation strategies."
    },
    {
      icon: MessageSquare,
      title: "Get Strategic Advice",
      description: "Receive actionable recommendations to strengthen your negotiation position."
    },
    {
      icon: Users,
      title: "Negotiate with Confidence",
      description: "Use the insights to negotiate better terms and resolve disputes faster."
    },
    {
      icon: Shield,
      title: "Track Progress",
      description: "Monitor your disputes and maintain a record of all negotiations."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">How to Use GenC</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Follow these steps to effectively manage and resolve your disputes
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Step {index + 1}: {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Tips for Success</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Be thorough when uploading documents - include all relevant contracts, correspondence, and evidence.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Provide detailed descriptions of your dispute to get more accurate AI analysis.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Review AI recommendations carefully and adapt them to your specific situation.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Keep your dispute information updated as negotiations progress.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Use the chat feature to ask specific questions about your dispute.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

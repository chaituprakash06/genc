// components/welcome-screen.tsx
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to GenC</h1>
        <p className="text-xl mb-6">Your AI-powered contract negotiation expert</p>
        <p className="mb-8">Upload your contracts and get strategic advice on how to gain the upper hand in negotiations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        <Card className="transition-transform hover:scale-105">
          <CardContent className="pt-6 pb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Upload Documents</h2>
            <p className="text-center mb-6">Start by uploading your contract documents for analysis</p>
            <Link href="/project/my_docs" className="w-full">
              <Button className="w-full bg-blue-200 hover:bg-blue-300 text-black">
                Upload Documents
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:scale-105">
          <CardContent className="pt-6 pb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17V15M12 17V13M15 17V11M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Generate AI Report</h2>
            <p className="text-center mb-6">Get comprehensive AI analysis of your contracts</p>
            <Link href="/project/ai_report" className="w-full">
              <Button className="w-full bg-purple-200 hover:bg-purple-300 text-black">
                Generate Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:scale-105">
          <CardContent className="pt-6 pb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.68629 14 6 16.6863 6 20C6 21 6.5 21 7 21H17C17.5 21 18 21 18 20C18 16.6863 15.3137 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Setup Profile</h2>
            <p className="text-center mb-6">Customize your negotiation preferences and style</p>
            <Link href="/project/profile" className="w-full">
              <Button className="w-full bg-green-200 hover:bg-green-300 text-black">
                Setup Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Need help getting started?
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/contract-chat">
            <Button variant="outline">
              Chat with AI Assistant
            </Button>
          </Link>
          <Link href="/documents">
            <Button variant="outline">
              View Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

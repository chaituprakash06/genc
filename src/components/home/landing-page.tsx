// components/home/landing-page.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Scale, 
  Brain, 
  FileText, 
  MessageSquare, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  PlayCircle
} from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <div className="w-full">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute min-w-full min-h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
          
          {/* Poster image shown while video loads */}
          {!videoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
          )}
          
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              AI-Powered Dispute Resolution
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-up animation-delay-200">
              Strengthen your negotiation position with strategic advice based on thousands of negotiation books and proven tactics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link href="/auth/signup">
                <Button size="lg" className="min-w-[200px] bg-blue-600 hover:bg-blue-700 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="min-w-[200px] bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 text-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Optional: Add a play button for a demo video */}
            <div className="mt-12 animate-fade-in-up animation-delay-600">
              <button className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
                <PlayCircle className="w-12 h-12 group-hover:scale-110 transition-transform" />
                <span className="text-lg">Watch 2-min Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to resolve disputes effectively
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Document Management</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload and organize all your contracts, emails, and evidence in one secure place
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Brain className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get comprehensive analysis of your case strengths, weaknesses, and negotiation leverage
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <MessageSquare className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Strategic Advice</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Chat with AI trained on thousands of negotiation books for personalized guidance
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Scale className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Case Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage multiple disputes with status tracking and deadline reminders
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your sensitive documents and case details are encrypted and protected
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fast Results</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate comprehensive reports and strategies in minutes, not hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How GenC Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create Your Dispute</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start by creating a new dispute case with basic information about your situation
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add contracts, correspondence, and any relevant evidence to build your case
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI analyzes your documents and generates strategic insights and recommendations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Negotiate with Confidence</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use personalized strategies and tactics to achieve the best possible outcome
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose GenC?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Save Time & Money</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get professional-level analysis without expensive consultants
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Data-Driven Insights</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Leverage proven negotiation strategies from thousands of sources
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">24/7 Availability</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access your cases and get advice anytime, anywhere
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Complete Privacy</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your sensitive information stays secure and confidential
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to strengthen your negotiation position?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join in and resolve your dispute with GenC
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="min-w-[200px]">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
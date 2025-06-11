// app/page.tsx
import Navbar from '@/components/layout/navbar'
import WelcomeScreen from '@/components/home/welcome-screen'
import LandingPage from '@/components/home/landing-page'
import { createServerClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {session ? (
          <div className="container mx-auto p-4">
            <WelcomeScreen />
          </div>
        ) : (
          <LandingPage />
        )}
      </main>
    </div>
  )
}
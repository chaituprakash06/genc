// app/page.tsx
import Navbar from '@/components/layout/navbar'
import WelcomeScreen from '@/components/home/welcome-screen'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <WelcomeScreen />
      </main>
    </div>
  )
}
// components/welcome-screen.tsx
import Link from 'next/link'

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="grid grid-cols-2 gap-8 max-w-2xl">
        <div className="border p-8 flex items-center justify-center">
          <Link href="/upload">
            <div className="text-center">
              {'{Upload doc here}'}
            </div>
          </Link>
        </div>
        <div className="border p-8 flex items-center justify-center">
          <Link href="/project/create">
            <div className="text-center">
              Create project
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
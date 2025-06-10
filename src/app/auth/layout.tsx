import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header */}
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
                <Image 
                  src="/logo.png"  // or "/logo.svg" if you're using SVG
                  alt="GenC Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"  // Keeps the rounded corners like the original
                  priority  // Loads the logo immediately
                />
              </div>
            <span className="text-xl font-bold">GenC</span>
          </Link>
        </div>
      </header>
      
      {/* Auth content */}
      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
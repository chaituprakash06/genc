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
          <Link href="/" className="inline-flex items-center justify-center h-9">
                <Image 
                  src="/logo.png"  // or "/logo.svg" if you're using SVG
                  alt="GenC Logo"
                  width={36}
                  height={36}
                  className="rounded-lg"  // Keeps the rounded corners like the original
                  priority  // Loads the logo immediately
                />
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
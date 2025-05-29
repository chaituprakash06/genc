// components/layout/navbar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Home, FolderOpen, User, MessageSquare } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/disputes', label: 'Disputes', icon: FolderOpen },
  ]

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
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
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href === '/disputes' && pathname.startsWith('/disputes'))
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'px-4',
                        isActive
                          ? ''
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

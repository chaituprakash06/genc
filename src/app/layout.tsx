// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GenC - AI Contract Negotiation',
  description: 'AI-powered contract negotiation assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics/>
        </ThemeProvider>
      </body>
    </html>
  )
}
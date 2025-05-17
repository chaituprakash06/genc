// components/navbar.tsx
import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex justify-end p-4">
        <div className="space-x-1">
          <Link href="/login" className="border px-4 py-2">
            Login
          </Link>
          <Link href="/about" className="border px-4 py-2">
            About us
          </Link>
          <Link href="/contact" className="border px-4 py-2">
            Contact
          </Link>
        </div>
      </div>
    </header>
  )
}
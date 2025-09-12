import { createRouteClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteClient()
  
  try {
    // Sign out the user
    await supabase.auth.signOut()
    
    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' }, 
      { status: 500 }
    )
  }
}
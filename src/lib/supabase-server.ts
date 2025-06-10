import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For server components
export const createServerClient = () => {
  return createServerComponentClient({ 
    cookies
  })
}

// For route handlers  
export const createRouteClient = () => {
  return createRouteHandlerClient({ 
    cookies
  })
}
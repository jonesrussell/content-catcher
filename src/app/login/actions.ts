'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(email: string, password: string) {
  const supabase = await createClient()

  try {
    // Validate input
    const validatedData = authSchema.parse({ email, password })

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    // Get session to check authentication state
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Only revalidate the dashboard layout since that's where we're going
      revalidatePath('/dashboard', 'layout')
      redirect('/dashboard')
    } else {
      return {
        error: 'Failed to create session',
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      }
    }
    return {
      error: 'An unexpected error occurred',
    }
  }
}

export async function signup(email: string, password: string) {
  const supabase = await createClient()

  try {
    // Validate input
    const validatedData = authSchema.parse({ email, password })

    const { error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    // Get session to check authentication state
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Only revalidate the dashboard layout since that's where we're going
      revalidatePath('/dashboard', 'layout')
      redirect('/dashboard')
    } else {
      return {
        error: 'Failed to create session',
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      }
    }
    return {
      error: 'An unexpected error occurred',
    }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Only revalidate the layout since we're redirecting to login
  revalidatePath('/', 'layout')
  redirect('/login')
} 
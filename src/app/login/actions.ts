'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate input
    const validatedData = authSchema.parse(data)

    const { error } = await supabase.auth.signInWithPassword(validatedData)

    if (error) {
      return {
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
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

export async function signup(formData: FormData) {
  const supabase = await createClient()

  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate input
    const validatedData = authSchema.parse(data)

    const { error } = await supabase.auth.signUp(validatedData)

    if (error) {
      return {
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
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
  revalidatePath('/', 'layout')
  redirect('/login')
} 
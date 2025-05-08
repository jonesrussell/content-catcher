'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const profileSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export async function updateProfile(profile: z.infer<typeof profileSchema>) {
  const supabase = await createClient()

  try {
    // Validate input
    const validatedData = profileSchema.parse(profile)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: validatedData.username,
        full_name: validatedData.full_name,
        avatar_url: validatedData.avatar_url,
      })
      .eq('id', validatedData.id)

    if (error) {
      return {
        error: error.message,
      }
    }

    revalidatePath('/profile')
    return { success: true }
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
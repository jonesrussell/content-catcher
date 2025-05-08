import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number }) {
          document.cookie = `${name}=${value}${options.path ? `; path=${options.path}` : ''}${options.maxAge ? `; max-age=${options.maxAge}` : ''}`;
        },
        remove(name: string, options: { path?: string }) {
          document.cookie = `${name}=; max-age=0${options.path ? `; path=${options.path}` : ''}`;
        },
      },
      global: {
        headers: {
          'Accept': 'application/json',
        },
      },
    }
  )
} 
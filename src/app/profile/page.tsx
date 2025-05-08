import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Suspense } from 'react'
import Loading from './loading'
import ProfileContentWrapper from '@/components/ProfileContentWrapper'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<Loading />}>
      <ProfileContentWrapper />
    </Suspense>
  )
}

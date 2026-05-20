'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Notification } from '@/lib/definitions'

async function getAuthenticatedLandlordId(): Promise<
  { userId: string } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  return { userId: user.id }
}

export async function getUnreadNotifications(): Promise<{
  data: Notification[]
  error: string | null
}> {
  const auth = await getAuthenticatedLandlordId()
  if ('error' in auth) {
    return { data: [], error: auth.error }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('landlord_id', auth.userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []) as Notification[], error: null }
}

export async function markAsRead(id: string): Promise<{ error: string | null }> {
  const auth = await getAuthenticatedLandlordId()
  if ('error' in auth) {
    return { error: auth.error }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('landlord_id', auth.userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function markAllAsRead(): Promise<{ error: string | null }> {
  const auth = await getAuthenticatedLandlordId()
  if ('error' in auth) {
    return { error: auth.error }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('landlord_id', auth.userId)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

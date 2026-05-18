'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBuilding(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('buildings').insert({
    name,
    landlord_id: user.id,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have a building with this name.' }
    }
    return { error: error.message }
  }

  revalidatePath('/buildings')
  return { success: true }
}

export async function updateBuilding(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  const { error } = await supabase
    .from('buildings')
    .update({ name })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have a building with this name.' }
    }
    return { error: error.message }
  }

  revalidatePath('/buildings')
  revalidatePath(`/buildings/${id}`)
  return { success: true }
}

export async function deleteBuilding(id: string) {
  const supabase = await createClient()

  // Check if units exist
  const { data: units, error: checkError } = await supabase
    .from('units')
    .select('id')
    .eq('building_id', id)
    .limit(1)

  if (checkError) {
    return { error: checkError.message }
  }

  if (units && units.length > 0) {
    return { error: 'Cannot delete building with units. Remove all units first.' }
  }

  const { error } = await supabase.from('buildings').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/buildings')
  return { success: true }
}

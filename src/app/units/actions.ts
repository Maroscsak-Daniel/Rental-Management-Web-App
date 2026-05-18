'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { UnitStatus } from '@/lib/definitions'

export async function createUnit(formData: FormData) {
  const supabase = await createClient()
  const building_id = formData.get('building_id') as string
  const floor = formData.get('floor') as string || null
  const size_sqm = formData.get('size_sqm') ? parseFloat(formData.get('size_sqm') as string) : null
  const rent_amount = parseFloat(formData.get('rent_amount') as string)
  const status = formData.get('status') as UnitStatus || 'vacant'

  if (rent_amount < 0) return { error: 'Rent amount cannot be negative.' }
  if (size_sqm !== null && size_sqm < 0) return { error: 'Size cannot be negative.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate building ownership
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('id')
    .eq('id', building_id)
    .single()

  if (buildingError || !building) {
    return { error: 'Invalid building selected or you do not have permission to add units to it.' }
  }

  const { error } = await supabase.from('units').insert({
    building_id,
    floor,
    size_sqm,
    rent_amount,
    status
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/units')
  revalidatePath(`/buildings/${building_id}`)
  return { success: true }
}

export async function updateUnit(id: string, formData: FormData) {
  const supabase = await createClient()
  const building_id = formData.get('building_id') as string
  const floor = formData.get('floor') as string || null
  const size_sqm = formData.get('size_sqm') ? parseFloat(formData.get('size_sqm') as string) : null
  const rent_amount = parseFloat(formData.get('rent_amount') as string)
  const status = formData.get('status') as UnitStatus

  if (rent_amount < 0) return { error: 'Rent amount cannot be negative.' }
  if (size_sqm !== null && size_sqm < 0) return { error: 'Size cannot be negative.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate building ownership if it was changed
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('id')
    .eq('id', building_id)
    .single()

  if (buildingError || !building) {
    return { error: 'Invalid building selected or you do not have permission to add units to it.' }
  }

  const { error } = await supabase
    .from('units')
    .update({ 
      building_id,
      floor,
      size_sqm,
      rent_amount,
      status
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/units')
  revalidatePath(`/units/${id}`)
  revalidatePath(`/buildings/${building_id}`)
  return { success: true }
}

export async function deleteUnit(id: string) {
  const supabase = await createClient()

  // Get the unit's building_id before deleting so we can revalidate the building page
  const { data: unit } = await supabase
    .from('units')
    .select('building_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('units').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/units')
  if (unit) {
    revalidatePath(`/buildings/${unit.building_id}`)
  }
  return { success: true }
}

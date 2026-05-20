'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new tenant:
 * 1. Creates a Supabase Auth user via the admin API (so landlord session is preserved)
 * 2. Inserts a row into the `tenants` table
 * 3. Inserts a row into the `profiles` table linking auth user → tenant
 *
 * If any step fails, previous steps are rolled back.
 */
export async function createTenant(formData: FormData) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const firstName = (formData.get('first_name') as string)?.trim()
    const lastName = (formData.get('last_name') as string)?.trim()
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const phone = (formData.get('phone') as string)?.trim() || null

    // Validation
    if (!firstName || !lastName || !email) {
      return { error: 'First name, last name, and email are required.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Please enter a valid email address.' }
    }

    // Get current landlord
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Step 1: Invite user via admin API — sends an invite email automatically
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data: authData, error: authError } = await adminSupabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { first_name: firstName, last_name: lastName },
        redirectTo: `${siteUrl}/auth/callback`,
      }
    )

    if (authError) {
      console.error('inviteUserByEmail error:', authError.message, authError.status)
      return { error: `Failed to create user account: ${authError.message}` }
    }

    if (!authData?.user) {
      return { error: 'Failed to create user account: no user returned.' }
    }

    const authUserId = authData.user.id

    // Step 2: Insert tenant row
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        landlord_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      })
      .select('id')
      .single()

    if (tenantError) {
      // Rollback: delete the auth user we just created
      await adminSupabase.auth.admin.deleteUser(authUserId)
      return { error: `Failed to create tenant: ${tenantError.message}` }
    }

    // Step 3: Update the profile created by the trigger (handle_new_user)
    // The trigger auto-creates a profile with role='landlord', so we update it
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        role: 'tenant',
        tenant_id: tenant.id,
      })
      .eq('id', authUserId)

    if (profileError) {
      // Rollback: delete tenant row and auth user
      await supabase.from('tenants').delete().eq('id', tenant.id)
      await adminSupabase.auth.admin.deleteUser(authUserId)
      return { error: `Failed to create profile: ${profileError.message}` }
    }

    revalidatePath('/tenants')
    return { success: true }
  } catch (err) {
    console.error('createTenant unexpected error:', err)
    return { error: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function updateTenant(id: string, formData: FormData) {
  const supabase = await createClient()

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || null
  const status = formData.get('status') as string | null

  if (!firstName || !lastName) {
    return { error: 'First name and last name are required.' }
  }

  const updateData: Record<string, unknown> = {
    first_name: firstName,
    last_name: lastName,
    phone,
  }

  if (status === 'active' || status === 'inactive') {
    updateData.status = status
  }

  const { error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tenants')
  revalidatePath(`/tenants/${id}`)
  return { success: true }
}

export async function deactivateTenant(id: string) {
  const supabase = await createClient()

  // Check for active leases
  const { data: activeLeases, error: checkError } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', id)
    .eq('status', 'active')
    .limit(1)

  if (checkError) {
    return { error: checkError.message }
  }

  if (activeLeases && activeLeases.length > 0) {
    return { error: 'Cannot deactivate tenant with active leases. Terminate the lease first.' }
  }

  const { error } = await supabase
    .from('tenants')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tenants')
  return { success: true }
}

export async function reactivateTenant(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tenants')
    .update({ status: 'active' })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tenants')
  return { success: true }
}


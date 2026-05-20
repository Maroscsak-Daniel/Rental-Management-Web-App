import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase admin client using the service_role key.
 * This bypasses Row Level Security — use ONLY for operations that
 * require elevated privileges (e.g., creating tenant auth users).
 *
 * NEVER import this file from client components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variable.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

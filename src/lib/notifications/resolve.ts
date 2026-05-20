import { createClient } from '@/lib/supabase/server'
import { NotificationType } from '@/lib/definitions'

export async function resolveNotificationsByReference(params: {
  landlordId: string
  type: NotificationType
  referenceId: string
}): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('landlord_id', params.landlordId)
    .eq('type', params.type)
    .eq('reference_id', params.referenceId)
    .eq('is_read', false)
}

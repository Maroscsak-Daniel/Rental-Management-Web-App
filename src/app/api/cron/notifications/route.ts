import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runNotificationCron } from '@/lib/notifications/cron'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const CRON_SECRET = process.env.CRON_SECRET

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    const result = await runNotificationCron(adminSupabase)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

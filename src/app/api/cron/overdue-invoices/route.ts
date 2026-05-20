import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    // 1. Verify authorization using a secret key
    const authHeader = request.headers.get('authorization')
    const CRON_SECRET = process.env.CRON_SECRET

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // 2. Perform the update
    // We update invoices that are 'pending' and whose due_date is strictly before today
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await adminSupabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('due_date', today)
      .select('id')

    if (error) {
      console.error('Error marking overdue invoices:', error)
      return NextResponse.json({ error: 'Failed to update invoices' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${data?.length || 0} invoices as overdue.`,
      updatedIds: data?.map((i) => i.id) || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

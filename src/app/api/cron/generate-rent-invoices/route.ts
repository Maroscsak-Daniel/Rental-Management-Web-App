import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    // 1. Verify authorization
    const authHeader = request.headers.get('authorization')
    const CRON_SECRET = process.env.CRON_SECRET

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // 2. Fetch all active leases
    const { data: activeLeases, error: leasesError } = await adminSupabase
      .from('leases')
      .select('id, landlord_id, tenant_id, rent_amount, start_date')
      .eq('status', 'active')

    if (leasesError) {
      throw new Error('Failed to fetch active leases: ' + leasesError.message)
    }

    if (!activeLeases || activeLeases.length === 0) {
      return NextResponse.json({ success: true, message: 'No active leases found.', generatedCount: 0 })
    }

    // Determine the current month bounds (e.g., 2024-05-01 to 2024-05-31)
    // We want due date to be the 1st or maybe 5th, but we check if any 'rent' invoice exists for this lease with due_date in this month.
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() // 0-11
    // First day of current month
    const startOfMonth = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0]
    // Last day of current month
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0]
    
    // We set the due date to the 5th of the month by default
    const dueDate = new Date(Date.UTC(year, month, 5)).toISOString().split('T')[0]

    let generatedCount = 0
    let skippedCount = 0

    // Process each lease
    for (const lease of activeLeases) {
      // Ignore if lease start date is in the future
      if (new Date(lease.start_date) > now) {
        skippedCount++
        continue
      }

      // Check if a rent invoice already exists for this lease in the current month
      const { data: existingInvoices, error: checkError } = await adminSupabase
        .from('invoices')
        .select('id')
        .eq('lease_id', lease.id)
        .eq('category', 'rent')
        .gte('due_date', startOfMonth)
        .lte('due_date', endOfMonth)
        .limit(1)

      if (checkError) {
        console.error(`Error checking invoices for lease ${lease.id}:`, checkError.message)
        continue
      }

      if (existingInvoices && existingInvoices.length > 0) {
        // Invoice already exists for this month, skip
        skippedCount++
        continue
      }

      // Generate the new invoice
      const { error: insertError } = await adminSupabase.from('invoices').insert({
        landlord_id: lease.landlord_id,
        tenant_id: lease.tenant_id,
        lease_id: lease.id,
        amount: lease.rent_amount,
        category: 'rent',
        status: 'pending',
        due_date: dueDate,
      })

      if (insertError) {
        console.error(`Error creating invoice for lease ${lease.id}:`, insertError.message)
      } else {
        generatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Finished invoice generation job.`,
      generatedCount,
      skippedCount,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

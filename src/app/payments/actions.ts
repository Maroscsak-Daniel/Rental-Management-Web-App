'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPayment(formData: FormData) {
  const supabase = await createClient()

  const invoiceId = formData.get('invoice_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const method = (formData.get('method') as string) || 'cash'
  const paymentDate = formData.get('payment_date') as string || new Date().toISOString().split('T')[0]

  if (!invoiceId || isNaN(amount) || amount <= 0) {
    return { error: 'Invalid payment data.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify the invoice exists and belongs to the user
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, amount, status, landlord_id')
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) {
    return { error: 'Invoice not found.' }
  }

  // Tenant portal check: If a tenant is paying, they must be the tenant on the invoice.
  // Wait, right now payments are entered by landlords. Let's ensure landlord_id matches if user is landlord.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'landlord' && invoice.landlord_id !== user.id) {
    return { error: 'Unauthorized.' }
  }

  if (invoice.status === 'paid') {
    return { error: 'Invoice is already paid.' }
  }

  // Insert payment (Immutability: no update or delete actions exist)
  const { error: paymentError } = await supabase.from('payments').insert({
    invoice_id: invoiceId,
    amount,
    method,
    payment_date: paymentDate,
  })

  if (paymentError) {
    return { error: paymentError.message }
  }

  // Status Automation: Calculate total paid so far
  const { data: allPayments, error: fetchPaymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)

  if (!fetchPaymentsError && allPayments) {
    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    // If total paid >= invoice amount, mark as paid
    if (totalPaid >= Number(invoice.amount)) {
      await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)
    }
  }

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/dashboard')
  
  return { success: true }
}

export async function updateInvoiceStatus(id: string, newStatus: string) {
  const supabase = await createClient()

  // First fetch the current invoice to check constraint
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !invoice) {
    return { error: 'Invoice not found', status: 404 }
  }

  // Constraint: Cannot revert a paid invoice
  if (invoice.status === 'paid') {
    return { error: 'Conflict: Cannot revert a paid invoice status.', status: 409 }
  }

  const { error } = await supabase
    .from('invoices')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/invoices')
  return { success: true }
}

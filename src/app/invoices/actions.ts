'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()

  const tenantId = formData.get('tenant_id') as string
  const leaseId = formData.get('lease_id') as string | null
  const amount = parseFloat(formData.get('amount') as string)
  const dueDate = formData.get('due_date') as string
  const category = formData.get('category') as string

  if (!tenantId || isNaN(amount) || amount <= 0 || !dueDate || !category) {
    return { error: 'Invalid invoice data. Please fill all required fields correctly.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Ensure tenant belongs to the landlord
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Invalid tenant selected.' }
  }

  const d = new Date()
  const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const initialStatus = dueDate < localToday ? 'overdue' : 'pending'

  const insertData: Record<string, any> = {
    landlord_id: user.id,
    tenant_id: tenantId,
    amount,
    due_date: dueDate,
    category,
    status: initialStatus,
  }

  if (leaseId) {
    insertData.lease_id = leaseId
  }

  const { data: newInvoice, error } = await supabase
    .from('invoices')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  // DB may have a default/trigger that forces status='pending' on insert.
  // Do an explicit UPDATE afterwards to ensure past-due invoices are marked overdue.
  if (initialStatus === 'overdue' && newInvoice?.id) {
    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('id', newInvoice.id)
  }

  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getInvoices(month?: string, status?: string, tenantId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  let query = supabase
    .from('invoices')
    .select(`
      *,
      tenants:tenant_id (first_name, last_name),
      leases:lease_id (unit_id),
      payments (amount)
    `)
    .eq('landlord_id', user.id)
    .order('due_date', { ascending: false })

  if (status && status !== 'all') {
    const todayStr = new Date().toISOString().split('T')[0]
    if (status === 'pending') {
      // Pending means it's marked pending AND hasn't passed due date
      query = query.eq('status', 'pending').gte('due_date', todayStr)
    } else if (status === 'overdue') {
      // Overdue means it's either marked overdue, OR marked pending but past due date
      query = query.or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${todayStr})`)
    } else {
      query = query.eq('status', status)
    }
  }

  if (tenantId && tenantId !== 'all') {
    query = query.eq('tenant_id', tenantId)
  }

  if (month && month !== 'all') {
    const [yearStr, monthStr] = month.split('-')
    const year = Number(yearStr)
    const monthNum = Number(monthStr)
    const startOfMonth = `${yearStr}-${monthStr}-01`
    const lastDay = new Date(year, monthNum, 0).getDate()
    const endOfMonth = `${yearStr}-${monthStr}-${lastDay}`
    query = query.gte('due_date', startOfMonth).lte('due_date', endOfMonth)
  }

  const { data: invoices, error } = await query

  if (error) {
    console.error('Error fetching invoices:', error)
    return { error: error.message, data: [] }
  }

  return { success: true, data: invoices || [] }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        tenants:tenant_id (*),
        payments (*)
      `)
      .eq('id', id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'landlord' && invoice.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (profile?.role === 'tenant' && invoice.tenants?.id !== user.id && invoice.tenant_id !== user.id) {
      const { data: tenantProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()
        
      if (tenantProfile?.tenant_id !== invoice.tenant_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Calculate totals
    const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    const balance = Math.max(0, invoice.amount - totalPaid)

    // Generate PDF using jsPDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text('INVOICE', 190, 20, { align: 'right' })
    
    doc.setFontSize(10)
    doc.text(`Invoice ID: ${invoice.id.split('-')[0]}`, 20, 40)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 46)
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 52)
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 58)
    
    // Bill To
    doc.setFontSize(12)
    doc.text('BILL TO:', 20, 75)
    doc.setFontSize(10)
    doc.text(`${invoice.tenants?.first_name || ''} ${invoice.tenants?.last_name || ''}`, 20, 81)
    if (invoice.tenants?.email) doc.text(invoice.tenants.email, 20, 87)
    if (invoice.tenants?.phone) doc.text(invoice.tenants.phone, 20, 93)

    // Line Items
    doc.setFontSize(12)
    doc.text('DETAILS:', 20, 115)
    
    doc.setFontSize(10)
    doc.text(`Category: ${invoice.category.toUpperCase()}`, 20, 125)
    doc.text(`$${Number(invoice.amount).toFixed(2)}`, 190, 125, { align: 'right' })
    
    doc.line(20, 130, 190, 130)
    
    // Summary
    doc.text(`Total Amount:`, 140, 140)
    doc.text(`$${Number(invoice.amount).toFixed(2)}`, 190, 140, { align: 'right' })
    
    doc.text(`Amount Paid:`, 140, 146)
    doc.text(`$${totalPaid.toFixed(2)}`, 190, 146, { align: 'right' })
    
    doc.setFont('helvetica', 'bold')
    doc.text(`Balance Due:`, 140, 154)
    doc.text(`$${balance.toFixed(2)}`, 190, 154, { align: 'right' })

    // Footer
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text('Thank you for your business.', 105, 270, { align: 'center' })

    // Output
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.id}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error('PDF Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PDFDocument from 'pdfkit'

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

    if (profile?.role === 'tenant') {
      const { data: tenantProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (tenantProfile?.tenant_id !== invoice.tenant_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const totalPaid = (invoice.payments || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0
    )
    const balance = Math.max(0, invoice.amount - totalPaid)

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'right' })
      doc.moveDown(0.5)

      // Invoice metadata
      doc.fontSize(10).font('Helvetica')
      doc.text(`Invoice ID: ${invoice.id.split('-')[0]}`)
      doc.text(`Issue Date: ${new Date(invoice.created_at).toLocaleDateString()}`)
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`)
      doc.text(`Status: ${invoice.status.toUpperCase()}`)
      doc.moveDown(1)

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(1)

      // Bill To
      doc.fontSize(12).font('Helvetica-Bold').text('BILL TO:')
      doc.fontSize(10).font('Helvetica')
      doc.text(`${invoice.tenants?.first_name || ''} ${invoice.tenants?.last_name || ''}`)
      if (invoice.tenants?.email) doc.text(invoice.tenants.email)
      if (invoice.tenants?.phone) doc.text(invoice.tenants.phone)
      doc.moveDown(1.5)

      // Details table header
      doc.fontSize(12).font('Helvetica-Bold').text('DETAILS:')
      doc.moveDown(0.5)

      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Description', 50, doc.y, { continued: true, width: 300 })
      doc.text('Amount', { align: 'right' })

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(0.5)

      // Line item
      doc.font('Helvetica')
      const categoryLabel = invoice.category.charAt(0).toUpperCase() + invoice.category.slice(1)
      doc.text(categoryLabel, 50, doc.y, { continued: true, width: 300 })
      doc.text(`$${Number(invoice.amount).toFixed(2)}`, { align: 'right' })
      doc.moveDown(1)

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(0.5)

      // Summary
      doc.font('Helvetica').text('Total Amount:', 350, doc.y, { continued: true, width: 100 })
      doc.text(`$${Number(invoice.amount).toFixed(2)}`, { align: 'right' })
      doc.text('Amount Paid:', 350, doc.y, { continued: true, width: 100 })
      doc.text(`$${totalPaid.toFixed(2)}`, { align: 'right' })
      doc.font('Helvetica-Bold').text('Balance Due:', 350, doc.y, { continued: true, width: 100 })
      doc.text(`$${balance.toFixed(2)}`, { align: 'right' })
      doc.moveDown(2)

      // Payment history
      if (invoice.payments && invoice.payments.length > 0) {
        doc.font('Helvetica-Bold').fontSize(12).text('PAYMENT HISTORY:')
        doc.moveDown(0.5)
        doc.fontSize(10).font('Helvetica-Bold')
        doc.text('Date', 50, doc.y, { continued: true, width: 200 })
        doc.text('Amount', { align: 'right' })
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
        doc.moveDown(0.5)

        for (const payment of invoice.payments) {
          doc.font('Helvetica')
          doc.text(
            new Date(payment.payment_date).toLocaleDateString(),
            50,
            doc.y,
            { continued: true, width: 200 }
          )
          doc.text(`$${Number(payment.amount).toFixed(2)}`, { align: 'right' })
        }
        doc.moveDown(1)
      }

      // Footer
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown(0.5)
      doc.fontSize(9).font('Helvetica').fillColor('grey')
        .text('Thank you for your business.', { align: 'center' })

      doc.end()
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.id.split('-')[0]}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error('PDF Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

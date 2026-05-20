'use client'

import { useState } from 'react'
import { createPayment } from '@/app/payments/actions'

export default function PaymentForm({ invoiceId, maxAmount }: { invoiceId: string, maxAmount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState(maxAmount)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createPayment(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setAmount(0) // Reset or handled by redirect
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="invoice_id" value={invoiceId} />
      
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
          Payment Amount
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            min="0.01"
            max={maxAmount}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="block w-full rounded-md border-slate-300 pl-7 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border py-2"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="payment_date" className="block text-sm font-medium text-slate-700">
          Payment Date
        </label>
        <input
          type="date"
          name="payment_date"
          id="payment_date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border py-2 px-3"
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Record Payment'}
      </button>
    </form>
  )
}

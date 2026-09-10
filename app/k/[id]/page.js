'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function KontributionPage({ params }) {
  const [kontribution, setKontribution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payAmount, setPayAmount] = useState('')
  const [paying, setPaying] = useState(false)

  const fetchKontribution = async () => {
    const { data } = await supabase
      .from('kontributions')
      .select()
      .eq('id', params.id)
      .single()

    setKontribution(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchKontribution()
  }, [params.id])

  const handlePay = () => {
    if (!payAmount || parseFloat(payAmount) <= 0) return

    setPaying(true)

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: `contributor${Date.now()}@kontribute.app`,
      amount: parseFloat(payAmount) * 100,
      currency: 'NGN',
      callback: function (response) {
        fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: response.reference,
            kontributionId: params.id,
            amount: payAmount,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              fetchKontribution()
            }
            setPaying(false)
          })
          .catch(() => setPaying(false))
      },
      onClose: function () {
        setPaying(false)
      },
    })

    handler.openIframe()
  }

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-5 py-10 text-white">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!kontribution) {
    return (
      <main className="max-w-md mx-auto px-5 py-10 text-white">
        <p className="text-gray-400">Kontribution not found.</p>
      </main>
    )
  }

  const progress = Math.min(
    (kontribution.amount_raised / kontribution.amount) * 100,
    100
  )

  return (
    <main className="max-w-md mx-auto px-5 py-10 text-white">
      <h1 className="text-2xl font-extrabold mb-2">{kontribution.title}</h1>
      {kontribution.description && (
        <p className="text-gray-400 mb-6">{kontribution.description}</p>
      )}

      <div className="mb-2 flex justify-between text-sm">
        <span className="font-semibold">
          ₦{kontribution.amount_raised.toLocaleString()} raised
        </span>
        <span className="text-gray-500">
          of ₦{kontribution.amount.toLocaleString()}
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-3 mb-8">
        <div
          className="bg-purple-600 h-3 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Amount to kontribute</label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">₦</span>
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="1000"
            className="w-full rounded-xl bg-gray-900 border border-gray-700 pl-8 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
      >
        {paying ? 'Processing...' : 'Kontribute Now'}
      </button>
    </main>
  )
}

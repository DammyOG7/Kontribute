'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function KontributionPage({ params }) {
  const [kontribution, setKontribution] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKontribution = async () => {
      const { data } = await supabase
        .from('kontributions')
        .select()
        .eq('id', params.id)
        .single()

      setKontribution(data)
      setLoading(false)
    }

    fetchKontribution()
  }, [params.id])

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

      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition">
        Kontribute Now
      </button>
    </main>
  )
}

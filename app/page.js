'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function CreateKontribute() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('kontributions')
      .insert([
        {
          title,
          description,
          amount: parseFloat(amount),
          deadline: deadline || null,
        },
      ])
      .select()
      .single()

    setLoading(false)

    if (error) {
      setError('Something went wrong. Try again.')
      console.error(error)
      return
    }

   router.push(`/k/${data.id}/manage?token=${data.creator_token}`)

  }

  return (
    <main className="max-w-md mx-auto px-5 py-10 text-white">
      <h1 className="text-3xl font-extrabold mb-1">Kontribute 🙏</h1>
      <p className="text-gray-400 mb-8">Ask for it. Get it.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">What's this for?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Send me for shawarma 🌯"
            className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Give the gist</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell them why they should send it..."
            rows={3}
            className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">How much?</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 pl-8 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
        >
          {loading ? 'Creating...' : 'Create Kontribution'}
        </button>
      </form>
    </main>
  )
}

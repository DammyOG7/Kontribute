'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

export default function ManageKontribution({ params }) {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [kontribution, setKontribution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)

  const fetchKontribution = async () => {
    const { data } = await supabase
      .from('kontributions')
      .select()
      .eq('id', params.id)
      .single()

    if (data && data.creator_token === token) {
      setAuthorized(true)
      setKontribution(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchKontribution()
  }, [params.id, token])

  const handleWithdrawRequest = async (e) => {
    e.preventDefault()
    setSubmittingWithdraw(true)

    const res = await fetch('/api/request-withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kontributionId: params.id,
        token,
        bankName,
        accountNumber,
        accountName,
      }),
    })

    const data = await res.json()
    setSubmittingWithdraw(false)

    if (data.success) {
      fetchKontribution()
      setShowWithdraw(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-5 py-10 text-white">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  if (!authorized || !kontribution) {
    return (
      <main className="max-w-md mx-auto px-5 py-10 text-white">
        <p className="text-gray-400">You don't have access to manage this kontribution.</p>
      </main>
    )
  }

  const progress = Math.min(
    (kontribution.amount_raised / kontribution.amount) * 100,
    100
  )

  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/k/${params.id}` : ''

  return (
    <main className="max-w-md mx-auto px-5 py-10 text-white">
      <p className="text-xs text-purple-400 font-semibold mb-1">CREATOR VIEW</p>
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

      <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
        <div
          className="bg-purple-600 h-3 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

         <div className="mb-8 p-4 rounded-xl bg-gray-900 border border-gray-700">
        <p className="text-xs text-gray-500 mb-1">Share this link to collect kontributions:</p>
        <p className="text-sm text-purple-400 break-all mb-3">{publicLink}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(publicLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg transition"
        >
          {copied ? 'Copied! ✓' : 'Copy Link'}
        </button>
      </div>

  <div className="border-t border-gray-800 pt-6">
        {kontribution.withdrawal_status === 'requested' ? (
          <p className="text-sm text-gray-400">
            Withdrawal requested — payout pending. You'll be paid directly to your bank once processed.
          </p>
        ) : kontribution.withdrawal_status === 'paid' ? (
          <p className="text-sm text-green-500">Payout completed ✅</p>
        ) : !showWithdraw ? (
          <button
            onClick={() => setShowWithdraw(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
          >
            Request Withdrawal
          </button>
        ) : (
          <form onSubmit={handleWithdrawRequest} className="space-y-3">
            <p className="text-sm font-semibold">Enter your bank details</p>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account number"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account name"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
            <button
              type="submit"
              disabled={submittingWithdraw}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {submittingWithdraw ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

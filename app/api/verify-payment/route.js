import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PLATFORM_FEE_PERCENT = 10

export async function POST(request) {
  const { reference, kontributionId, amount } = await request.json()

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  )

  const verifyData = await verifyRes.json()

  if (!verifyData.status || verifyData.data.status !== 'success') {
    return NextResponse.json({ success: false, error: 'Payment not verified' }, { status: 400 })
  }

  const { data: kontribution, error: fetchError } = await supabaseAdmin
    .from('kontributions')
    .select('amount_raised')
    .eq('id', kontributionId)
    .single()

  if (fetchError) {
    return NextResponse.json({ success: false, error: 'Kontribution not found' }, { status: 404 })
  }

  const grossAmount = parseFloat(amount)
  const platformFee = grossAmount * (PLATFORM_FEE_PERCENT / 100)
  const netAmount = grossAmount - platformFee

  const newAmountRaised = parseFloat(kontribution.amount_raised) + netAmount

  const { error: updateError } = await supabaseAdmin
    .from('kontributions')
    .update({ amount_raised: newAmountRaised })
    .eq('id', kontributionId)

  if (updateError) {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }

  return NextResponse.json({ success: true, newAmountRaised, platformFee })
}

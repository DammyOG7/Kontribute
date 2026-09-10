import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const { kontributionId, bankName, accountNumber, accountName } = await request.json()

  const { error } = await supabaseAdmin
    .from('kontributions')
    .update({
      withdrawal_status: 'requested',
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      withdrawal_requested_at: new Date().toISOString(),
    })
    .eq('id', kontributionId)

  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to save request' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf-8')
let url = ''
let key = ''
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/"/g, '')
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/"/g, '')
}

const supabase = createClient(url, key)

async function test() {
  const { data, error } = await supabase.from('payments').insert({
    invoice_id: '3c359a50-cb7e-48fe-a71d-c9532f6179b5',
    amount: 0.01,
    method: 'cash',
    payment_date: new Date().toISOString()
  }).select()
  
  if (error) {
    console.error('SUPABASE ERROR:', JSON.stringify(error, null, 2))
  } else {
    console.log('SUCCESS:', data)
    // Cleanup so we don't leave a 0.01 payment
    await supabase.from('payments').delete().eq('id', data[0].id)
  }
}

test()

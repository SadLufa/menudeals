// Quick database schema check
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yahptwlgpkielctfxmfs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaHB0d2xncGtpZWxjdGZ4bWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTAxNDIsImV4cCI6MjA3MDU4NjE0Mn0.Zxo5Sd0Ls7u_V9p6Ssw0qfWgH__W0_WsotyFT9dM9xs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  // Check what columns exist in restaurants table
  const { data, error } = await supabase
    .from('restaurants')
    .select()
    .limit(1)
  
  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Current columns in restaurants table:', Object.keys(data[0] || {}))
  }
}

checkSchema()

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return singleton instance
  if (client) {
    return client
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase Client Init - URL exists:', !!url)
  console.log('Supabase Client Init - Key exists:', !!key)
  console.log('Supabase Client Init - URL value:', url?.substring(0, 30) + '...')

  if (!url || !key) {
    console.error('FATAL: Supabase environment variables not set!', { url: !!url, key: !!key })
    throw new Error('Supabase URL or Key not configured')
  }

  client = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  })

  console.log('Supabase Client Init - Client created successfully')
  return client
}

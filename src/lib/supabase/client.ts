import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase Client Init - URL exists:', !!url)
  console.log('Supabase Client Init - Key exists:', !!key)
  console.log('Supabase Client Init - URL value:', url?.substring(0, 30) + '...')

  if (!url || !key) {
    console.error('FATAL: Supabase environment variables not set!', { url: !!url, key: !!key })
    throw new Error('Supabase URL or Key not configured')
  }

  // Use default configuration to match server-side cookies
  const client = createBrowserClient(url, key)
  console.log('Supabase Client Init - Client created successfully')
  return client
}

import { createBrowserClient } from '@supabase/ssr'

export async function logActivity(action: string, details: any) {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('activity_log').insert({
      user_id: user?.id,
      user_email: user?.email,
      action: action,
      details: details,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
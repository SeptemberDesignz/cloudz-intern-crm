import { createBrowserClient } from '@supabase/ssr'

export async function sendNotificationToInterns(
  internIds: string[],
  title: string,
  message: string,
  type: string = 'info'
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const notifications = internIds.map(internId => ({
    intern_id: internId,
    title,
    message,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) {
    console.error('Failed to send notifications:', error)
  }
}

export async function sendNotificationToAllInterns(
  title: string,
  message: string,
  type: string = 'info'
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: interns } = await supabase
    .from('interns')
    .select('id')

  if (interns && interns.length > 0) {
    await sendNotificationToInterns(
      interns.map(i => i.id),
      title,
      message,
      type
    )
  }
}
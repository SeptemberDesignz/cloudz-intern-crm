'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { Calendar, Clock, MapPin, Video, Users } from 'lucide-react'

export default function SchedulePage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      fetchSchedule()
    }
  }, [user])

  async function fetchSchedule() {
    // Get intern ID
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    // Fetch events for this intern or general events
    let query = supabase
      .from('calendar_events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (internData) {
      query = query.eq('intern_id', internData.id)
    }

    const { data } = await query
    setEvents(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          My Schedule
        </h1>
        <p className="text-gray-500 mt-1">View your internship schedule and upcoming events</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No upcoming events scheduled</p>
          <p className="text-sm">Check back later for your internship schedule</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  {event.type === 'meeting' ? <Users className="w-6 h-6 text-purple-600" /> :
                   event.type === 'online' ? <Video className="w-6 h-6 text-blue-600" /> :
                   <MapPin className="w-6 h-6 text-green-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
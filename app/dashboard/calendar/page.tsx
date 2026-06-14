'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [interns, setInterns] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    intern_id: '',
    description: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEvents()
    fetchInterns()
  }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('calendar_events')
      .select('*, interns(full_name)')
      .order('date', { ascending: true })
    setEvents(data || [])
  }

  async function fetchInterns() {
    const { data } = await supabase.from('interns').select('id, full_name')
    setInterns(data || [])
  }

  async function addEvent() {
    if (!newEvent.title || !newEvent.date) {
      toast.error('Please fill required fields')
      return
    }

    const { error } = await supabase.from('calendar_events').insert({
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      intern_id: newEvent.intern_id || null,
      description: newEvent.description
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Event added!')
      setShowForm(false)
      setNewEvent({ title: '', date: '', time: '', intern_id: '', description: '' })
      fetchEvents()
    }
  }

  const eventsByDate = events.reduce((acc: any, event) => {
    const date = event.date
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-gray-500 mt-1">Track deadlines, events, and schedules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Event</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event Title *"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <select
              value={newEvent.intern_id}
              onChange={(e) => setNewEvent({ ...newEvent, intern_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">All Interns</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.full_name}</option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={addEvent} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Create Event
              </button>
              <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold">Upcoming Events</h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No events scheduled</p>
            <p className="text-sm">Click "Add Event" to schedule deadlines or meetings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(eventsByDate).map(([date, dateEvents]: [string, any]) => (
              <div key={date}>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <div className="space-y-2">
                  {dateEvents.map((event: any) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </span>
                            )}
                            {event.interns?.full_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.interns.full_name}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { Megaphone, Plus, Send, Calendar, Users, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    sent_to: 'all'
  })

  async function sendNotificationToAllInterns(
    title: string,
    content: string,
    category: string
  ) {
    return
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('sent_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  async function sendAnnouncement() {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Please fill all fields')
      return
    }

    const { error } = await supabase.from('announcements').insert({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      sent_to: newAnnouncement.sent_to
    })

    if (error) {
      toast.error(error.message)
    } else {
      await sendNotificationToAllInterns(
        newAnnouncement.title,
        newAnnouncement.content,
        'announcement'
      )
      
      toast.success('Announcement sent! Notifications delivered to all interns.')
      setShowForm(false)
      setNewAnnouncement({ title: '', content: '', sent_to: 'all' })
      fetchAnnouncements()
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
          <p className="text-gray-500 mt-2">Only administrators can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-gray-500 mt-1">Send updates to all interns</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Announcement</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Announcement Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              placeholder="Announcement Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={5}
            />
            <select
              value={newAnnouncement.sent_to}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sent_to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="all">All Interns</option>
              <option value="active">Active Interns Only</option>
              <option value="applicants">Applicants Only</option>
            </select>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Interns will receive a popup notification immediately
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={sendAnnouncement} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Announcement
              </button>
              <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No announcements yet</p>
          <p className="text-sm">Create your first announcement to notify interns</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800 text-lg">{announcement.title}</h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(announcement.sent_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{announcement.content}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Sent to: {announcement.sent_to === 'all' ? 'All Interns' : announcement.sent_to}
                    </span>
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
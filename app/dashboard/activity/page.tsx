'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, Calendar, Eye, Activity, Clock } from 'lucide-react'

interface Activity {
  id: string
  user_email: string
  action: string
  details: any
  created_at: string
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setActivities(data)
    }
    setLoading(false)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('add')) return '➕'
    if (action.includes('edit')) return '✏️'
    if (action.includes('delete')) return '🗑️'
    if (action.includes('login')) return '🔐'
    return '📝'
  }

  const getActionColor = (action: string) => {
    if (action.includes('add')) return 'text-green-600 bg-green-50'
    if (action.includes('edit')) return 'text-blue-600 bg-blue-50'
    if (action.includes('delete')) return 'text-red-600 bg-red-50'
    if (action.includes('login')) return 'text-purple-600 bg-purple-50'
    return 'text-gray-600 bg-gray-50'
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'interns') return activity.action.includes('intern')
    if (filter === 'tasks') return activity.action.includes('task')
    if (filter === 'users') return activity.action.includes('user')
    return true
  })

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
          Activity Log
        </h1>
        <p className="text-gray-500 mt-1">Track all actions and changes in the system</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {[
          { value: 'all', label: 'All Activities' },
          { value: 'interns', label: 'Interns' },
          { value: 'tasks', label: 'Tasks' },
          { value: 'users', label: 'Users' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === f.value
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActionColor(activity.action)}`}>
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{activity.action}</span>
                    {activity.details && (
                      <span className="text-sm text-gray-600">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <span key={key} className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-1 text-xs">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user_email || 'System'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Total Activities Logged</span>
          </div>
          <span className="font-bold text-gray-800">{activities.length}</span>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Activity, User, Calendar, Filter, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([])
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
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setActivities(data || [])
    setLoading(false)
  }

  async function exportActivities() {
    const exportData = activities.map(activity => ({
      'Action': activity.action,
      'User': activity.user_email,
      'Details': JSON.stringify(activity.details),
      'Date': new Date(activity.created_at).toLocaleString()
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Log')
    XLSX.writeFile(wb, `activity-log-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('add')) return '➕'
    if (action.includes('edit')) return '✏️'
    if (action.includes('delete')) return '🗑️'
    if (action.includes('login')) return '🔐'
    return '📝'
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.action.includes(filter)
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Activity Log
          </h1>
          <p className="text-gray-500 mt-1">Track all actions and changes in the system</p>
        </div>
        <button
          onClick={exportActivities}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Log
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {[
          { value: 'all', label: 'All' },
          { value: 'intern', label: 'Interns' },
          { value: 'task', label: 'Tasks' },
          { value: 'login', label: 'Logins' }
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

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No activities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getActionIcon(activity.action)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.action}</p>
                  {activity.details && (
                    <p className="text-sm text-gray-500 mt-1">
                      {Object.entries(activity.details).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
          ))}
        </div>
      )}
    </div>
  )
}
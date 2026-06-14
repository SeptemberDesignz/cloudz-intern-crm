'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { CheckSquare, Calendar, Clock, CheckCircle, Circle } from 'lucide-react'

export default function MyTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      fetchMyTasks()
    }
  }, [user])

  async function fetchMyTasks() {
    // First get the intern record to get intern_id
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (internData) {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('intern_id', internData.id)
        .order('created_at', { ascending: false })

      setTasks(data || [])
    }
    setLoading(false)
  }

  async function updateTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (!error) {
      fetchMyTasks()
    }
  }

  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
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
          My Tasks
        </h1>
        <p className="text-gray-500 mt-1">View and track your assigned tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No tasks assigned yet</p>
          <p className="text-sm">Your tasks will appear here once assigned by your mentor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-start gap-4">
                <button onClick={() => updateTaskStatus(task.id, task.status)} className="mt-1">
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
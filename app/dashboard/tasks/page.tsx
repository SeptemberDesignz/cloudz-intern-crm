'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { CheckSquare, Plus, Calendar, Clock, Trash2, CheckCircle, Circle, Users, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function TasksPage() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [interns, setInterns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    intern_id: '',
    due_date: '',
    status: 'pending'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTasks()
    fetchInterns()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*, interns(full_name, email)')
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  async function fetchInterns() {
    const { data } = await supabase.from('interns').select('id, full_name, email')
    setInterns(data || [])
  }

  async function addTask() {
    if (!newTask.title || !newTask.intern_id) {
      toast.error('Please fill required fields')
      return
    }

    const { error } = await supabase.from('tasks').insert({
      title: newTask.title,
      description: newTask.description,
      intern_id: newTask.intern_id,
      due_date: newTask.due_date,
      status: 'pending'
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Task assigned successfully!')
      setShowForm(false)
      setNewTask({ title: '', description: '', intern_id: '', due_date: '', status: 'pending' })
      fetchTasks()
    }
  }

  async function updateTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', taskId)
    
    if (!error) {
      toast.success(`Task marked as ${newStatus}`)
      fetchTasks()
    }
  }

  async function deleteTask(taskId: string) {
    if (confirm('Delete this task?')) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (!error) {
        toast.success('Task deleted')
        fetchTasks()
      }
    }
  }

  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
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
            Task Management
          </h1>
          <p className="text-gray-500 mt-1">Assign and track tasks for interns</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Assign Task
        </button>
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

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assign New Task</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task Title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              rows={3}
            />
            <select
              value={newTask.intern_id}
              onChange={(e) => setNewTask({ ...newTask, intern_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select Intern *</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.full_name} ({intern.email})</option>
              ))}
            </select>
            <input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <div className="flex gap-3">
              <button onClick={addTask} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Assign Task
              </button>
              <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No tasks assigned yet</p>
          <p className="text-sm">Click "Assign Task" to create tasks for interns</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
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
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Assigned to: {task.interns?.full_name || 'Unknown'}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
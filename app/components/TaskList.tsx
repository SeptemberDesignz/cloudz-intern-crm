'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle, Circle, Plus, Trash2, Clock, Calendar, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description: string
  status: string
  due_date: string
  created_at: string
}

export default function TaskList({ internId }: { internId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTasks()
  }, [internId])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('intern_id', internId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
  }

  async function addTask() {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const { error } = await supabase.from('tasks').insert({
      intern_id: internId,
      title: newTask.title,
      description: newTask.description || null,
      due_date: newTask.due_date || null,
      status: 'pending'
    })

    if (error) {
      toast.error('Failed to add task')
    } else {
      toast.success('Task added successfully!')
      setNewTask({ title: '', description: '', due_date: '' })
      setShowForm(false)
      fetchTasks()
    }
  }

  async function updateTask(taskId: string, updates: any) {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)

    if (error) {
      toast.error('Failed to update task')
    } else {
      fetchTasks()
    }
  }

  async function deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) {
        toast.error('Failed to delete task')
      } else {
        toast.success('Task deleted')
        fetchTasks()
      }
    }
  }

  function getDaysUntilDue(dueDate: string) {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusCounts = () => {
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    }
  }

  const counts = getStatusCounts()

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">Tasks & Assignments</h3>
          <div className="flex gap-3 mt-1 text-xs">
            <span className="text-yellow-600">📋 Pending: {counts.pending}</span>
            <span className="text-blue-600">🔄 In Progress: {counts.in_progress}</span>
            <span className="text-green-600">✅ Completed: {counts.completed}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingTask(null)
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add/Edit Task Form */}
      {showForm && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg space-y-3 border border-gray-200">
          <input
            type="text"
            placeholder="Task title *"
            value={editingTask ? editingTask.title : newTask.title}
            onChange={(e) => editingTask 
              ? setEditingTask({ ...editingTask, title: e.target.value })
              : setNewTask({ ...newTask, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={editingTask ? editingTask.description || '' : newTask.description}
            onChange={(e) => editingTask
              ? setEditingTask({ ...editingTask, description: e.target.value })
              : setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={2}
          />
          <input
            type="date"
            value={editingTask ? editingTask.due_date?.split('T')[0] || '' : newTask.due_date}
            onChange={(e) => editingTask
              ? setEditingTask({ ...editingTask, due_date: e.target.value })
              : setNewTask({ ...newTask, due_date: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          {editingTask && (
            <select
              value={editingTask.status}
              onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (editingTask) {
                  await updateTask(editingTask.id, {
                    title: editingTask.title,
                    description: editingTask.description,
                    due_date: editingTask.due_date,
                    status: editingTask.status
                  })
                  setEditingTask(null)
                  toast.success('Task updated!')
                } else {
                  await addTask()
                }
                setShowForm(false)
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded text-sm"
            >
              {editingTask ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
              className="border px-4 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet</p>
            <p className="text-sm">Click "Add Task" to assign work to this intern</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              task.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              <button
                onClick={() => updateTask(task.id, { 
                  status: task.status === 'completed' ? 'pending' : 'completed' 
                })}
                className="mt-0.5"
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.status === 'in_progress' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">In Progress</span>
                  )}
                </div>
                {task.description && (
                  <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className={`text-xs ${
                      getDaysUntilDue(task.due_date) < 0 
                        ? 'text-red-500' 
                        : getDaysUntilDue(task.due_date) <= 3 
                          ? 'text-orange-500' 
                          : 'text-gray-400'
                    }`}>
                      {getDaysUntilDue(task.due_date) < 0 
                        ? `Overdue by ${Math.abs(getDaysUntilDue(task.due_date))} days`
                        : getDaysUntilDue(task.due_date) === 0
                          ? 'Due today'
                          : `Due in ${getDaysUntilDue(task.due_date)} days`
                      }
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingTask(task)
                    setShowForm(true)
                  }}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BookOpen, Play, CheckCircle, Plus, Calendar, Clock, Video, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    duration: '',
    materials_url: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTrainings()
  }, [])

  async function fetchTrainings() {
    const { data } = await supabase
      .from('training_sessions')
      .select('*')
      .order('created_at', { ascending: false })
    setTrainings(data || [])
    setLoading(false)
  }

  async function addTraining() {
    if (!newTraining.title) {
      toast.error('Please enter a title')
      return
    }

    const { error } = await supabase.from('training_sessions').insert({
      title: newTraining.title,
      description: newTraining.description,
      duration: parseInt(newTraining.duration) || 0,
      materials_url: newTraining.materials_url
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Training session added!')
      setShowForm(false)
      setNewTraining({ title: '', description: '', duration: '', materials_url: '' })
      fetchTrainings()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Training Management
          </h1>
          <p className="text-gray-500 mt-1">Track training sessions and learning materials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Training
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Training Session</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Training Title *"
              value={newTraining.title}
              onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <textarea
              placeholder="Description"
              value={newTraining.description}
              onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              rows={3}
            />
            <input
              type="text"
              placeholder="Duration (e.g., 2 hours)"
              value={newTraining.duration}
              onChange={(e) => setNewTraining({ ...newTraining, duration: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <input
              type="url"
              placeholder="Materials URL (optional)"
              value={newTraining.materials_url}
              onChange={(e) => setNewTraining({ ...newTraining, materials_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            <div className="flex gap-3">
              <button onClick={addTraining} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Create Training
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
      ) : trainings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No training sessions yet</p>
          <p className="text-sm">Click "Add Training" to create learning materials</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <div key={training.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{training.title}</h3>
              {training.description && (
                <p className="text-gray-600 text-sm mb-3">{training.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {training.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {training.duration}
                  </span>
                )}
                {training.materials_url && (
                  <a href={training.materials_url} target="_blank" className="text-blue-500 hover:text-blue-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Materials
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
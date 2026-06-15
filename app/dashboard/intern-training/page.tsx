'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Play, CheckCircle, Clock, Video, FileText, ExternalLink } from 'lucide-react'

export default function InternTrainingPage() {
  const { user } = useAuth()
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
          Training Materials
        </h1>
        <p className="text-gray-500 mt-1">Access your learning resources and training content</p>
      </div>

      {trainings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No training materials available yet</p>
          <p className="text-sm">Check back later for new content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <div key={training.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    {training.type === 'video' ? <Video className="w-6 h-6 text-purple-600" /> : <BookOpen className="w-6 h-6 text-purple-600" />}
                  </div>
                  <h3 className="font-semibold text-gray-800 flex-1">{training.title}</h3>
                </div>
                
                {training.description && (
                  <p className="text-gray-600 text-sm mb-4">{training.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  {training.duration && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {training.duration}
                    </span>
                  )}
                  {training.materials_url && (
                    <a
                      href={training.materials_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Material
                    </a>
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
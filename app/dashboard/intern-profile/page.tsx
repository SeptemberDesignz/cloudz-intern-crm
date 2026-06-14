'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { Mail, Phone, GraduationCap, Briefcase, User, Calendar, Edit } from 'lucide-react'
import Link from 'next/link'

export default function InternProfilePage() {
  const { user } = useAuth()
  const [intern, setIntern] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      fetchMyProfile()
    }
  }, [user])

  async function fetchMyProfile() {
    const { data, error } = await supabase
      .from('interns')
      .select('*')
      .eq('email', user?.email)
      .single()

    if (error) {
      console.error('Profile not found:', error)
      setIntern(null)
    } else {
      setIntern(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!intern) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-500">Your intern profile has not been set up yet. Please contact your administrator.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-500 mt-1">View your personal information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl backdrop-blur-sm">
              {intern.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{intern.full_name}</h2>
              <p className="text-blue-100">{intern.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                {intern.stage?.toUpperCase() || 'Intern'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{intern.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{intern.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Education</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span>{intern.university || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 ml-6">
                  <Briefcase className="w-4 h-4" />
                  <span>{intern.course || 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Internship Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Mentor: {intern.mentor || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {new Date(intern.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {intern.notes && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Notes</h3>
                <p className="text-gray-600">{intern.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
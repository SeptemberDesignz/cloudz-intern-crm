'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, GraduationCap, Briefcase, User, Calendar, Edit, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function InternProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [intern, setIntern] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchIntern()
  }, [])

  async function fetchIntern() {
    try {
      const { data, error } = await supabase
        .from('interns')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()

      if (error) {
        console.error('Fetch error:', error)
        setError(error.message)
      } else if (!data) {
        setError('Intern not found')
      } else {
        setIntern(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !intern) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Intern Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The requested intern profile does not exist.'}</p>
        <button
          onClick={() => router.push('/dashboard/interns')}
          className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Interns
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Interns
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
              {intern.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{intern.full_name}</h1>
              <p className="text-gray-500 mt-1">{intern.email}</p>
            </div>
          </div>
          {isAdmin && (
            <Link href={`/dashboard/edit-intern/${intern.id}`}>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{intern.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{intern.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Education</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span>{intern.university || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{intern.course || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Internship Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Mentor: {intern.mentor || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined: {new Date(intern.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {intern.notes && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Notes</h3>
              <p className="text-gray-600">{intern.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
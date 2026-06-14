'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, GraduationCap, Briefcase, User, Calendar, Edit } from 'lucide-react'
import FileUpload from '../../../components/FileUpload'
import TaskList from '../../../components/TaskList'

interface Intern {
  id: string
  full_name: string
  email: string
  phone: string
  university: string
  course: string
  stage: string
  mentor: string
  notes: string
  created_at: string
}

export default function InternProfile({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [intern, setIntern] = useState<Intern | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchIntern()
  }, [])

  async function fetchIntern() {
    const { data, error } = await supabase
      .from('interns')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      toast.error('Intern not found')
      router.push('/dashboard/interns')
    } else {
      setIntern(data)
    }
    setLoading(false)
  }

  function getStageBadge(stage: string) {
    const styles: any = {
      applied: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-blue-100 text-blue-800',
      offer: 'bg-purple-100 text-purple-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return styles[stage] || styles.applied
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!intern) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interns
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {intern.full_name}
            </h1>
            <p className="text-gray-500 mt-1">Intern Profile</p>
          </div>
          <Link href={`/dashboard/edit-intern/${intern.id}`}>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3">
                {intern.full_name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{intern.full_name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStageBadge(intern.stage)}`}>
                {intern.stage.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{intern.email}</span>
              </div>
              {intern.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{intern.phone}</span>
                </div>
              )}
              {intern.university && (
                <div className="flex items-center gap-3 text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{intern.university}</span>
                </div>
              )}
              {intern.course && (
                <div className="flex items-center gap-3 text-gray-600 ml-6">
                  <span className="text-sm">• {intern.course}</span>
                </div>
              )}
              {intern.mentor && (
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Mentor: {intern.mentor}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined: {new Date(intern.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tasks & Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes Section */}
          {intern.notes && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-3">📝 Notes</h3>
              <p className="text-gray-600">{intern.notes}</p>
            </div>
          )}

          {/* Tasks Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <TaskList internId={intern.id} />
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">📄 Documents</h3>
            <FileUpload internId={intern.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
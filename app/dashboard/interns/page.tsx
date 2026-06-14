'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Search, Trash2, Edit, Mail, Phone, GraduationCap, User, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Intern {
  id: string
  full_name: string
  email: string
  university: string
  course: string
  stage: string
  phone: string
  mentor?: string
  created_at: string
}

export default function InternsList() {
  const { isAdmin, isViewer, canEdit, canDelete } = useAuth()
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInterns()
  }, [])

  async function fetchInterns() {
    const { data, error } = await supabase
      .from('interns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Error fetching interns')
    } else {
      setInterns(data || [])
    }
    setLoading(false)
  }

  async function deleteIntern(id: string) {
    if (!canDelete) {
      toast.error('You do not have permission to delete interns')
      return
    }
    
    if (confirm('Are you sure you want to delete this intern?')) {
      const { error } = await supabase.from('interns').delete().eq('id', id)
      if (error) {
        toast.error('Error deleting intern')
      } else {
        toast.success('Intern deleted successfully')
        fetchInterns()
      }
    }
  }

  const exportToExcel = () => {
    const exportData = interns.map(intern => ({
      'Full Name': intern.full_name,
      'Email': intern.email,
      'Phone': intern.phone || '-',
      'University': intern.university || '-',
      'Course': intern.course || '-',
      'Stage': intern.stage,
      'Mentor': intern.mentor || '-',
      'Joined Date': new Date(intern.created_at).toLocaleDateString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interns')
    XLSX.writeFile(workbook, `cloudz-interns-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Export complete!')
  }

  function getStageColor(stage: string) {
    const colors: { [key: string]: { bg: string; text: string; dot: string } } = {
      applied: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      interview: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      offer: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
      active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      completed: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
    }
    return colors[stage] || colors.applied
  }

  const filteredInterns = interns.filter(intern =>
    intern.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (intern.university && intern.university.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
          All Interns
        </h1>
        <p className="text-gray-500 mt-1">Manage and track your intern cohort</p>
        {isViewer && (
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
            <span>👁️</span> You have view-only access
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          {isAdmin && (
            <Link href="/dashboard/add-intern">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:opacity-90 font-semibold shadow-lg">
                + Add New Intern
              </button>
            </Link>
          )}
        </div>
      </div>

      {filteredInterns.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No interns found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterns.map((intern) => {
            const stageStyle = getStageColor(intern.stage)
            return (
              <div key={intern.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Link href={`/dashboard/interns/${intern.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {intern.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 hover:text-purple-600">
                            {intern.full_name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${stageStyle.dot}`}></div>
                            <span className={`text-xs font-medium ${stageStyle.text}`}>
                              {intern.stage.charAt(0).toUpperCase() + intern.stage.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      {canEdit && (
                        <Link href={`/dashboard/edit-intern/${intern.id}`}>
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                            <Edit className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          </button>
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => deleteIntern(intern.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{intern.email}</span>
                    </div>
                    {intern.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{intern.phone}</span>
                      </div>
                    )}
                    {intern.university && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span className="truncate">{intern.university}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
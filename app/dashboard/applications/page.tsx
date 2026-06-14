'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, CheckCircle, XCircle, Clock, Mail, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    const { data } = await supabase
      .from('interns')
      .select('*')
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('interns')
      .update({ stage: newStatus })
      .eq('id', id)
    
    if (!error) {
      fetchApplications()
    }
  }

  const getStatusBadge = (stage: string) => {
    const styles: any = {
      applied: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      active: 'bg-emerald-100 text-emerald-800',
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Intern Applications
        </h1>
        <p className="text-gray-500 mt-1">Review and manage internship applications</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">Applicant</th>
                <th className="p-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="p-4 text-left font-semibold text-gray-700">University</th>
                <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                <th className="p-4 text-left font-semibold text-gray-700">Applied</th>
                <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {app.full_name?.charAt(0)}
                      </div>
                      <span className="font-medium">{app.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {app.email}
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          {app.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{app.university || '-'}</p>
                      <p className="text-sm text-gray-500">{app.course || '-'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={app.stage}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusBadge(app.stage)}`}
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/interns/${app.id}`}>
                      <button className="text-blue-500 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No applications yet
          </div>
        )}
      </div>
    </div>
  )
}
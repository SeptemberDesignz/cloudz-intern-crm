'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { FileText, Upload, Calendar, CheckCircle, Clock, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InternReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    content: '',
    week_number: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      fetchMyReports()
    }
  }, [user])

  async function fetchMyReports() {
    // Get intern ID from email
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (internData) {
      const { data } = await supabase
        .from('intern_reports')
        .select('*')
        .eq('intern_id', internData.id)
        .order('created_at', { ascending: false })

      setReports(data || [])
    }
    setLoading(false)
  }

  async function submitReport() {
    if (!newReport.title || !newReport.content) {
      toast.error('Please fill all required fields')
      return
    }

    // Get intern ID
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (!internData) {
      toast.error('Intern profile not found')
      return
    }

    const { error } = await supabase.from('intern_reports').insert({
      intern_id: internData.id,
      title: newReport.title,
      content: newReport.content,
      week_number: newReport.week_number || null,
      status: 'submitted'
    })

    if (error) {
      toast.error('Failed to submit report')
    } else {
      toast.success('Report submitted successfully!')
      setShowForm(false)
      setNewReport({ title: '', content: '', week_number: '' })
      fetchMyReports()
    }
  }

  const stats = {
    submitted: reports.filter(r => r.status === 'submitted').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    total: reports.length,
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            My Reports
          </h1>
          <p className="text-gray-500 mt-1">Submit weekly reports and track feedback</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Submit Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <FileText className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Total Reports</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Clock className="w-8 h-8 text-yellow-500 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Submitted</h3>
          <p className="text-3xl font-bold">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Reviewed</h3>
          <p className="text-3xl font-bold">{stats.reviewed}</p>
        </div>
      </div>

      {/* Submit Report Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit Weekly Report</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Report Title *"
              value={newReport.title}
              onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Week Number (e.g., Week 1)"
              value={newReport.week_number}
              onChange={(e) => setNewReport({ ...newReport, week_number: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              placeholder="Report Content *"
              value={newReport.content}
              onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={6}
            />
            <div className="flex gap-3">
              <button onClick={submitReport} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Submit Report
              </button>
              <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No reports submitted yet</p>
          <p className="text-sm">Click "Submit Report" to share your weekly update</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-gray-800">{report.title}</h3>
                    {report.week_number && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {report.week_number}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{report.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Submitted: {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      report.status === 'reviewed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {report.status === 'reviewed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      Status: {report.status}
                    </span>
                  </div>
                  {report.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Feedback from Manager:</p>
                      <p className="text-sm text-blue-600">{report.feedback}</p>
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
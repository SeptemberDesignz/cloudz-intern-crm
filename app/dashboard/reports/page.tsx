'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BarChart, Download, TrendingUp, Users, Calendar, Award, FileText, PieChart } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
  const [interns, setInterns] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [internsRes, tasksRes] = await Promise.all([
      supabase.from('interns').select('*'),
      supabase.from('tasks').select('*, interns(full_name)')
    ])
    setInterns(internsRes.data || [])
    setTasks(tasksRes.data || [])
    setLoading(false)
  }

  async function exportReport() {
    const reportData = interns.map(intern => ({
      'Full Name': intern.full_name,
      'Email': intern.email,
      'University': intern.university || '-',
      'Course': intern.course || '-',
      'Status': intern.stage,
      'Mentor': intern.mentor || '-',
      'Joined Date': new Date(intern.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(reportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Interns Report')
    XLSX.writeFile(wb, `interns-report-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const stats = {
    total: interns.length,
    active: interns.filter(i => i.stage === 'active').length,
    completed: interns.filter(i => i.stage === 'completed').length,
    pendingTasks: tasks.filter(t => t.status !== 'completed').length,
    completionRate: tasks.length > 0 ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1) : 0
  }

  const stageData = [
    { name: 'Applied', count: interns.filter(i => i.stage === 'applied').length },
    { name: 'Interview', count: interns.filter(i => i.stage === 'interview').length },
    { name: 'Active', count: interns.filter(i => i.stage === 'active').length },
    { name: 'Completed', count: interns.filter(i => i.stage === 'completed').length },
    { name: 'Rejected', count: interns.filter(i => i.stage === 'rejected').length }
  ].filter(s => s.count > 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">Generate insights and download reports</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <Users className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="text-sm text-gray-500">Total Interns</h3>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="text-sm text-gray-500">Active Interns</h3>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <Award className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="text-sm text-gray-500">Completed</h3>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <FileText className="w-8 h-8 text-orange-500 mb-3" />
              <h3 className="text-sm text-gray-500">Task Completion</h3>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Intern Pipeline
              </h3>
              <div className="space-y-3">
                {stageData.map((stage) => (
                  <div key={stage.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{stage.name}</span>
                      <span>{stage.count} ({((stage.count / stats.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${(stage.count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {interns.slice(0, 5).map((intern) => (
                  <div key={intern.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{intern.full_name}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(intern.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      intern.stage === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {intern.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* University Distribution */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">University Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(
                interns.reduce((acc: any, intern) => {
                  const uni = intern.university || 'Not Specified'
                  acc[uni] = (acc[uni] || 0) + 1
                  return acc
                }, {})
              ).map(([uni, count]: [string, any]) => (
                <div key={uni} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">{uni}</span>
                  <span className="font-semibold">{count} intern(s)</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
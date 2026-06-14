'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function MyAttendancePage() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      fetchMyAttendance()
    }
  }, [user])

  async function fetchMyAttendance() {
    // First get the intern record
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (internData) {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('intern_id', internData.id)
        .order('date', { ascending: false })

      setAttendance(data || [])
    }
    setLoading(false)
  }

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    total: attendance.length,
    rate: attendance.length > 0 
      ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
      : 0
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
          My Attendance
        </h1>
        <p className="text-gray-500 mt-1">View your attendance history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Total Days</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Present</h3>
          <p className="text-3xl font-bold text-green-600">{stats.present}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Absent</h3>
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Attendance Rate</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.rate}%</p>
        </div>
      </div>

      {/* Attendance History */}
      {attendance.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No attendance records yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Check In</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    {record.status === 'present' ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Present
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        Absent
                      </span>
                    )}
                  </td>
                  <td className="p-4">{record.check_in || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
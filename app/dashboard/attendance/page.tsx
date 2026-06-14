'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Calendar, Clock, CheckCircle, XCircle, User, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [interns, setInterns] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInterns()
    fetchAttendance()
  }, [selectedDate])

  async function fetchInterns() {
    const { data } = await supabase.from('interns').select('*')
    setInterns(data || [])
    setLoading(false)
  }

  async function fetchAttendance() {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', selectedDate)
    setAttendance(data || [])
  }

  async function markAttendance(internId: string, status: string) {
    const existing = attendance.find(a => a.intern_id === internId)
    
    if (existing) {
      const { error } = await supabase
        .from('attendance')
        .update({ status, check_in: status === 'present' ? new Date().toLocaleTimeString() : null })
        .eq('id', existing.id)
      
      if (!error) {
        toast.success(`Attendance marked as ${status}`)
        fetchAttendance()
      }
    } else {
      const { error } = await supabase.from('attendance').insert({
        intern_id: internId,
        date: selectedDate,
        status,
        check_in: status === 'present' ? new Date().toLocaleTimeString() : null
      })
      
      if (!error) {
        toast.success(`Attendance marked as ${status}`)
        fetchAttendance()
      }
    }
  }

  const getAttendanceStatus = (internId: string) => {
    const record = attendance.find(a => a.intern_id === internId)
    return record?.status || 'not_marked'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Attendance Tracking
        </h1>
        <p className="text-gray-500 mt-1">Mark daily attendance for interns</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-3">
            {interns.map((intern) => {
              const status = getAttendanceStatus(intern.id)
              return (
                <div key={intern.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {intern.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{intern.full_name}</p>
                      <p className="text-xs text-gray-500">{intern.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAttendance(intern.id, 'present')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        status === 'present' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(intern.id, 'absent')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        status === 'absent' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Absent
                    </button>
                  </div>
                </div>
              )
            })}
            {interns.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No interns found. Add interns first.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
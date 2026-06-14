'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    applied: 0,
    interview: 0
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data } = await supabase.from('interns').select('stage')
    if (data) {
      setStats({
        total: data.length,
        active: data.filter(i => i.stage === 'active').length,
        applied: data.filter(i => i.stage === 'applied').length,
        interview: data.filter(i => i.stage === 'interview').length
      })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to Cloudz Travels Intern Management System</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-gray-600">Total Interns</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-gray-600">Active Interns</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.applied}</div>
          <div className="text-gray-600">New Applications</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-blue-600">{stats.interview}</div>
          <div className="text-gray-600">In Interview</div>
        </div>
      </div>
    </div>
  )
}
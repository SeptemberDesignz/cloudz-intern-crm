'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Users, UserCheck, FileText, Calendar, TrendingUp, Award } from 'lucide-react'

export default function DashboardPage() {
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

  const statCards = [
    { 
      title: 'Total Interns', 
      value: stats.total, 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      trend: '+12%',
      color: 'text-blue-600'
    },
    { 
      title: 'Active Interns', 
      value: stats.active, 
      icon: UserCheck, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      trend: '+8%',
      color: 'text-green-600'
    },
    { 
      title: 'New Applications', 
      value: stats.applied, 
      icon: FileText, 
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      trend: '+23%',
      color: 'text-yellow-600'
    },
    { 
      title: 'In Interview', 
      value: stats.interview, 
      icon: Calendar, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      trend: '+5%',
      color: 'text-purple-600'
    },
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">Here's what's happening with your interns today.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity`}></div>
              <div className="relative bg-white rounded-2xl shadow-sm p-6 border border-gray-100 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.bgGradient}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {card.trend}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
                <p className="text-sm text-gray-600">{card.title}</p>
                <div className={`mt-4 h-1 w-full bg-gradient-to-r ${card.gradient} rounded-full opacity-20`}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest updates from your interns</p>
          </div>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Intern Management Active</p>
              <p className="text-sm text-gray-500">System is ready to track new interns</p>
            </div>
            <span className="text-xs text-gray-400">Just now</span>
          </div>
        </div>
      </div>
    </div>
  )
}
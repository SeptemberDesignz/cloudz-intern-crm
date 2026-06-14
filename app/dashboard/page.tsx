'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Users, UserCheck, FileText, Calendar, TrendingUp, Award, 
  Clock, CheckSquare, BookOpen, Megaphone, BarChart, 
  ArrowRight, Activity, Mail, FolderOpen 
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    applied: 0,
    interview: 0,
    completed: 0,
    attendance: 0,
    tasks: 0
  })
  const [recentInterns, setRecentInterns] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchStats()
    fetchRecentInterns()
    fetchRecentActivities()
    // Set current time only on client side to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  async function fetchStats() {
    const { data } = await supabase.from('interns').select('*')
    if (data) {
      setStats({
        total: data.length,
        active: data.filter((i: any) => i.stage === 'active').length,
        applied: data.filter((i: any) => i.stage === 'applied').length,
        interview: data.filter((i: any) => i.stage === 'interview').length,
        completed: data.filter((i: any) => i.stage === 'completed').length,
        attendance: 85,
        tasks: 12
      })
    }
  }

  async function fetchRecentInterns() {
    const { data } = await supabase
      .from('interns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentInterns(data || [])
  }

  async function fetchRecentActivities() {
    setRecentActivities([
      { id: 1, action: 'New intern added', user: 'Admin', time: '2 hours ago', icon: '➕' },
      { id: 2, action: 'Task completed', user: 'Intern', time: '5 hours ago', icon: '✅' },
      { id: 3, action: 'Application reviewed', user: 'HR Team', time: '1 day ago', icon: '📋' },
    ])
  }

  const statCards = [
    { 
      title: 'Total Interns', 
      value: stats.total, 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      trend: '+12%',
      color: 'text-blue-600',
      link: '/dashboard/interns'
    },
    { 
      title: 'Active Interns', 
      value: stats.active, 
      icon: UserCheck, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      trend: '+8%',
      color: 'text-green-600',
      link: '/dashboard/interns'
    },
    { 
      title: 'Applications', 
      value: stats.applied, 
      icon: FileText, 
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      trend: '+23%',
      color: 'text-yellow-600',
      link: '/dashboard/applications'
    },
    { 
      title: 'In Interview', 
      value: stats.interview, 
      icon: Calendar, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      trend: '+5%',
      color: 'text-purple-600',
      link: '/dashboard/interns'
    },
  ]

  const quickActionCards = [
    { title: 'Add New Intern', icon: UserCheck, color: 'bg-green-500', link: '/dashboard/add-intern', description: 'Create new intern profile' },
    { title: 'Mark Attendance', icon: Clock, color: 'bg-orange-500', link: '/dashboard/attendance', description: 'Record daily attendance' },
    { title: 'Assign Task', icon: CheckSquare, color: 'bg-purple-500', link: '/dashboard/tasks', description: 'Create new task' },
    { title: 'Send Announcement', icon: Megaphone, color: 'bg-pink-500', link: '/dashboard/announcements', description: 'Notify all interns' },
  ]

  const featureCards = [
    { title: 'Attendance Tracking', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50', description: 'Track daily check-ins', link: '/dashboard/attendance' },
    { title: 'Task Management', icon: CheckSquare, color: 'text-purple-500', bgColor: 'bg-purple-50', description: 'Assign and track tasks', link: '/dashboard/tasks' },
    { title: 'Performance', icon: Award, color: 'text-red-500', bgColor: 'bg-red-50', description: 'Reviews & ratings', link: '/dashboard/performance' },
    { title: 'Training', icon: BookOpen, color: 'text-teal-500', bgColor: 'bg-teal-50', description: 'Learning materials', link: '/dashboard/training' },
    { title: 'Messages', icon: Mail, color: 'text-cyan-500', bgColor: 'bg-cyan-50', description: 'Communicate', link: '/dashboard/messages' },
    { title: 'Documents', icon: FolderOpen, color: 'text-amber-500', bgColor: 'bg-amber-50', description: 'Store files', link: '/dashboard/documents' },
    { title: 'Reports', icon: BarChart, color: 'text-emerald-500', bgColor: 'bg-emerald-50', description: 'Analytics', link: '/dashboard/reports' },
    { title: 'Activity Log', icon: Activity, color: 'text-slate-500', bgColor: 'bg-slate-50', description: 'Audit trail', link: '/dashboard/activity' },
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100">Here's what's happening with your interns today.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.title} href={card.link}>
              <div className="group relative cursor-pointer">
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
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActionCards.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.link}>
                <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`${action.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Interns and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Interns */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Recent Interns</h2>
            <Link href="/dashboard/interns" className="text-sm text-purple-500 hover:text-purple-600">
              View All →
            </Link>
          </div>
          {recentInterns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No interns yet</p>
              <Link href="/dashboard/add-intern" className="text-sm text-blue-500 mt-2 inline-block">
                Add your first intern →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInterns.map((intern) => (
                <Link key={intern.id} href={`/dashboard/interns/${intern.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {intern.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{intern.full_name}</p>
                      <p className="text-xs text-gray-500">{intern.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        intern.stage === 'active' ? 'bg-green-100 text-green-700' :
                        intern.stage === 'applied' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {intern.stage}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            <Link href="/dashboard/activity" className="text-sm text-purple-500 hover:text-purple-600">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards - All CRM Features */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.title} href={feature.link}>
                <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className={`${feature.bgColor} p-2 rounded-lg ${feature.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Stats Summary Footer - Fixed hydration issue */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">System Status</span>
          </div>
          <div className="flex gap-4">
            <span className="text-xs text-green-600">● All systems operational</span>
            <span className="text-xs text-gray-500">
              Last updated: {currentTime || 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
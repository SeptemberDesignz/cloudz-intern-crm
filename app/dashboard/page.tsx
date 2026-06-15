'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { 
  Users, UserCheck, FileText, Calendar, TrendingUp, Award, 
  Clock, CheckSquare, BookOpen, Megaphone, BarChart, 
  ArrowRight, Activity, Mail, FolderOpen, UserPlus, Shield
} from 'lucide-react'

export default function DashboardPage() {
  const { isAdmin, isIntern, user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    applied: 0,
    interview: 0,
    completed: 0,
    myTasks: 0,
    myAttendance: 0
  })
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [myAttendance, setMyAttendance] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState('')
  const [internId, setInternId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInternId()
  }, [user])

  useEffect(() => {
    if (internId) {
      if (isAdmin) {
        fetchAdminStats()
      } else {
        fetchInternStats()
        fetchMyTasks()
        fetchMyAttendance()
      }
    }
    fetchRecentActivities()
    setCurrentTime(new Date().toLocaleTimeString())
  }, [internId, isAdmin])

  async function fetchInternId() {
    if (user?.email) {
      const { data } = await supabase
        .from('interns')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (data) {
        setInternId(data.id)
      }
    }
  }

  async function fetchAdminStats() {
    const { data } = await supabase.from('interns').select('*')
    if (data) {
      setStats({
        total: data.length,
        active: data.filter((i: any) => i.stage === 'active').length,
        applied: data.filter((i: any) => i.stage === 'applied').length,
        interview: data.filter((i: any) => i.stage === 'interview').length,
        completed: data.filter((i: any) => i.stage === 'completed').length,
        myTasks: 0,
        myAttendance: 0
      })
    }
  }

  async function fetchInternStats() {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('intern_id', internId)
    
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('intern_id', internId)

    setStats({
      total: 0,
      active: 0,
      applied: 0,
      interview: 0,
      completed: tasks?.filter(t => t.status === 'completed').length || 0,
      myTasks: tasks?.length || 0,
      myAttendance: attendance?.length || 0
    })
  }

  async function fetchMyTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('intern_id', internId)
      .order('due_date', { ascending: true })
      .limit(5)
    
    setMyTasks(data || [])
  }

  async function fetchMyAttendance() {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('intern_id', internId)
      .order('date', { ascending: false })
      .limit(5)
    
    setMyAttendance(data || [])
  }

  async function fetchRecentActivities() {
    if (internId) {
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('intern_id', internId)
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (recentTasks && recentTasks.length > 0) {
        setRecentActivities(recentTasks.map(task => ({
          id: task.id,
          action: task.status === 'completed' ? `Task completed: ${task.title}` : `New task assigned: ${task.title}`,
          user: 'System',
          time: new Date(task.created_at).toLocaleDateString(),
          icon: task.status === 'completed' ? '✅' : '📋'
        })))
      } else {
        setRecentActivities([
          { id: 1, action: 'Welcome to the internship program!', user: 'System', time: 'Just now', icon: '🎉' },
        ])
      }
    }
  }

  const adminStatCards = [
    { title: 'Total Interns', value: stats.total, icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', trend: '+12%', color: 'text-blue-600', link: '/dashboard/interns' },
    { title: 'Active Interns', value: stats.active, icon: UserCheck, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', trend: '+8%', color: 'text-green-600', link: '/dashboard/interns' },
    { title: 'Applications', value: stats.applied, icon: FileText, gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100', trend: '+23%', color: 'text-yellow-600', link: '/dashboard/applications' },
    { title: 'In Interview', value: stats.interview, icon: Calendar, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', trend: '+5%', color: 'text-purple-600', link: '/dashboard/interns' },
  ]

  const internStatCards = [
    { title: 'My Tasks', value: stats.myTasks, icon: CheckSquare, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', color: 'text-purple-600', link: '/dashboard/my-tasks' },
    { title: 'Completed', value: stats.completed, icon: Award, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', color: 'text-green-600', link: '/dashboard/my-tasks' },
    { title: 'Attendance Days', value: stats.myAttendance, icon: Clock, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', color: 'text-orange-600', link: '/dashboard/my-attendance' },
  ]

  const adminQuickActions = [
    { title: 'Add New Intern', icon: UserPlus, color: 'bg-green-500', link: '/dashboard/add-intern', description: 'Create new intern profile' },
    { title: 'Mark Attendance', icon: Clock, color: 'bg-orange-500', link: '/dashboard/attendance', description: 'Record daily attendance' },
    { title: 'Assign Task', icon: CheckSquare, color: 'bg-purple-500', link: '/dashboard/tasks', description: 'Create new task' },
  ]

  const internQuickActions = [
    { title: 'View My Tasks', icon: CheckSquare, color: 'bg-purple-500', link: '/dashboard/my-tasks', description: 'See assigned tasks' },
    { title: 'View Attendance', icon: Clock, color: 'bg-orange-500', link: '/dashboard/my-attendance', description: 'Check my attendance' },
    { title: 'Submit Report', icon: FileText, color: 'bg-blue-500', link: '/dashboard/intern-reports', description: 'Submit weekly report' },
  ]

  const internFeatureCards = [
    { title: 'My Profile', icon: UserCheck, color: 'text-blue-500', bgColor: 'bg-blue-50', description: 'View your information', link: '/dashboard/intern-profile' },
    { title: 'My Tasks', icon: CheckSquare, color: 'text-purple-500', bgColor: 'bg-purple-50', description: 'Track your tasks', link: '/dashboard/my-tasks' },
    { title: 'My Attendance', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50', description: 'View attendance', link: '/dashboard/my-attendance' },
    { title: 'My Reports', icon: FileText, color: 'text-green-500', bgColor: 'bg-green-50', description: 'Submit reports', link: '/dashboard/intern-reports' },
    { title: 'My Documents', icon: FolderOpen, color: 'text-amber-500', bgColor: 'bg-amber-50', description: 'Upload documents', link: '/dashboard/intern-documents' },
    { title: 'My Schedule', icon: Calendar, color: 'text-teal-500', bgColor: 'bg-teal-50', description: 'View schedule', link: '/dashboard/schedule' },
    { title: 'Announcements', icon: Megaphone, color: 'text-pink-500', bgColor: 'bg-pink-50', description: 'Company updates', link: '/dashboard/announcements' },
    { title: 'Training', icon: BookOpen, color: 'text-indigo-500', bgColor: 'bg-indigo-50', description: 'Learning materials', link: '/dashboard/intern-training' },
  ]

  const adminFeatureCards = [
    { title: 'Attendance Tracking', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50', description: 'Track daily check-ins', link: '/dashboard/attendance' },
    { title: 'Task Management', icon: CheckSquare, color: 'text-purple-500', bgColor: 'bg-purple-50', description: 'Assign and track tasks', link: '/dashboard/tasks' },
    { title: 'Performance', icon: Award, color: 'text-red-500', bgColor: 'bg-red-50', description: 'Reviews & ratings', link: '/dashboard/performance' },
    { title: 'Training', icon: BookOpen, color: 'text-teal-500', bgColor: 'bg-teal-50', description: 'Learning materials', link: '/dashboard/training' },
    { title: 'Messages', icon: Mail, color: 'text-cyan-500', bgColor: 'bg-cyan-50', description: 'Communicate', link: '/dashboard/messages' },
    { title: 'Documents', icon: FolderOpen, color: 'text-amber-500', bgColor: 'bg-amber-50', description: 'Store files', link: '/dashboard/documents' },
    { title: 'Reports', icon: BarChart, color: 'text-emerald-500', bgColor: 'bg-emerald-50', description: 'Analytics', link: '/dashboard/reports' },
    { title: 'Activity Log', icon: Activity, color: 'text-slate-500', bgColor: 'bg-slate-50', description: 'Audit trail', link: '/dashboard/activity' },
    { title: 'User Management', icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-50', description: 'Manage roles', link: '/dashboard/users' },
    { title: 'Settings', icon: UserCheck, color: 'text-gray-500', bgColor: 'bg-gray-50', description: 'System config', link: '/dashboard/settings' },
  ]

  const quickActions = isAdmin ? adminQuickActions : internQuickActions
  const featureCards = isAdmin ? adminFeatureCards : internFeatureCards
  const statCards = isAdmin ? adminStatCards : internStatCards

  return (
    <div>
      {/* Welcome Section - No Hand Wave */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">
              {isAdmin 
                ? "Here's what's happening with your interns today." 
                : "Track your tasks, attendance, and internship progress."}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                    {(card as any).trend && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {(card as any).trend}
                      </span>
                    )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
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

      {/* My Tasks Section - For Interns */}
      {isIntern && myTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Recent Tasks</h2>
            <Link href="/dashboard/my-tasks" className="text-sm text-purple-500 hover:text-purple-600">
              View All Tasks →
            </Link>
          </div>
          <div className="space-y-3">
            {myTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  {task.due_date && (
                    <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {task.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
              {isIntern && <p className="text-sm">When admins assign tasks, they will appear here</p>}
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div>
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

      {/* Stats Summary Footer */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
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
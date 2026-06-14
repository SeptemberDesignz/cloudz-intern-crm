'use client'

import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut,
  Sparkles,
  Bell,
  Settings,
  Shield,
  Activity,
  FileText,
  Clock,
  CheckSquare,
  Award,
  BookOpen,
  Megaphone,
  BarChart,
  Calendar,
  Mail,
  FolderOpen
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUserEmail(user.email || '')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  // Menu items organized by category
  const mainMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500', description: 'Overview & Stats' },
  ]

  const internManagementItems = [
    { href: '/dashboard/interns', label: 'Intern Database', icon: Users, color: 'text-green-500', description: 'All intern profiles' },
    { href: '/dashboard/add-intern', label: 'Add Intern', icon: UserPlus, color: 'text-purple-500', description: 'Create new profile' },
    { href: '/dashboard/applications', label: 'Applications', icon: FileText, color: 'text-yellow-500', description: 'Track applications' },
  ]

  const trackingItems = [
    { href: '/dashboard/attendance', label: 'Attendance', icon: Clock, color: 'text-orange-500', description: 'Daily attendance' },
    { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare, color: 'text-indigo-500', description: 'Assign & track' },
    { href: '/dashboard/performance', label: 'Performance', icon: Award, color: 'text-red-500', description: 'Reviews & ratings' },
  ]

  const developmentItems = [
    { href: '/dashboard/training', label: 'Training', icon: BookOpen, color: 'text-teal-500', description: 'Learning materials' },
    { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, color: 'text-pink-500', description: 'Events & deadlines' },
  ]

  const communicationItems = [
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone, color: 'text-rose-500', description: 'Send updates' },
    { href: '/dashboard/messages', label: 'Messages', icon: Mail, color: 'text-cyan-500', description: 'Communicate' },
  ]

  const reportsItems = [
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart, color: 'text-emerald-500', description: 'Analytics' },
    { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen, color: 'text-amber-500', description: 'Files & certificates' },
    { href: '/dashboard/activity', label: 'Activity Log', icon: Activity, color: 'text-slate-500', description: 'Audit trail' },
  ]

  const settingsItems = [
    { href: '/dashboard/users', label: 'User Management', icon: Shield, color: 'text-red-500', description: 'Manage access' },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'text-gray-500', description: 'System config' },
  ]

  const MenuSection = ({ title, items }: { title: string; items: typeof mainMenuItems }) => (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        {title}
      </p>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href}>
            <div className={`group relative mx-2 mb-1 rounded-xl cursor-pointer transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                : 'hover:bg-gray-100'
            }`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color} transition-transform group-hover:scale-110`} />
                <div className="flex-1">
                  <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                    {item.description}
                  </p>
                </div>
                {isActive && <Sparkles className="w-4 h-4 text-white animate-pulse" />}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-2xl flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo.png"
                alt="Cloudz Travels Logo"
                width={48}
                height={48}
                className="object-contain rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cloudz Travels
              </h1>
              <p className="text-xs text-gray-500">Enterprise Intern CRM</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          <MenuSection title="MAIN" items={mainMenuItems} />
          <MenuSection title="INTERN MANAGEMENT" items={internManagementItems} />
          <MenuSection title="TRACKING" items={trackingItems} />
          <MenuSection title="DEVELOPMENT" items={developmentItems} />
          <MenuSection title="COMMUNICATION" items={communicationItems} />
          <MenuSection title="REPORTS & ANALYTICS" items={reportsItems} />
          <MenuSection title="ADMIN" items={settingsItems} />
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {userEmail?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {userEmail?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-red-50 text-red-600 group mt-2"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Premium Header */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Intern Management System
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete solution for managing interns, attendance, tasks, and performance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Live
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  v2.0
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)}></div>
          <div className="absolute top-20 right-80 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-30">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="p-4">
              <div className="text-center text-gray-500 text-sm">
                No new notifications
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
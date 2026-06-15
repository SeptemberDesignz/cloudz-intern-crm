'use client'

import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut,
  Sparkles,
  Bell,
  GraduationCap,
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
  FolderOpen,
  Eye,
  User,
  Upload
} from 'lucide-react'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAdmin, isIntern, isViewer } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  // ============================================
  // INTERN MENU - LIMITED ACCESS ONLY
  // Interns CANNOT see: Add Intern, User Management, Task Assignment, Attendance Management
  // ============================================
  const internMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview' },
    { href: '/dashboard/intern-profile', label: 'My Profile', icon: User, description: 'View my information' },
    { href: '/dashboard/my-tasks', label: 'My Tasks', icon: CheckSquare, description: 'View and update my tasks' },
    { href: '/dashboard/my-attendance', label: 'My Attendance', icon: Clock, description: 'View my attendance records' },
    { href: '/dashboard/intern-reports', label: 'My Reports', icon: FileText, description: 'Submit weekly reports' },
    { href: '/dashboard/intern-documents', label: 'My Documents', icon: Upload, description: 'Upload required documents' },
    { href: '/dashboard/schedule', label: 'My Schedule', icon: Calendar, description: 'View internship schedule' },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone, description: 'View company announcements' },
    { href: '/dashboard/intern-training', label: 'Training', icon: BookOpen, description: 'Learning materials' },
  ]

  // ============================================
  // ADMIN MENU - FULL ACCESS
  // Admins can do everything
  // ============================================
  const adminMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Stats' },
    { href: '/dashboard/interns', label: 'Intern Database', icon: Users, description: 'All intern profiles' },
    { href: '/dashboard/add-intern', label: 'Add Intern', icon: UserPlus, description: 'Create new profile' },
    { href: '/dashboard/applications', label: 'Applications', icon: FileText, description: 'Track applications' },
    { href: '/dashboard/attendance', label: 'Attendance', icon: Clock, description: 'Mark daily attendance' },
    { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare, description: 'Assign tasks to interns' },
    { href: '/dashboard/performance', label: 'Performance', icon: Award, description: 'Reviews & ratings' },
    { href: '/dashboard/training', label: 'Training', icon: BookOpen, description: 'Manage learning materials' },
    { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, description: 'Events & deadlines' },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone, description: 'Send announcements' },
    { href: '/dashboard/messages', label: 'Messages', icon: Mail, description: 'Communicate with interns' },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart, description: 'Analytics & insights' },
    { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen, description: 'Manage files' },
    { href: '/dashboard/activity', label: 'Activity Log', icon: Activity, description: 'Audit trail' },
    { href: '/dashboard/users', label: 'User Management', icon: Shield, description: 'Manage roles' },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, description: 'System configuration' },
  ]

  const MenuSection = ({ title, items }: { title: string; items: any[] }) => {
    if (items.length === 0) return null
    
    return (
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
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'} transition-transform group-hover:scale-110`} />
                  <div className="flex-1">
                    <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                    {item.description && (
                      <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {isActive && <Sparkles className="w-4 h-4 text-white animate-pulse" />}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  // Select menu based on role
  const menuItems = isIntern ? internMenuItems : adminMenuItems
  const menuTitle = isIntern ? "INTERN PORTAL" : "ADMIN PORTAL"

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
              <p className="text-xs text-gray-500">
                {isIntern ? 'Intern Portal' : isViewer ? 'Viewer Portal' : 'Admin Portal'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <MenuSection title={menuTitle} items={menuItems} />
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {user.full_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-purple-100 text-purple-700' : 
                      isIntern ? 'bg-green-100 text-green-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
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
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {isIntern ? 'Intern Portal' : 'Admin Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isIntern 
                    ? 'Welcome to your personal dashboard. Track your tasks, attendance, and submit reports.' 
                    : 'Manage interns, tasks, attendance, and track performance'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isIntern && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Intern Access
                  </span>
                )}
                {isAdmin && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin Access
                  </span>
                )}
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Live
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
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut,
  Sparkles,
  Bell,
  Settings,
  Shield,
  Activity  // Add this
} from 'lucide-react'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })
const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { href: '/dashboard/interns', label: 'All Interns', icon: Users, color: 'text-green-500' },
  { href: '/dashboard/add-intern', label: 'Add Intern', icon: UserPlus, color: 'text-purple-500' },
  { href: '/dashboard/activity', label: 'Activity Log', icon: Activity, color: 'text-orange-500' },
  { href: '/dashboard/users', label: 'User Management', icon: Shield, color: 'text-red-500' },
]

export const metadata: Metadata = {
  title: 'Cloudz Travels - Intern CRM',
  description: 'Manage your interns efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

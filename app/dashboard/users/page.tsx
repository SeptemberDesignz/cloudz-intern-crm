'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Users, UserPlus, Shield, Mail, Calendar, X, Crown, Eye, GraduationCap, Save } from 'lucide-react'

export default function UserManagementPage() {
  const { user: currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'viewer'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('*')
    setUsers(data || [])
    setLoading(false)
  }

  async function updateUserRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update role')
    } else {
      toast.success(`Role updated to ${newRole}`)
      fetchUsers()
    }
  }

  async function addUser() {
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          full_name: newUser.full_name || newUser.email.split('@')[0]
        }
      }
    })

    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: newUser.email,
        full_name: newUser.full_name || newUser.email.split('@')[0],
        role: newUser.role
      })
      
      toast.success(`User invited successfully! Role: ${newUser.role}`)
      setShowAddUser(false)
      setNewUser({ email: '', password: '', full_name: '', role: 'viewer' })
      fetchUsers()
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
          <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Crown className="w-4 h-4 text-purple-500" />
      case 'intern': return <GraduationCap className="w-4 h-4 text-green-500" />
      default: return <Eye className="w-4 h-4 text-blue-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'intern': return 'bg-green-100 text-green-700'
      default: return 'bg-blue-100 text-blue-700'
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.full_name}</p>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-green-600">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getRoleColor(user.role)} cursor-pointer`}
                        disabled={user.id === currentUser?.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="intern">Intern</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {user.id === currentUser?.id ? (
                      <span className="text-gray-400 text-sm">Current user</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Invite New User</h2>
              <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="user@cloudz.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="intern">Intern (Own profile only)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={addUser} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg">
                  Send Invitation
                </button>
                <button onClick={() => setShowAddUser(false)} className="flex-1 border py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
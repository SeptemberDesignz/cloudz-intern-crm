'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import { Users, UserPlus, Shield, Mail, Calendar, X, AlertCircle } from 'lucide-react'

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  async function fetchCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setError(error.message)
      } else if (user) {
        setUsers([user])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function addUser() {
    if (!newUser.email || !newUser.password) {
      toast.error('Email and password are required')
      return
    }

    try {
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
      } else {
        toast.success('User invited successfully! They will receive an email to confirm.')
        setShowAddUser(false)
        setNewUser({ email: '', password: '', full_name: '' })
        fetchCurrentUser()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user')
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
          <p className="text-gray-500 mt-1">Manage who can access the CRM system</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Warning Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Limited Access</p>
            <p className="text-sm text-yellow-700">User management features are limited. You can invite new users via email.</p>
          </div>
        </div>
      )}

      {/* Current User */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Current User</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No user information available
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Invite New User
              </h2>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="user@cloudz.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">User can change this after first login</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p>An invitation email will be sent to the user with login instructions.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addUser}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all font-semibold"
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
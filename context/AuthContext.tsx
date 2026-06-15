'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'intern' | 'viewer'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isIntern: boolean
  isViewer: boolean
  canEdit: boolean
  canDelete: boolean
  canViewAll: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isIntern: false,
  isViewer: false,
  canEdit: false,
  canDelete: false,
  canViewAll: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Get user role from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        // Check if user is an intern (has matching record in interns table)
        let role = userData?.role || 'viewer'
        
        // If role is not set but user exists in interns table, set as intern
        if (!userData) {
          const { data: internData } = await supabase
            .from('interns')
            .select('id')
            .eq('email', authUser.email)
            .single()
          
          if (internData) {
            role = 'intern'
            // Create user record
            await supabase.from('users').insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
              role: 'intern'
            })
          }
        }

        setUser({
          id: authUser.id,
          email: authUser.email!,
          full_name: userData?.full_name || authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          role: role as 'admin' | 'intern' | 'viewer'
        })
      }
    } catch (error) {
      console.error('Error getting user:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role === 'admin'
  const isIntern = user?.role === 'intern'
  const isViewer = user?.role === 'viewer'
  const canEdit = isAdmin
  const canDelete = isAdmin
  const canViewAll = isAdmin || isViewer

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      isIntern,
      isViewer,
      canEdit,
      canDelete,
      canViewAll,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
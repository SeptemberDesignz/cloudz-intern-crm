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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isIntern: false,
  isViewer: false,
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
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function getUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Check if user is admin by email
        const isAdminEmail = authUser.email === 'admin@cloudz.com'
        
        // Get role from database
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single()

        let role: 'admin' | 'intern' | 'viewer' = 'intern'
        
        if (isAdminEmail || userData?.role === 'admin') {
          role = 'admin'
          // Ensure admin record exists
          await supabase.from('users').upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: 'Administrator',
            role: 'admin'
          })
        } else {
          role = 'intern'
          // Ensure intern record exists
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('id', authUser.id)
            .single()
          
          if (!existing) {
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
          full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          role: role
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

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isIntern, isViewer }}>
      {children}
    </AuthContext.Provider>
  )
}
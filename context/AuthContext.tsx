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
  }, [])

  async function getUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        let role: 'admin' | 'intern' | 'viewer' = 'intern'
        
        if (userData?.role === 'admin') {
          role = 'admin'
        } else if (authUser.email === 'admin@cloudz.com') {
          role = 'admin'
          await supabase.from('users').upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: 'Administrator',
            role: 'admin'
          })
        } else {
          role = 'intern'
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
          full_name: userData?.full_name || authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
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
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Mail, Lock, ArrowRight, UserPlus, LogIn, Briefcase, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginType, setLoginType] = useState<'intern' | 'admin'>('intern')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Admin fixed credentials
  const ADMIN_EMAIL = 'admin@cloudz.com'
  const ADMIN_PASSWORD = 'Admin123456'

  const handleAdminLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: ADMIN_EMAIL, 
        password: ADMIN_PASSWORD 
      })
      if (error) {
        alert('Admin login failed. Please contact system administrator.')
      } else {
        // Set admin role in database
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', ADMIN_EMAIL)
          .single()
        
        if (!userData) {
          // Create admin user record
          const { data: { user } } = await supabase.auth.getUser()
          await supabase.from('users').insert({
            id: user?.id,
            email: ADMIN_EMAIL,
            full_name: 'Administrator',
            role: 'admin'
          })
        } else if (userData.role !== 'admin') {
          // Update to admin role
          await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', ADMIN_EMAIL)
        }
        
        router.push('/dashboard')
      }
    } catch (err) {
      alert('Admin login failed')
    }
    setLoading(false)
  }

  const handleInternLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: email.split('@')[0] }
        }
      })
      if (error) {
        alert(`Signup failed: ${error.message}`)
      } else {
        // Create intern record
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('users').insert({
            id: user.id,
            email: email,
            full_name: email.split('@')[0],
            role: 'intern'
          })
          
          await supabase.from('interns').insert({
            full_name: email.split('@')[0],
            email: email,
            stage: 'applied'
          })
        }
        alert('Account created! Please sign in.')
        setIsSignUp(false)
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(`Login failed: ${error.message}`)
      } else {
        // Ensure user has intern role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user?.id)
          .single()
        
        if (!userData) {
          await supabase.from('users').insert({
            id: data.user?.id,
            email: email,
            full_name: email.split('@')[0],
            role: 'intern'
          })
        } else if (userData.role !== 'intern' && userData.role !== 'admin') {
          await supabase
            .from('users')
            .update({ role: 'intern' })
            .eq('id', data.user?.id)
        }
        
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 relative">
              <Image
                src="/logo.png"
                alt="Cloudz Travels"
                width={128}
                height={128}
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Cloudz Travels
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Intern Management System
          </p>

          {/* Login Type Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setLoginType('intern')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                loginType === 'intern'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Intern Login
              </div>
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                Admin Login
              </div>
            </button>
          </div>

          {/* Intern Login Form */}
          {loginType === 'intern' && (
            <form onSubmit={handleInternLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In as Intern')}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-blue-600 hover:text-purple-600 transition-colors mt-4"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : 'New intern? Create an account'}
              </button>
            </form>
          )}

          {/* Admin Login Button */}
          {loginType === 'admin' && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Administrator Access</p>
                <p className="text-xs text-gray-500">Secure access for authorized personnel only</p>
              </div>
              
              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : 'Continue as Administrator'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
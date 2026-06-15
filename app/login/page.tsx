'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Mail, Lock, ArrowRight, UserPlus, LogIn, Briefcase, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginType, setLoginType] = useState<'intern' | 'admin'>('intern')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle Intern Login/Signup
  const handleInternSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      // Sign up new intern with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: email.split('@')[0] },
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      })
      
      if (error) {
        alert(`Signup failed: ${error.message}`)
        setLoading(false)
        return
      }
      
      if (data.user) {
        // Create user record in users table
        await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          full_name: email.split('@')[0],
          role: 'intern'
        })
        
        // Also create intern record
        await supabase.from('interns').insert({
          full_name: email.split('@')[0],
          email: email,
          stage: 'applied'
        })
        
        // Auto sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInError) {
          router.push('/dashboard')
        } else {
          alert('Account created! Please sign in.')
          setIsSignUp(false)
        }
      }
    } else {
      // Sign in existing intern
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
        }
        
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  // Handle Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Admin fixed credentials
    const ADMIN_EMAIL = 'admin@cloudz.com'
    const ADMIN_PASSWORD = 'Admin123456'

    if (email !== ADMIN_EMAIL) {
      alert('Invalid admin email. Please use admin@cloudz.com')
      setLoading(false)
      return
    }

    if (password !== ADMIN_PASSWORD) {
      alert('Invalid admin password')
      setLoading(false)
      return
    }

    try {
      // Try to sign in
      let { error } = await supabase.auth.signInWithPassword({ 
        email: ADMIN_EMAIL, 
        password: ADMIN_PASSWORD 
      })
      
      if (error) {
        // If admin doesn't exist, create them
        const { error: signUpError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            data: { full_name: 'System Administrator' }
          }
        })
        
        if (signUpError) {
          alert('Admin setup failed. Please contact support.')
          setLoading(false)
          return
        }
        
        // Sign in after creation
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
        
        if (loginError) {
          alert('Admin login failed')
          setLoading(false)
          return
        }
      }
      
      // Set admin role in database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').upsert({
          id: user.id,
          email: ADMIN_EMAIL,
          full_name: 'System Administrator',
          role: 'admin'
        })
      }
      
      router.push('/dashboard')
    } catch (err) {
      alert('Admin login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
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
          
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Cloudz Travels
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Intern Management System
          </p>

          {/* Login Type Selector */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => {
                setLoginType('intern')
                setEmail('')
                setPassword('')
                setIsSignUp(false)
              }}
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
              type="button"
              onClick={() => {
                setLoginType('admin')
                setEmail('')
                setPassword('')
                setIsSignUp(false)
              }}
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
            <form onSubmit={handleInternSubmit} className="space-y-5">
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="•••••••• (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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

          {/* Admin Login Form */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <div className="bg-gray-100 rounded-lg p-3 text-center mb-4">
                <p className="text-sm text-gray-700">Administrator Access Only</p>
                <p className="text-xs text-gray-500 mt-1">Authorized personnel only</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    placeholder="admin@cloudz.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : 'Login as Administrator'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
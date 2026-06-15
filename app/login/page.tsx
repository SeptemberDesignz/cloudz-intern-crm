'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
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
        alert('Account created! Please sign in.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(`Login failed: ${error.message}`)
      } else {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 relative">
              <Image
                src="/logo.png"
                alt="Cloudz Travels Logo"
                width={96}
                height={96}
                className="object-contain rounded-xl"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-center text-gray-500 mb-8">
            {isSignUp 
              ? 'Start managing your interns efficiently' 
              : 'Sign in to Cloudz Travels Intern CRM'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  placeholder="admin@cloudztravels.com"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm text-blue-600 hover:text-purple-600 transition-colors mt-4 flex items-center justify-center gap-2"
            >
              {isSignUp ? (
                <>Already have an account? <LogIn className="w-4 h-4" /></>
              ) : (
                <>Don't have an account? <UserPlus className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
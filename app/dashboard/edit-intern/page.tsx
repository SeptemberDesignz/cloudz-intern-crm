'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import { User, Mail, Phone, GraduationCap, Briefcase, ArrowLeft, Save } from 'lucide-react'

// This page lets you edit an existing intern
// The [id] in the folder name means it will work for any intern ID

export default function EditIntern({ params }: { params: { id: string } }) {
  // These are like containers to store information
  const router = useRouter() // Helps us go back to previous page
  const [loading, setLoading] = useState(false) // Shows "Saving..." text
  const [fetching, setFetching] = useState(true) // Shows "Loading..." text
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    university: '',
    course: '',
    stage: 'applied',
    mentor: '',
    notes: ''
  })

  // Connect to Supabase database
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // When this page opens, automatically load the intern's information
  useEffect(() => {
    fetchIntern()
  }, [])

  // This function gets the intern's current information from database
  async function fetchIntern() {
    const { data, error } = await supabase
      .from('interns')
      .select('*')
      .eq('id', params.id) // Only get the intern with this ID
      .single() // Get just one record
    
    if (error) {
      toast.error('Error fetching intern')
      router.push('/dashboard/interns') // Go back if error
    } else {
      setFormData(data) // Fill the form with current data
    }
    setFetching(false) // Stop showing loading spinner
  }

  // This function runs every time you type in any input field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData, // Keep all other fields the same
      [e.target.name]: e.target.value // Only change the field you're typing in
    })
  }

  // This saves your changes to the database
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Don't refresh the page
    setLoading(true) // Show "Saving..."

    // Update the database with new information
    const { error } = await supabase
      .from('interns')
      .update(formData) // Send the new data
      .eq('id', params.id) // Update only this intern

    if (error) {
      toast.error(error.message) // Show error message
    } else {
      toast.success('Intern updated successfully!') // Show success message
      router.push('/dashboard/interns') // Go back to interns list
    }
    setLoading(false) // Hide "Saving..."
  }

  // Show loading spinner while fetching intern data
  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading intern details...</p>
        </div>
      </div>
    )
  }

  // This is what you see on the screen - the edit form
  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Edit Intern
        </h1>
        <p className="text-gray-500 mt-1">Update intern's information</p>
      </div>
      
      {/* The Edit Form */}
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two columns for better layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* University Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="university"
                  value={formData.university || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Course Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="course"
                  value={formData.course || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Mentor Field - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mentor
            </label>
            <input
              type="text"
              name="mentor"
              value={formData.mentor || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Notes Field - Full Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02] font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
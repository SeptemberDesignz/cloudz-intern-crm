'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Award, Star, TrendingUp, User, Calendar, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PerformancePage() {
  const [interns, setInterns] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedIntern, setSelectedIntern] = useState('')
  const [rating, setRating] = useState(3)
  const [feedback, setFeedback] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInterns()
    fetchReviews()
  }, [])

  async function fetchInterns() {
    const { data } = await supabase.from('interns').select('*')
    setInterns(data || [])
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from('performance_reviews')
      .select('*, interns(full_name, email)')
      .order('review_date', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function addReview() {
    if (!selectedIntern) {
      toast.error('Please select an intern')
      return
    }

    const { error } = await supabase.from('performance_reviews').insert({
      intern_id: selectedIntern,
      rating: rating,
      feedback: feedback,
      reviewer: 'Admin'
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Review added successfully!')
      setShowForm(false)
      setSelectedIntern('')
      setRating(3)
      setFeedback('')
      fetchReviews()
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Performance Evaluation
          </h1>
          <p className="text-gray-500 mt-1">Track intern performance and reviews</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Award className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Award className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-gray-800">Average Rating</h3>
          <p className="text-2xl font-bold">{averageRating} / 5.0</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Star className="w-8 h-8 text-yellow-500 mb-3" />
          <h3 className="font-semibold text-gray-800">Total Reviews</h3>
          <p className="text-2xl font-bold">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-800">Active Interns</h3>
          <p className="text-2xl font-bold">{interns.filter(i => i.stage === 'active').length}</p>
        </div>
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Performance Review</h2>
          <div className="space-y-4">
            <select
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select Intern</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.full_name}</option>
              ))}
            </select>
            
            <div>
              <label className="block text-sm font-medium mb-2">Rating: {rating} / 5</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className={`w-10 h-10 rounded-full ${
                      rating >= r ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              placeholder="Feedback and comments..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              rows={4}
            />
            
            <div className="flex gap-3">
              <button onClick={addReview} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Submit Review
              </button>
              <button onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No performance reviews yet</p>
          <p className="text-sm">Click "Add Review" to evaluate interns</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.interns?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.interns?.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({review.rating}/5)</span>
                    </div>
                    {review.feedback && (
                      <p className="text-sm text-gray-600 mt-2">{review.feedback}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Reviewer: {review.reviewer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.review_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
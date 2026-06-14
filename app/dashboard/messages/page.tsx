'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, Send, Users, MessageSquare, Phone, Video } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const [interns, setInterns] = useState<any[]>([])
  const [selectedIntern, setSelectedIntern] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchInterns()
  }, [])

  async function fetchInterns() {
    const { data } = await supabase.from('interns').select('*')
    setInterns(data || [])
    setLoading(false)
  }

  async function sendMessage() {
    if (!selectedIntern || !message.trim()) {
      toast.error('Select an intern and enter a message')
      return
    }

    // Store message in database
    const { error } = await supabase.from('messages').insert({
      intern_id: selectedIntern.id,
      message: message,
      sender: 'admin',
      sent_at: new Date().toISOString()
    })

    if (error) {
      toast.error('Failed to send message')
    } else {
      toast.success('Message sent!')
      setMessage('')
      // Add to local messages
      setMessages([...messages, { message, sent_at: new Date(), sender: 'admin' }])
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-gray-500 mt-1">Communicate with interns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interns List */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold">Interns ({interns.length})</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : interns.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No interns yet</div>
            ) : (
              interns.map((intern) => (
                <button
                  key={intern.id}
                  onClick={() => setSelectedIntern(intern)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedIntern?.id === intern.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {intern.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{intern.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{intern.email}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col h-[600px]">
          {!selectedIntern ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select an intern to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedIntern.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedIntern.full_name}</h3>
                    <p className="text-xs text-gray-500">{selectedIntern.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender === 'admin' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-blue-100' : 'text-gray-400'}`}>
                          {new Date(msg.sent_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
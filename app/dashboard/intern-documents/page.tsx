'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/context/AuthContext'
import { Upload, FileText, Download, Trash2, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InternDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      fetchMyDocuments()
    }
  }, [user])

  async function fetchMyDocuments() {
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (internData) {
      const { data } = await supabase
        .from('intern_documents')
        .select('*')
        .eq('intern_id', internData.id)
        .order('created_at', { ascending: false })

      setDocuments(data || [])
    }
    setLoading(false)
  }

  async function uploadDocument() {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)

    // Get intern ID
    const { data: internData } = await supabase
      .from('interns')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (!internData) {
      toast.error('Intern profile not found')
      setUploading(false)
      return
    }

    const fileExt = selectedFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `intern-documents/${internData.id}/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('intern-documents')
      .upload(filePath, selectedFile)

    if (uploadError) {
      toast.error('Failed to upload file')
      setUploading(false)
      return
    }

    // Save to database
    const { error: dbError } = await supabase.from('intern_documents').insert({
      intern_id: internData.id,
      file_name: selectedFile.name,
      file_path: filePath,
      file_size: selectedFile.size,
      document_type: documentType || 'other',
      status: 'pending'
    })

    if (dbError) {
      toast.error('Failed to save document info')
    } else {
      toast.success('Document uploaded successfully!')
      setSelectedFile(null)
      setDocumentType('')
      fetchMyDocuments()
    }
    setUploading(false)
  }

  const documentTypes = [
    { value: 'resume', label: 'Resume/CV' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'id_proof', label: 'ID Proof' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'other', label: 'Other' },
  ]

  const stats = {
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    total: documents.length,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          My Documents
        </h1>
        <p className="text-gray-500 mt-1">Upload required documents for your internship</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <FileText className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Total Documents</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Clock className="w-8 h-8 text-yellow-500 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Pending Review</h3>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Approved</h3>
          <p className="text-3xl font-bold">{stats.approved}</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <div className="space-y-4">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Document Type</option>
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded-lg"
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
          
          {selectedFile && (
            <p className="text-sm text-gray-500">Selected: {selectedFile.name}</p>
          )}
          
          <button
            onClick={uploadDocument}
            disabled={uploading || !selectedFile}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">Upload your required documents above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{doc.file_name}</h3>
                    <p className="text-xs text-gray-500">
                      {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { FolderOpen, Upload, FileText, Download, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [interns, setInterns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadData, setUploadData] = useState({
    intern_id: '',
    file: null as File | null,
    description: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchDocuments()
    fetchInterns()
  }, [])

  async function fetchDocuments() {
    const { data } = await supabase
      .from('intern_files')
      .select('*, interns(full_name, email)')
      .order('created_at', { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }

  async function fetchInterns() {
    const { data } = await supabase.from('interns').select('id, full_name')
    setInterns(data || [])
  }

  async function uploadDocument() {
    if (!uploadData.intern_id || !uploadData.file) {
      toast.error('Please select an intern and a file')
      return
    }

    const fileExt = uploadData.file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('intern-documents')
      .upload(filePath, uploadData.file)

    if (uploadError) {
      toast.error('Failed to upload file')
      return
    }

    const { error: dbError } = await supabase.from('intern_files').insert({
      intern_id: uploadData.intern_id,
      file_name: uploadData.file.name,
      file_path: filePath,
      file_size: uploadData.file.size,
      description: uploadData.description
    })

    if (dbError) {
      toast.error('Failed to save file info')
    } else {
      toast.success('Document uploaded!')
      setShowUpload(false)
      setUploadData({ intern_id: '', file: null, description: '' })
      fetchDocuments()
    }
  }

  async function deleteDocument(id: string, filePath: string) {
    if (confirm('Delete this document?')) {
      await supabase.storage.from('intern-documents').remove([filePath])
      await supabase.from('intern_files').delete().eq('id', id)
      toast.success('Document deleted')
      fetchDocuments()
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="text-gray-500 mt-1">Manage intern documents and certificates</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
          <div className="space-y-4">
            <select
              value={uploadData.intern_id}
              onChange={(e) => setUploadData({ ...uploadData, intern_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select Intern</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.full_name}</option>
              ))}
            </select>
            
            <input
              type="file"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            
            <input
              type="text"
              placeholder="Description (optional)"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            
            <div className="flex gap-3">
              <button onClick={uploadDocument} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Upload
              </button>
              <button onClick={() => setShowUpload(false)} className="border px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">Click "Upload Document" to add files</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{doc.file_name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{doc.interns?.full_name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</p>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-2">{doc.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteDocument(doc.id, doc.file_path)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
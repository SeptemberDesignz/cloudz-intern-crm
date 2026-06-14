'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, FileText, X, Download, Trash2, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: string
  file_name: string
  file_path: string
  file_size: number
  created_at: string
}

export default function FileUpload({ internId }: { internId: string }) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchFiles()
  }, [internId])

  async function fetchFiles() {
    const { data, error } = await supabase
      .from('intern_files')
      .select('*')
      .eq('intern_id', internId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUploadedFiles(data)
    }
    setLoading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${internId}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('intern-documents')
        .upload(filePath, file)

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`)
      } else {
        const { error: dbError } = await supabase.from('intern_files').insert({
          intern_id: internId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type
        })

        if (!dbError) {
          toast.success(`${file.name} uploaded!`)
        }
      }
    }
    
    setFiles([])
    setUploading(false)
    fetchFiles()
  }

  async function downloadFile(filePath: string, fileName: string) {
    const { data } = await supabase.storage
      .from('intern-documents')
      .download(filePath)
    
    if (data) {
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  async function deleteFile(fileId: string, filePath: string) {
    if (confirm('Delete this file?')) {
      await supabase.storage.from('intern-documents').remove([filePath])
      await supabase.from('intern_files').delete().eq('id', fileId)
      toast.success('File deleted')
      fetchFiles()
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return <div className="text-center py-4">Loading files...</div>
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 inline-block">
            Select Files
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
          </label>
          
          {files.length > 0 && (
            <div className="mt-4">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                    </div>
                    <button onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Uploaded Documents ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">{file.file_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadFile(file.file_path, file.file_name)}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <Download className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id, file.file_path)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
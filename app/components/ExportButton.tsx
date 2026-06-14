'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Intern {
  id: string
  full_name: string
  email: string
  phone: string
  university: string
  course: string
  stage: string
  mentor: string
  created_at: string
}

export default function ExportButton({ interns }: { interns: Intern[] }) {
  
  const exportToExcel = () => {
    const exportData = interns.map(intern => ({
      'Full Name': intern.full_name,
      'Email': intern.email,
      'Phone': intern.phone || '-',
      'University': intern.university || '-',
      'Course': intern.course || '-',
      'Stage': intern.stage,
      'Mentor': intern.mentor || '-',
      'Joined Date': new Date(intern.created_at).toLocaleDateString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interns')
    
    const fileName = `cloudz-interns-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  return (
    <button
      onClick={exportToExcel}
      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export to Excel
    </button>
  )
}
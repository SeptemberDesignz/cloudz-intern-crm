'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Intern {
  stage: string
  university: string
}

export default function DashboardCharts({ interns }: { interns: Intern[] }) {
  
  const stageData = [
    { name: 'Applied', count: interns.filter(i => i.stage === 'applied').length },
    { name: 'Interview', count: interns.filter(i => i.stage === 'interview').length },
    { name: 'Offer', count: interns.filter(i => i.stage === 'offer').length },
    { name: 'Active', count: interns.filter(i => i.stage === 'active').length },
    { name: 'Completed', count: interns.filter(i => i.stage === 'completed').length },
    { name: 'Rejected', count: interns.filter(i => i.stage === 'rejected').length },
  ].filter(item => item.count > 0)

  const universityMap = new Map()
  interns.forEach(intern => {
    if (intern.university) {
      const currentCount = universityMap.get(intern.university) || 0
      universityMap.set(intern.university, currentCount + 1)
    }
  })
  
  const universityData = Array.from(universityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#eab308', '#ef4444', '#ec489a']

  if (interns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Add interns to see charts and analytics
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Intern Pipeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6">
              {stageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {universityData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Universities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={universityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent = 0 }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {universityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
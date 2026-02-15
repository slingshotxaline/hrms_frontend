'use client'

import { useState } from 'react'
import { apiCall } from '@/lib/api'
import Button from '@/components/common/Button'
import { FileText, Download, Calendar } from 'lucide-react'

export default function LateDeductionReport() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await apiCall(`/lates/report/${month}`)
      setReport(data)
    } catch (error) {
      alert('Error generating report: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!report) return

    const headers = [
      'Employee Code',
      'Name',
      'Department',
      'Total Lates',
      'Approved Lates',
      'Deductible Lates',
      'Salary Deduction',
      'Leave Deduction'
    ]

    const rows = report.report.map(r => [
      r.employee.employeeCode,
      `${r.employee.firstName} ${r.employee.lastName}`,
      r.employee.department,
      r.summary.totalLates,
      r.summary.approvedLates,
      r.summary.deductibleLates,
      r.summary.totalSalaryDeduction,
      r.summary.totalLeaveDeduction,
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `late-deduction-report-${month}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Late Deduction Report</h2>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleGenerate} disabled={loading}>
            <FileText className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          {report && (
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Report */}
      {report && (
        <div>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900">{report.totalEmployeesWithLates}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Total Salary Deducted</p>
              <p className="text-2xl font-bold text-red-900">
                ৳{report.report.reduce((sum, r) => sum + r.summary.totalSalaryDeduction, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Total Leave Deducted</p>
              <p className="text-2xl font-bold text-orange-900">
                {report.report.reduce((sum, r) => sum + r.summary.totalLeaveDeduction, 0)} days
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Department</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Total Lates</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Deductible</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Salary Deduction</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Leave Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.report.map((r) => (
                  <tr key={r.employee._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold">{r.employee.firstName} {r.employee.lastName}</p>
                        <p className="text-xs text-gray-500">{r.employee.employeeCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.employee.department}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        {r.summary.totalLates}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {r.summary.deductibleLates}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                      ৳{r.summary.totalSalaryDeduction.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">
                      {r.summary.totalLeaveDeduction} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
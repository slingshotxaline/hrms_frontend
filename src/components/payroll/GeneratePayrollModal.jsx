'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { Plus, AlertCircle, Calendar, CheckCircle } from 'lucide-react'

export default function GeneratePayrollModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }))
    setError('')
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      console.log('💰 Generating payroll...')
      
      const response = await apiCall('/payroll/generate', {
        method: 'POST',
        body: JSON.stringify({
          month: formData.month,
          year: formData.year,
          regenerate: false, // This is for new generation
        }),
      })

      console.log('✅ Payroll generated:', response)
      setResult(response)

      // Show success message
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (error) {
      console.error('❌ Error generating payroll:', error)
      setError(error.message || 'Failed to generate payroll')
    } finally {
      setLoading(false)
    }
  }

  const selectedDate = new Date(formData.year, formData.month - 1, 1)

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Generate Payroll"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Info Message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Payroll Generation Process
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                This will generate payroll for all active employees for the selected month.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li>Calculates salary based on attendance records</li>
                <li>Applies deductions for absents, half days, and lates</li>
                <li>Includes overtime calculations</li>
                <li>Uses current late management settings</li>
                <li>Deducts leaves or salary based on late rules</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Month & Year Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month <span className="text-red-500">*</span>
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Month Display */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center gap-2 text-indigo-900">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Generating payroll for:</span>
            <span className="text-lg font-bold">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Warning for existing payroll */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Note:</p>
              <p>
                If payroll already exists for this month, it will be skipped. 
                Use the &quot;Regenerate&quot; feature to update existing payroll records.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-2">{result.message}</p>
                {result.summary && (
                  <div className="space-y-1">
                    <p>✓ Total Records: {result.summary.total}</p>
                    <p>✓ New: {result.summary.new}</p>
                    {result.summary.regenerated > 0 && (
                      <p>✓ Regenerated: {result.summary.regenerated}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* What Will Be Calculated */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Payroll Components:
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Basic Salary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Allowances (HRA, Medical, Transport)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Overtime Pay (1.5x rate)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">−</span>
              <span>Absent Deductions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">−</span>
              <span>Half Day Deductions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">−</span>
              <span>Late Deductions (Salary/Leave)</span>
            </div>
          </div>
        </div>

        {/* Late Deduction Info */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-900 mb-2">
            Late Management Rules Applied:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
            <li>First 2 lates/month: No deduction (grace period)</li>
            <li>3rd & 4th late: 1 day deduction each</li>
            <li>5th+ late: Per-day deduction</li>
            <li>Approved lates: No deduction</li>
            <li>Deduction preference: Leave first, then salary</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || result}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : result ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Generated!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate Payroll
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
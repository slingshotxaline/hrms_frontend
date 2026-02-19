'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { RefreshCw, AlertCircle, Calendar } from 'lucide-react'

export default function RegeneratePayrollModal({ onClose, onSuccess, payroll, selectedMonth }) {
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isBulk, setIsBulk] = useState(!payroll)

  useEffect(() => {
    if (payroll) {
      // Single payroll regeneration
      const date = new Date(payroll.month)
      setFormData({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        reason: '',
      })
      setIsBulk(false)
    } else if (selectedMonth) {
      // Bulk regeneration with pre-selected month
      const [year, month] = selectedMonth.split('-')
      setFormData({
        month: parseInt(month),
        year: parseInt(year),
        reason: '',
      })
      setIsBulk(true)
    } else {
      // Default to current month
      const now = new Date()
      setFormData({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        reason: '',
      })
      setIsBulk(true)
    }
  }, [payroll, selectedMonth])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.reason.trim()) {
      setError('Please provide a reason for regeneration')
      return
    }

    if (formData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      if (isBulk) {
        // Regenerate all payrolls for the month
        console.log('🔄 Regenerating all payrolls...')
        
        await apiCall('/payroll/generate', {
          method: 'POST',
          body: JSON.stringify({
            month: formData.month,
            year: formData.year,
            regenerate: true,
            reason: formData.reason,
          }),
        })

        alert('All payrolls regenerated successfully!')
      } else {
        // Regenerate single employee payroll
        console.log(`🔄 Regenerating payroll for employee ${payroll.employee._id}...`)
        
        await apiCall(`/payroll/regenerate/${payroll.employee._id}`, {
          method: 'POST',
          body: JSON.stringify({
            month: formData.month,
            year: formData.year,
            reason: formData.reason,
          }),
        })

        alert('Payroll regenerated successfully!')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Error regenerating payroll:', error)
      setError(error.message || 'Failed to regenerate payroll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={isBulk ? "Regenerate All Payrolls" : "Regenerate Employee Payroll"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Warning Message */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-orange-900 mb-1">
                Important: Payroll Regeneration
              </h4>
              <p className="text-sm text-orange-700 mb-2">
                {isBulk 
                  ? 'This will regenerate payroll for ALL employees for the selected month.'
                  : `This will regenerate payroll for ${payroll?.employee?.firstName} ${payroll?.employee?.lastName}.`
                }
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                <li>All calculations will be recalculated based on current data</li>
                <li>Attendance, leaves, and late deductions will be refreshed</li>
                <li>Previous version will be saved in regeneration history</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Employee Info (for single regeneration) */}
        {!isBulk && payroll && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Employee Details:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {payroll.employee.firstName} {payroll.employee.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Code:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {payroll.employee.employeeCode}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Current Net Salary:</span>
                <span className="ml-2 font-semibold text-green-600">
                  ৳{payroll.netSalary?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  v{payroll.version || 1}
                </span>
              </div>
            </div>
            {payroll.isRegenerated && (
              <p className="text-xs text-orange-600 mt-2 font-medium">
                ⚠️ This payroll has been regenerated {payroll.regenerationHistory?.length || 0} time(s)
              </p>
            )}
          </div>
        )}

        {/* Month & Year */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month <span className="text-red-500">*</span>
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
              disabled={!isBulk}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
              disabled={!isBulk}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Regeneration <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="E.g., Salary adjustment, attendance correction, late approval changes, overtime recalculation..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.reason.length}/500 characters
          </p>
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

        {/* What Will Be Recalculated */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            What will be recalculated:
          </h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Attendance records (present, absent, half days)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Late deductions (based on current late settings)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Leave deductions</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Overtime calculations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Basic salary (if changed in employee record)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Allowances</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Net salary</span>
            </li>
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
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Payroll
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
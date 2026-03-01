'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { Clock, AlertCircle } from 'lucide-react'

export default function ApplyHalfDayModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    halfDayDate: new Date().toISOString().split('T')[0],
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.reason.trim().length < 10) {
      setError('Reason must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      await apiCall('/leaves', {
        method: 'POST',
        body: JSON.stringify({
          leaveType: 'Half Day',
          startDate: formData.halfDayDate,
          endDate: formData.halfDayDate,
          reason: formData.reason,
          isHalfDay: true,
          halfDayDate: formData.halfDayDate,
        }),
      })

      alert('Half day leave applied successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to apply half day leave')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Apply for Half Day Leave" size="lg">
      <form onSubmit={handleSubmit}>
        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Half Day Leave Policy
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Punch after 11:00 AM automatically marks as half day</li>
                <li>• You can also apply for planned half day leave</li>
                <li>• 2 half days = 1 day annual leave or 1 day salary deduction</li>
                <li>• Approved half days won&apos;t be deducted</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Half Day Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="halfDayDate"
            value={formData.halfDayDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide a reason for half day leave (minimum 10 characters)"
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
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
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

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
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Applying...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Apply Half Day
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
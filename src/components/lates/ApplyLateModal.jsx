'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { Clock, Calendar, AlertCircle } from 'lucide-react'

export default function ApplyLateModal({ attendances, onClose, onSubmit }) {
  const [selectedAttendance, setSelectedAttendance] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedAttendance) {
      setError('Please select a late attendance')
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason')
      return
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      await apiCall('/lates', {
        method: 'POST',
        body: JSON.stringify({
          attendanceId: selectedAttendance,
          reason: reason.trim(),
        }),
      })

      alert('Late application submitted successfully!')
      onSubmit()
      onClose()
    } catch (error) {
      console.error('Error applying for late:', error)
      setError(error.message || 'Failed to submit late application')
    } finally {
      setLoading(false)
    }
  }

  const selectedAtt = attendances.find(a => a._id === selectedAttendance)

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Apply for Late Approval"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Info Message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Late Deduction Rules:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>First 2 lates/month:</strong> No deduction (grace period)</li>
                <li><strong>3rd & 4th late:</strong> 1 day salary OR 1 earned leave deducted</li>
                <li><strong>5th+ late:</strong> Per-day salary OR 1 earned leave per late</li>
                <li><strong>If approved:</strong> No deduction will be applied</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Select Late Attendance */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Late Attendance <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedAttendance}
            onChange={(e) => setSelectedAttendance(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">-- Select a late day --</option>
            {attendances.map((att) => (
              <option key={att._id} value={att._id}>
                {new Date(att.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} - Late by {att.lateMinutes} minutes
              </option>
            ))}
          </select>
        </div>

        {/* Selected Attendance Details */}
        {selectedAtt && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-900 mb-3">Selected Late Details:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {new Date(selectedAtt.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">In Time:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {new Date(selectedAtt.inTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Late By:</span>
                <span className="ml-2 font-bold text-red-600">
                  {selectedAtt.lateMinutes} minutes
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-semibold text-yellow-700">
                  {selectedAtt.timingStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Late <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError('')
            }}
            placeholder="Please explain why you were late (e.g., traffic jam, family emergency, etc.)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {reason.length}/500 characters
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

        {/* Approval Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium mb-1">Approval Process:</p>
              <p>Your late application will be sent to your reporting manager, HR, and Admin for approval. If approved, no deduction will be applied.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
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
                Submitting...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
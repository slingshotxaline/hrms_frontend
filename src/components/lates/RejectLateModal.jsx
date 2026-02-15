'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { XCircle, AlertCircle } from 'lucide-react'

export default function RejectLateModal({ onClose, onConfirm }) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    if (rejectionReason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters')
      return
    }

    onConfirm(rejectionReason)
  }

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Reject Late Application"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                Important: Rejection Reason Required
              </h4>
              <p className="text-sm text-red-700">
                Please provide a clear and professional reason for rejecting this late application. 
                The employee will see this reason and the late will be subject to deduction.
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value)
              setError('')
            }}
            placeholder="E.g., Reason not valid, repeated late arrivals without valid cause, etc."
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          
          {error && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-2">
            {rejectionReason.length}/500 characters
          </p>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Note:</p>
              <p>If rejected, this late will be counted for salary/leave deduction based on the late management rules.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Late
          </Button>
        </div>
      </form>
    </Modal>
  )
}
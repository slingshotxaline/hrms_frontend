'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { DollarSign, AlertCircle, Plus, Minus } from 'lucide-react'

export default function PayrollAdjustmentModal({ payroll, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    adjustmentType: 'addition', // 'addition' or 'deduction'
    amount: '',
    description: '',
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

    const amount = parseFloat(formData.amount)

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    if (formData.description.trim().length < 5) {
      setError('Description must be at least 5 characters')
      return
    }

    setLoading(true)

    try {
      // Convert to positive or negative based on type
      const finalAmount = formData.adjustmentType === 'addition' ? amount : -amount

      await apiCall(`/payroll/${payroll._id}/adjustment`, {
        method: 'POST',
        body: JSON.stringify({
          amount: finalAmount,
          description: formData.description.trim(),
        }),
      })

      alert(`Adjustment ${formData.adjustmentType === 'addition' ? 'added' : 'deducted'} successfully!`)
      onSuccess()
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to add adjustment')
    } finally {
      setLoading(false)
    }
  }

  // Calculate what the new net salary would be
  const currentNetSalary = payroll.netSalary || 0
  const adjustmentAmount = parseFloat(formData.amount) || 0
  const newNetSalary = formData.adjustmentType === 'addition' 
    ? currentNetSalary + adjustmentAmount 
    : currentNetSalary - adjustmentAmount

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Add Salary Adjustment"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Employee Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Payroll Details:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Employee:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {payroll.employee?.firstName} {payroll.employee?.lastName}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Code:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {payroll.employee?.employeeCode}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Month:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {new Date(payroll.month).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Current Net Salary:</span>
              <span className="ml-2 font-semibold text-green-600">
                ৳{currentNetSalary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Show existing adjustments if any */}
          {payroll.adjustments && payroll.adjustments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                Existing Adjustments: {payroll.adjustments.length}
              </p>
              <p className="text-xs text-blue-700">
                Total: {payroll.totalAdjustments >= 0 ? '+' : ''}৳{payroll.totalAdjustments.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Adjustment Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjustment Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'addition' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.adjustmentType === 'addition'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              <Plus className={`w-6 h-6 mx-auto mb-2 ${
                formData.adjustmentType === 'addition' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                formData.adjustmentType === 'addition' ? 'text-green-700' : 'text-gray-600'
              }`}>
                Addition
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Add to salary
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'deduction' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.adjustmentType === 'deduction'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              <Minus className={`w-6 h-6 mx-auto mb-2 ${
                formData.adjustmentType === 'deduction' ? 'text-red-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                formData.adjustmentType === 'deduction' ? 'text-red-700' : 'text-gray-600'
              }`}>
                Deduction
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Deduct from salary
              </p>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (৳) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter adjustment amount"
            min="0"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="E.g., Bonus for exceptional performance, Penalty for late submission, etc."
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/200 characters (minimum 5)
          </p>
        </div>

        {/* Preview New Salary */}
        {formData.amount && parseFloat(formData.amount) > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${
            formData.adjustmentType === 'addition' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-sm font-semibold mb-2 text-gray-900">
              Preview:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Current Net Salary:</span>
                <span className="font-semibold">৳{currentNetSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={formData.adjustmentType === 'addition' ? 'text-green-700' : 'text-red-700'}>
                  {formData.adjustmentType === 'addition' ? 'Addition:' : 'Deduction:'}
                </span>
                <span className={`font-semibold ${
                  formData.adjustmentType === 'addition' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.adjustmentType === 'addition' ? '+' : '-'}৳{adjustmentAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between">
                <span className="font-bold text-gray-900">New Net Salary:</span>
                <span className={`font-bold text-lg ${
                  newNetSalary >= currentNetSalary ? 'text-green-600' : 'text-red-600'
                }`}>
                  ৳{newNetSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This adjustment will be added to the payroll record</li>
                <li>The net salary will be recalculated automatically</li>
                <li>This action can be undone by admin if needed</li>
                <li>Please provide a clear description for audit purposes</li>
              </ul>
            </div>
          </div>
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
            className={
              formData.adjustmentType === 'addition'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                {formData.adjustmentType === 'addition' ? 'Add' : 'Deduct'} ৳{adjustmentAmount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { apiCall } from '@/lib/api'
import { Settings, AlertCircle } from 'lucide-react'

export default function LateSettingsModal({ onClose, onUpdate }) {
  const [settings, setSettings] = useState({
    deductionPreference: 'Leave',
    graceDaysPerMonth: 2,
    lateThresholdMinutes: 1,
    autoApproveUnder: 0,
    isEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await apiCall('/lates/settings/config')
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await apiCall('/lates/settings/config', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })

      alert('Settings updated successfully!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating settings:', error)
      setError(error.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Late Management Settings" size="lg">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Late Management Settings" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Late Management System</h3>
            <p className="text-sm text-gray-600">Enable or disable late tracking and deductions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isEnabled"
              checked={settings.isEnabled}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Deduction Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deduction Preference <span className="text-red-500">*</span>
          </label>
          <select
            name="deductionPreference"
            value={settings.deductionPreference}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="Leave">Deduct Leave First (then Salary if no leave)</option>
            <option value="Salary">Always Deduct Salary</option>
            <option value="Manual">Manual (Admin decides per case)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {settings.deductionPreference === 'Leave' && 'Will deduct earned leave first, then salary if leave balance is exhausted'}
            {settings.deductionPreference === 'Salary' && 'Will always deduct from basic salary'}
            {settings.deductionPreference === 'Manual' && 'Admin will manually decide for each late case'}
          </p>
        </div>

        {/* Grace Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grace Days Per Month <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="graceDaysPerMonth"
            value={settings.graceDaysPerMonth}
            onChange={handleChange}
            min="0"
            max="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of late days per month that won&apos;t incur any deduction (currently: <strong>{settings.graceDaysPerMonth}</strong>)
          </p>
        </div>

        {/* Late Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Late Threshold (Minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="lateThresholdMinutes"
            value={settings.lateThresholdMinutes}
            onChange={handleChange}
            min="1"
            max="60"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum minutes late to count as &quot;late&quot; (currently: <strong>{settings.lateThresholdMinutes}+</strong> minutes)
          </p>
        </div>

        {/* Auto Approve */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-Approve Under (Minutes)
          </label>
          <input
            type="number"
            name="autoApproveUnder"
            value={settings.autoApproveUnder}
            onChange={handleChange}
            min="0"
            max="30"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-approve late applications if late is less than this many minutes (0 = disabled)
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Current Rules Summary:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>First <strong>{settings.graceDaysPerMonth}</strong> lates/month: No deduction</li>
                <li>3rd & beyond: {settings.deductionPreference === 'Leave' ? 'Deduct leave (or salary if no leave)' : 'Deduct salary'}</li>
                <li>Late threshold: <strong>{settings.lateThresholdMinutes}+</strong> minutes</li>
                <li>Approved lates: No deduction</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
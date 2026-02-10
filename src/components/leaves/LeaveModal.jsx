import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'

export default function LeaveModal({ employees, currentUser, isAdminOrHR, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    employeeId: currentUser?._id || employees[0]?._id || '',
    leaveType: 'CL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate dates
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End date cannot be before start date')
      return
    }

    onSubmit(formData)
  }

  const leaveTypeOptions = [
    { value: 'CL', label: 'Casual Leave (CL)' },
    { value: 'SL', label: 'Sick Leave (SL)' },
    { value: 'EL', label: 'Earned Leave (EL)' },
    { value: 'Unpaid', label: 'Unpaid Leave' },
  ]

  const employeeOptions = isAdminOrHR 
    ? employees.map(emp => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
      }))
    : [{ 
        value: currentUser._id, 
        label: `${currentUser.firstName} ${currentUser.lastName}` 
      }]

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      return days > 0 ? days : 0
    }
    return 0
  }

  const days = calculateDays()

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Apply for Leave"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        {isAdminOrHR ? (
          <Select
            label="Employee"
            options={employeeOptions}
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Applying leave for:</strong> {currentUser.firstName} {currentUser.lastName}
            </p>
          </div>
        )}

        <Select
          label="Leave Type"
          options={leaveTypeOptions}
          value={formData.leaveType}
          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />

          <Input
            label="End Date"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        {days > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-800">
              <strong>Duration:</strong> {days} {days === 1 ? 'day' : 'days'}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-black mb-2">Reason</label>
          <textarea
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Please provide a reason for your leave..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Leave Request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
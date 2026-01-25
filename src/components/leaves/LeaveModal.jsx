import { useState } from 'react'
import Modal from '@/components/common/Modal' 
import Input from '@/components/common/Input' 
import Select from '@/components/common/Select' 
import Button from '@/components/common/Button'

export default function LeaveModal({ employees, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    employeeId: employees[0]?._id || '',
    leaveType: 'CL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const leaveTypeOptions = [
    { value: 'CL', label: 'Casual Leave' },
    { value: 'SL', label: 'Sick Leave' },
    { value: 'EL', label: 'Earned Leave' },
    { value: 'Unpaid', label: 'Unpaid Leave' },
  ]

  const employeeOptions = employees.map(emp => ({
    value: emp._id,
    label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
  }))

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Apply for Leave"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Employee"
          options={employeeOptions}
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
        />

        <Select
          label="Leave Type"
          options={leaveTypeOptions}
          value={formData.leaveType}
          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
        />

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason
          </label>
          <textarea
            required
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  )
}
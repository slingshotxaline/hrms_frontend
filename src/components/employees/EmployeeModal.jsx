import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function EmployeeModal({ employee, onClose, onSave }) {
  const [formData, setFormData] = useState(
    employee || {
      employeeCode: '',
      firstName: '',
      lastName: '',
      department: '',
      designation: '',
      joiningDate: '',
      basicSalary: '',
      allowances: { houseRent: 0, medical: 0, transport: 0 },
      shiftStart: '09:00',
      shiftEnd: '18:00',
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Employee Code"
            type="text"
            required
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
          />

          <Input
            label="First Name"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />

          <Input
            label="Last Name"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />

          <Input
            label="Department"
            type="text"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <Input
            label="Designation"
            type="text"
            required
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <Input
            label="Joining Date"
            type="date"
            required
            value={formData.joiningDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
          />

          <Input
            label="Basic Salary"
            type="number"
            required
            value={formData.basicSalary}
            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
          />

          <Input
            label="House Rent Allowance"
            type="number"
            value={formData.allowances?.houseRent || 0}
            onChange={(e) => setFormData({
              ...formData,
              allowances: { ...formData.allowances, houseRent: Number(e.target.value) }
            })}
          />

          <Input
            label="Medical Allowance"
            type="number"
            value={formData.allowances?.medical || 0}
            onChange={(e) => setFormData({
              ...formData,
              allowances: { ...formData.allowances, medical: Number(e.target.value) }
            })}
          />

          <Input
            label="Transport Allowance"
            type="number"
            value={formData.allowances?.transport || 0}
            onChange={(e) => setFormData({
              ...formData,
              allowances: { ...formData.allowances, transport: Number(e.target.value) }
            })}
          />

          <Input
            label="Shift Start"
            type="time"
            value={formData.shiftStart}
            onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
          />

          <Input
            label="Shift End"
            type="time"
            value={formData.shiftEnd}
            onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {employee ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { Users } from 'lucide-react'

export default function BulkAssignModal({ employees, managers, onClose, onAssign }) {
  const [selectedManager, setSelectedManager] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState([])

  const handleToggleEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    )
  }

  const handleToggleAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(employees.map(e => e._id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedManager) {
      alert('Please select a manager')
      return
    }
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee')
      return
    }
    onAssign(selectedManager, selectedEmployees)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Bulk Assign to Manager" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manager Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Manager
          </label>
          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">-- Select a Manager --</option>
            {managers.map(manager => (
              <option key={manager._id} value={manager._id}>
                {manager.name} ({manager.role})
              </option>
            ))}
          </select>
        </div>

        {/* Employee Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Employees ({selectedEmployees.length} selected)
            </label>
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {employees.map(emp => (
              <div
                key={emp._id}
                onClick={() => handleToggleEmployee(emp._id)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedEmployees.includes(emp._id) ? 'bg-indigo-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp._id)}
                  onChange={() => {}}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{emp.name}</p>
                  <p className="text-sm text-gray-600">
                    {emp.email} • {emp.employeeId?.employeeCode || 'No Code'}
                  </p>
                </div>
                {emp.reportsTo && (
                  <span className="text-xs text-gray-500">
                    Currently: {emp.reportsTo.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <Users className="w-4 h-4 mr-2 inline" />
            Assign {selectedEmployees.length} Employees
          </Button>
        </div>
      </form>
    </Modal>
  )
}
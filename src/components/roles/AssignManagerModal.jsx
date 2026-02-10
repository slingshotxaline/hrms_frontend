import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { UserPlus } from 'lucide-react'

export default function AssignManagerModal({ user, managers, onClose, onAssign }) {
  const [selectedManager, setSelectedManager] = useState(user.reportsTo?._id || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedManager) {
      alert('Please select a manager')
      return
    }
    onAssign(user._id, selectedManager)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Assign Manager" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Assigning manager for:</strong> {user.name}
          </p>
          <p className="text-sm text-blue-600 mt-1">{user.email} • {user.role}</p>
        </div>

        {/* Manager Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
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
                {manager.name} ({manager.role}) - {manager.employeeId?.employeeCode || 'No Code'}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <UserPlus className="w-4 h-4 mr-2 inline" />
            Assign Manager
          </Button>
        </div>
      </form>
    </Modal>
  )
}
import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'

export default function HolidayModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'Government',
    isPaid: true,
    description: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const typeOptions = [
    { value: 'Government', label: 'Government' },
    { value: 'Religious', label: 'Religious' },
    { value: 'Company', label: 'Company' },
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add Holiday"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Holiday Name"
          type="text"
          required
          placeholder="e.g., Independence Day"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Date"
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />

        <Select
          label="Type"
          options={typeOptions}
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPaid"
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            checked={formData.isPaid}
            onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
          />
          <label htmlFor="isPaid" className="text-sm font-medium text-black">
            Paid Holiday
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Description (Optional)
          </label>
          <textarea
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Add any additional details..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Holiday
          </Button>
        </div>
      </form>
    </Modal>
  )
}
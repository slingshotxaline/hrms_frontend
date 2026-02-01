import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { AlertCircle } from 'lucide-react'

export default function MarkAttendanceModal({ employees, myEmployee, canSeeAll, onClose, onMark }) {
  // Everyone can only mark their own attendance
  const employeeToMark = myEmployee

  if (!employeeToMark) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Mark Attendance" size="md">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-700">No employee record found. Contact HR to create your employee profile.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Mark Attendance" size="md">
      <div className="space-y-6">
        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Marking Attendance For:</p>
              <p className="text-sm text-blue-700 mt-1">
                {employeeToMark.firstName} {employeeToMark.lastName} ({employeeToMark.employeeCode})
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
            <div>
              <p className="font-semibold text-gray-900 text-lg">Clock In</p>
              <p className="text-sm text-gray-600 mt-1">Mark your arrival time</p>
            </div>
            <Button
              onClick={() => {
                onMark(employeeToMark.employeeCode, 'IN')
                onClose()
              }}
              variant="success"
              className="px-8"
            >
              IN
            </Button>
          </div>

          <div className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
            <div>
              <p className="font-semibold text-gray-900 text-lg">Clock Out</p>
              <p className="text-sm text-gray-600 mt-1">Mark your departure time</p>
            </div>
            <Button
              onClick={() => {
                onMark(employeeToMark.employeeCode, 'OUT')
                onClose()
              }}
              variant="danger"
              className="px-8"
            >
              OUT
            </Button>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">Current Time</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}